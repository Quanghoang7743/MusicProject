import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Search } from 'lucide-react';
import genreService from '../../services/genreService';
import { getImageUrl } from '../../utils/imageHelper';
import Footer from '../../components/Footer';
import songService from '../../services/songService';
import { useFavorites } from '../FavouritePage/FavouritePage';
import { Heart } from 'lucide-react';

const ViewSongs = () => {
  const { genreId } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState(null);
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const itemsPerPage = 6;

  useEffect(() => {
    const fetchGenreAndSongs = async () => {
      try {
        setLoading(true);

        // 🔍 DEBUG: Log what ID we received
        console.log('ViewSongs - Received genreId from URL:', genreId);
        console.log('ViewSongs - Type of genreId:', typeof genreId);

        // Fetch genre details
        const genreData = await genreService.getById(genreId);

        // 🔍 DEBUG: Log genre data received
        console.log('ViewSongs - Genre data received:', genreData);

        setGenre(genreData);

        // Fetch songs for this genre
        const songsResponse = await songService.getByGenre(genreId, { limit: 100 });
        const songsData = songsResponse.items || songsResponse || [];

        // 🔍 DEBUG: Log songs data
        console.log(`ViewSongs - Found ${songsData.length} songs for genre:`, genreData?.name);

        // Transform songs data
        const transformedSongs = songsData.map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
          coverArt: getImageUrl(song.thumbnailUrl, 'song'),
          duration: formatDuration(song.durationSeconds),
          plays: song.playCount || 0
        }));

        setSongs(transformedSongs);
      } catch (error) {
        console.error('Error fetching genre and songs:', error);
        console.error('Error details:', {
          genreId,
          errorMessage: error.message,
          errorStack: error.stack
        });
        setGenre(null);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };

    if (genreId) {
      fetchGenreAndSongs();
    } else {
      console.error('ViewSongs - No genreId provided!');
      setLoading(false);
    }
  }, [genreId]);

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handlePageChange = (direction) => {
    setCurrentPage(prev => Math.max(0, prev + direction));
  };

  const handleSongClick = (songId) => {
    navigate(`/song/${songId}`);
  };

  // Filter songs based on search query
  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
  const startIdx = currentPage * itemsPerPage;
  const visibleSongs = filteredSongs.slice(startIdx, startIdx + itemsPerPage);

  if (loading) {
    return (
      <main className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 bg-[#0B1221] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading songs...</p>
          {/* 🔍 DEBUG: Show which genre ID we're loading */}
          <p className="text-slate-600 text-xs mt-2">Genre ID: {genreId}</p>
        </div>
      </main>
    );
  }

  if (!genre) {
    return (
      <main className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 bg-[#0B1221] min-h-screen">
        <div className="text-center mt-20">
          <h1 className="text-2xl font-bold text-white mb-4">Genre not found</h1>
          <p className="text-slate-400 mb-4">Could not load genre with ID: {genreId}</p>
          <button
            onClick={() => navigate('/genres')}
            className="px-6 py-3 bg-cyan-500 rounded-lg text-white hover:bg-cyan-400 transition"
          >
            Back to Genres
          </button>
        </div>
      </main>
    );
  }

  const parseDurationToSeconds = (durationStr) => {
    if (!durationStr) return 0;
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
  };

  return (
    <main className="pt-24 pb-0 px-4 sm:px-6 lg:px-8 bg-[#0B1221] min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate('/genres')}
        className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Genres
      </button>

      {/* Header with search bar */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl font-bold text-white">{genre.name}</h1>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          {/* Search box */}
          <div className="relative w-full lg:max-w-md">
            <input
              type="text"
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0); // Reset to first page on search
              }}
              className="w-full bg-slate-800/50 border border-cyan-500/30 rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-cyan-400 text-sm text-white placeholder:text-slate-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400">
              <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Song count */}
          <div className="text-slate-400 text-sm">
            {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'} found
          </div>
        </div>
      </div>

      {/* Songs Section */}
      {filteredSongs.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎵</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? 'No songs match your search' : 'No songs available'}
          </h2>
          <p className="text-slate-400">
            {searchQuery ? 'Try different keywords' : 'Check back later for new music!'}
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {genre.name} Songs
            </h2>
          </div>

          <div className="relative">
            {/* Navigation buttons (hidden on mobile) */}
            {totalPages > 1 && (
              <>
                <button
                  onClick={() => handlePageChange(-1)}
                  disabled={currentPage === 0}
                  className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-slate-800/90 hover:bg-slate-700 rounded-full items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage >= totalPages - 1}
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-slate-800/90 hover:bg-slate-700 rounded-full items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {visibleSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => handleSongClick(song.id)}
                  className="bg-slate-800/40 rounded-xl p-4 hover:bg-slate-800/60 transition cursor-pointer group border border-cyan-500/10"
                >
                  <div className="relative mb-3">
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center">
                      <img
                        src={song.coverArt}
                        alt={song.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* ✅ ADD HEART BUTTON HERE */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite({
                            id: song.id,
                            title: song.title,
                            artists: song.artist.split(', ').map(name => ({ name })),
                            thumbnailUrl: song.coverArt,
                            durationSeconds: parseDurationToSeconds(song.duration)
                          });
                        }}
                        className="absolute top-2 right-2 p-2 bg-slate-900/80 rounded-full hover:bg-slate-800 z-10 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Heart
                          className={`w-4 h-4 ${isFavorite(song.id) ? 'fill-red-500 text-red-500' : 'text-white'
                            }`}
                        />
                      </button>

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
                      <button className="absolute bottom-2 right-2 w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-cyan-400">
                        <Play className="w-5 h-5 ml-0.5" fill="white" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium text-white text-sm mb-1 truncate group-hover:text-cyan-400 transition">
                    {song.title}
                  </h3>
                </div>
              ))}
            </div>

            {/* Mobile pagination dots */}
            {totalPages > 1 && (
              <div className="flex md:hidden justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-2 h-2 rounded-full transition ${idx === currentPage ? 'bg-cyan-400 w-6' : 'bg-slate-600'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <br></br>
      <Footer />
    </main>
  );
};

export default ViewSongs;