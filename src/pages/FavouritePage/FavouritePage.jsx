import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Heart, Play, Music, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Footer from '../../components/Footer';
import userService from '../../services/userService';
import favouritesService from '../../services/favouritesService';
import { playTrack } from '../../redux/slices/playerSlice';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('currentUser');
      const isAuth = !!(token && user);
      setIsAuthenticated(isAuth);
      setAuthToken(token);

      try {
        localStorage.removeItem('favorites');
        console.log('🧹 [FavoritesContext] Cleared localStorage favorites');
      } catch (e) {
        console.warn('Could not clear localStorage:', e);
      }

      return isAuth;
    };

    checkAuth();

    const handleAuthChanged = () => {
      console.log('🛰️ [FavoritesContext] authChanged/storage event received — re-checking auth');
      checkAuth();
    };

    window.addEventListener('authChanged', handleAuthChanged);
    window.addEventListener('storage', handleAuthChanged);

    return () => {
      window.removeEventListener('authChanged', handleAuthChanged);
      window.removeEventListener('storage', handleAuthChanged);
    };
  }, []);

  const loadFavorites = useCallback(async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.log('⚠️ [FavoritesContext] No auth token found');
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }

    try {
      setLoading(true);
      console.log('📡 [FavoritesContext] ========== FETCHING FAVORITES ==========');

      const response = await favouritesService.getAll();
      const favoriteSongs = response.items || [];

      console.log('✅ [FavoritesContext] Received favorites:', favoriteSongs.length, 'items');

      if (favoriteSongs.length > 0) {
        console.log('📋 [FavoritesContext] Sample song data:');
        favoriteSongs.slice(0, 2).forEach((song, idx) => {
          console.log(`  Song ${idx + 1}:`, {
            id: song.id,
            title: song.title,
            artists: song.artists,
            artistsType: Array.isArray(song.artists) ? 'array' : typeof song.artists,
            album: song.album,
            albumType: typeof song.album,
            genres: song.genres,
            genresType: Array.isArray(song.genres) ? 'array' : typeof song.genres
          });
        });
      }

      setFavorites(favoriteSongs);
      setFavoriteIds(new Set(favoriteSongs.map(f => f.id)));

      console.log('✅ [FavoritesContext] State updated with', favoriteSongs.length, 'favorites');

    } catch (error) {
      console.error('❌ [FavoritesContext] Error loading favorites:', error);
      setFavorites([]);
      setFavoriteIds(new Set());
    } finally {
      setLoading(false);
      console.log('📡 [FavoritesContext] ========== FETCH COMPLETE ==========');
    }
  }, []);

  useEffect(() => {
    if (authToken) {
      console.log('🔄 [FavoritesContext] Auth token changed, loading favorites');
      loadFavorites();
    } else {
      console.log('🚫 [FavoritesContext] No auth token, clearing favorites');
      setFavorites([]);
      setFavoriteIds(new Set());
    }
  }, [authToken, loadFavorites]);

  // Also reload favorites when the component becomes visible (page navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && authToken) {
        console.log('👁️ [FavoritesContext] Page became visible, reloading favorites');
        loadFavorites();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [authToken, loadFavorites]);

  const toggleFavorite = async (song) => {
    if (!song || !song.id) {
      console.error('❌ [FavoritesContext] Invalid song object:', song);
      return;
    }

    if (!isAuthenticated) {
      console.log('⚠️ [FavoritesContext] Not authenticated');
      alert('Please log in to add favorites');
      return;
    }

    const songId = song.id;
    const isCurrentlyFavorite = favoriteIds.has(songId);

    console.log('🔄 [FavoritesContext] toggleFavorite called:', {
      songId,
      songTitle: song.title,
      isCurrentlyFavorite
    });

    // Call API first, then update state based on result
    try {
      if (isCurrentlyFavorite) {
        // Remove from favorites
        await favouritesService.remove(songId);
        console.log('✅ [FavoritesContext] Removed from favorites via API');

        // Update state after successful API call
        setFavorites(prev => prev.filter(fav => fav.id !== songId));
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(songId);
          return newSet;
        });
      } else {
        // Add to favorites
        await favouritesService.add(songId);
        console.log('✅ [FavoritesContext] Added to favorites via API');

        // CRITICAL: Always reload ALL favorites after adding
        // This ensures we get complete data from backend with proper artists/album/genres
        console.log('🔄 [FavoritesContext] Reloading all favorites to get complete data...');

        // Small delay to ensure backend has processed the add
        await new Promise(resolve => setTimeout(resolve, 200));

        // Reload all favorites
        await loadFavorites();
      }
    } catch (error) {
      console.error('❌ [FavoritesContext] API call failed:', error);
      alert('Failed to update favorite. Please try again.');
    }
  };

  const isFavorite = useCallback((songId) => {
    return favoriteIds.has(songId);
  }, [favoriteIds]);

  const refreshFavorites = useCallback(() => {
    loadFavorites();
  }, [loadFavorites]);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      toggleFavorite,
      isFavorite,
      loading,
      refreshFavorites,
      isAuthenticated
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Helper function
function toMinutes(seconds) {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// Helper to safely get artist names
const getArtistDisplay = (artists) => {
  if (!artists || !Array.isArray(artists)) return 'Unknown Artist';
  if (artists.length === 0) return 'Unknown Artist';

  // Handle array of strings: ["Electric Storm"]
  if (typeof artists[0] === 'string') {
    return artists.join(', ');
  }

  // Handle array of objects: [{name: "Electric Storm"}]
  return artists.map(a => a.name || a).join(', ');
};

// Helper to safely get album display
const getAlbumDisplay = (album) => {
  if (!album) return 'Unknown Album';

  // Handle string: "Electric Pulse"
  if (typeof album === 'string') return album;

  // Handle object: {title: "Electric Pulse"}
  return album.title || album.name || 'Unknown Album';
};

// Helper to safely get genre display
const getGenreDisplay = (genres) => {
  if (!genres || !Array.isArray(genres) || genres.length === 0) return 'Unknown';

  // Handle array of strings: ["EDM"]
  if (typeof genres[0] === 'string') return genres[0];

  // Handle array of objects: [{name: "EDM"}]
  return genres[0].name || 'Unknown';
};

const FavouritePage = () => {
  const { favorites, toggleFavorite, loading, refreshFavorites, isAuthenticated } = useFavorites();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [pageKey, setPageKey] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination values
  const totalPages = Math.ceil(favorites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFavorites = favorites.slice(startIndex, endIndex);

  useEffect(() => {
    console.log('📄 [FavouritePage] Component mounted, forcing refresh');
    refreshFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [favorites.length, currentPage, totalPages]);

  useEffect(() => {
    let isMounted = true;

    const loadRecentlyPlayed = async () => {
      if (!isAuthenticated) {
        if (isMounted) setRecentLoading(false);
        return;
      }

      try {
        if (isMounted) setRecentLoading(true);
        const resp = await userService.getListenHistory({ limit: 6 });

        if (!isMounted) return; // Stop if component unmounted

        const data = Array.isArray(resp) ? resp : (resp.items || []);
        const serverTimestamp = resp.timestamp || null;

        // Sort newest-first by item.timestamp or fallback fields
        const sorted = (data || []).slice().sort((a, b) => {
          const aTime = new Date(a.timestamp || a.last_listen_at || a.createdAt || a.created_at || serverTimestamp || 0).getTime();
          const bTime = new Date(b.timestamp || b.last_listen_at || b.createdAt || b.created_at || serverTimestamp || 0).getTime();
          return bTime - aTime;
        }).slice(0, 6);

        const transformed = sorted.map(item => ({
          id: item.id,
          title: item.title,
          artist: getArtistDisplay(item.artists),
          coverArt: item.thumbnailUrl,
          durationSeconds: item.durationSeconds,
          originalData: item
        }));

        if (isMounted) setRecentlyPlayed(transformed);
      } catch (error) {
        console.error('Error loading listening history:', error);
      } finally {
        if (isMounted) setRecentLoading(false);
      }
    };

    loadRecentlyPlayed();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const renderCoverArt = (coverArt, title) => {
    if (
      typeof coverArt === "string" &&
      (coverArt.startsWith("/images") ||
        coverArt.includes("data:image") ||
        coverArt.includes("src") ||
        coverArt.includes("http"))
    ) {
      return (
        <img
          src={coverArt}
          alt={title}
          className="w-full h-full object-cover rounded-lg"
        />
      );
    }
    return <span className="text-3xl">🎵</span>;
  };

  const handlePlaySong = (song) => {
    dispatch(playTrack({
      track: song,
      playlist: favorites
    }));
  };

  const handlePlayRecent = (song) => {
    if (song.originalData) {
      dispatch(playTrack({
        track: song.originalData,
        playlist: recentlyPlayed.map(s => s.originalData).filter(Boolean)
      }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of favorites list
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="pt-20 sm:pt-24 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 lg:py-32">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 lg:w-16 lg:h-16 text-slate-600" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-300 mb-3">
              Login Required
            </h2>
            <p className="text-base lg:text-lg text-slate-500 mb-6 text-center max-w-md">
              Please log in to view your favorite songs
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full font-semibold transition"
            >
              Go to Login
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="pt-20 sm:pt-24 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-4 text-cyan-400 text-xl">Loading favorites...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <div className="pt-20 sm:pt-24 pb-0 px-4 sm:px-6 lg:px-8">
        <div className="max-w-full mx-auto">
          {/* HEADER */}
          <div className="mb-8 lg:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cyan-400 mb-1">
                  Your Favourites
                </h1>
                <p className="text-sm sm:text-base text-slate-400">
                  {favorites.length} {favorites.length === 1 ? 'song' : 'songs'}
                  {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                </p>
              </div>
            </div>
          </div>

          {/* EMPTY STATE */}
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 lg:py-32">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
                <Music className="w-12 h-12 lg:w-16 lg:h-16 text-slate-600" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-300 mb-3">
                No favourites yet
              </h2>
              <p className="text-base lg:text-lg text-slate-500 mb-6 text-center max-w-md">
                Start building your collection by adding songs you love
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full font-semibold transition"
              >
                Explore Music
              </button>
            </div>
          ) : (
            <>
              {/* TABLE HEADER (DESKTOP) */}
              <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 mb-2 text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5">Title</div>
                <div className="col-span-2">Album</div>
                <div className="col-span-2">Plays</div>
                <div className="col-span-1">Genre</div>
                <div className="col-span-1 text-right">Duration</div>
              </div>

              {/* SONGS LIST */}
              <div className="space-y-1 mb-8">
                {currentFavorites.map((song, index) => {
                  const globalIndex = startIndex + index;
                  return (
                    <div
                      key={song.id}
                      className="group bg-slate-900/40 hover:bg-slate-800/60 rounded-lg transition-all duration-200 cursor-pointer"
                      onClick={() => handlePlaySong(song)}
                    >
                      {/* DESKTOP */}
                      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center px-4 py-3">
                        <div className="col-span-1 text-center">
                          <span className="text-slate-400 group-hover:hidden">{globalIndex + 1}</span>
                          <button className="hidden group-hover:inline-flex items-center justify-center text-cyan-400 hover:text-cyan-300">
                            <Play className="w-4 h-4" fill="currentColor" />
                          </button>
                        </div>
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded overflow-hidden bg-slate-800">
                            {renderCoverArt(song.thumbnailUrl, song.title)}
                          </div>
                          <div>
                            <div className="font-medium text-white truncate">{song.title}</div>
                            <div className="text-sm text-slate-400 truncate">
                              {getArtistDisplay(song.artists)}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 text-sm text-slate-400 truncate">
                          {getAlbumDisplay(song.album)}
                        </div>
                        <div className="col-span-2 text-sm text-slate-400">
                          {song.playCount || song.play_count || 0} plays
                        </div>
                        <div className="col-span-1">
                          <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 inline-block">
                            {getGenreDisplay(song.genres)}
                          </span>
                        </div>
                        <div className="col-span-1 flex items-center justify-end gap-3">
                          <span className="text-sm text-slate-400">
                            {toMinutes(song.durationSeconds || song.duration_seconds)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(song);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          >
                            <Heart className="w-5 h-5 text-cyan-400 fill-cyan-400 hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>

                      {/* MOBILE / TABLET */}
                      <div className="lg:hidden flex items-center gap-3 p-3">
                        <div className="hidden sm:flex text-slate-400 font-medium w-8 text-center text-sm">
                          {globalIndex + 1}
                        </div>
                        <div className="relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-slate-800">
                          {renderCoverArt(song.thumbnailUrl, song.title)}
                          <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <Play className="w-6 h-6" fill="white" />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate text-sm">{song.title}</div>
                          <div className="text-xs text-slate-400 truncate">
                            {getArtistDisplay(song.artists)}
                          </div>
                          <div className="hidden sm:block text-xs text-slate-500 truncate mt-1">
                            {getAlbumDisplay(song.album)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-xs text-slate-400">
                            {toMinutes(song.durationSeconds || song.duration_seconds)}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(song);
                            }}
                            className="p-2"
                          >
                            <Heart className="w-5 h-5 text-cyan-400 fill-cyan-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mb-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-cyan-400" />
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      // Show first page, last page, current page, and pages around current
                      const showPage =
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                      // Show ellipsis
                      const showEllipsis =
                        (pageNum === currentPage - 2 && currentPage > 3) ||
                        (pageNum === currentPage + 2 && currentPage < totalPages - 2);

                      if (showEllipsis) {
                        return (
                          <span key={pageNum} className="px-2 text-slate-500">
                            ...
                          </span>
                        );
                      }

                      if (!showPage) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[40px] h-10 rounded-lg font-medium transition ${currentPage === pageNum
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-5 h-5 text-cyan-400" />
                  </button>
                </div>
              )}

              {/* RECENTLY PLAYED SECTION */}
              {recentlyPlayed.length > 0 && (
                <div className="mt-12 lg:mt-16">
                  <h2 className="text-xl lg:text-2xl font-bold text-cyan-400 mb-6">
                    Recently Played
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {recentlyPlayed.map((song, idx) => (
                      <div
                        key={`recent-${song.id}-${idx}`}
                        onClick={() => handlePlayRecent(song)}
                        className="group bg-slate-900/40 hover:bg-slate-800/60 rounded-lg p-4 transition cursor-pointer"
                      >
                        <div className="relative mb-3">
                          <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-4xl lg:text-5xl overflow-hidden">
                            {renderCoverArt(song.coverArt, song.title)}
                          </div>
                          <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center">
                              <Play className="w-5 h-5 ml-1" fill="white" />
                            </div>
                          </button>
                        </div>
                        <h3 className="font-medium text-white text-sm truncate mb-1">
                          {song.title}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">
                          {song.artist}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* RECENTLY PLAYED (WHEN NO FAVORITES) */}
          {favorites.length === 0 && recentlyPlayed.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl lg:text-2xl font-bold text-cyan-400 mb-6">
                Recently Played
              </h2>
              {recentLoading ? (
                <div className="text-center py-10">
                  <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {recentlyPlayed.map((song, idx) => (
                    <div
                      key={`recent-empty-${song.id}-${idx}`}
                      onClick={() => handlePlayRecent(song)}
                      className="group bg-slate-900/40 hover:bg-slate-800/60 rounded-lg p-4 transition cursor-pointer"
                    >
                      <div className="relative mb-3">
                        <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-4xl lg:text-5xl overflow-hidden">
                          {renderCoverArt(song.coverArt, song.title)}
                        </div>
                        <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center">
                            <Play className="w-5 h-5 ml-1" fill="white" />
                          </div>
                        </button>
                      </div>
                      <h3 className="font-medium text-white text-sm truncate mb-1">
                        {song.title}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">
                        {song.artist}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default FavouritePage;