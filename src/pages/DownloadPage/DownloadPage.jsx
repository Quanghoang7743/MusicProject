import { useState, useEffect } from "react";
import { Home, Speaker, Mic, Folder, Gem, Download, Heart, History, X, CheckCircle } from 'lucide-react';
import songService from '../../services/songService';
import favouritesService from '../../services/favouritesService';
import userService from '../../services/userService';
import { playTrack } from '../../redux/slices/playerSlice';
import { useFavorites } from '../FavouritePage/FavouritePage';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';

const DownloadPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [selected, setSelected] = useState(null);
  const [songs, setSongs] = useState([]);
  const [downloadNowSongs, setDownloadNowSongs] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadedSong, setDownloadedSong] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    setIsAuthenticated(!!(token && user));
  }, []);

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load songs for main table (10 songs)
      const songsResponse = await songService.getAll({ limit: 10 });
      const songsData = songsResponse.items || [];
      setSongs(songsData);

      // Load songs for "Download Now" section (6 songs from page 2)
      const downloadResponse = await songService.getAll({ limit: 6, page: 2 });
      const downloadData = downloadResponse.items || [];
      setDownloadNowSongs(downloadData);

      // Load recently played if authenticated
      if (isAuthenticated) {
        const recentResponse = await userService.getListenHistory({ limit: 6 });
        const recentData = Array.isArray(recentResponse) ? recentResponse : (recentResponse.items || []);

        // Sort by most recent
        const sorted = (recentData || []).slice().sort((a, b) => {
          const aTime = new Date(a.timestamp || a.last_listen_at || a.createdAt || a.created_at || 0).getTime();
          const bTime = new Date(b.timestamp || b.last_listen_at || b.createdAt || b.created_at || 0).getTime();
          return bTime - aTime;
        }).slice(0, 6);

        setRecentlyPlayed(sorted);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (song) => {
    setDownloadedSong(song);
    setShowDownloadModal(true);

    // Auto-close modal after 2 seconds
    setTimeout(() => {
      setShowDownloadModal(false);
    }, 2000);
  };

  const handleToggleFavorite = async (e, song) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in to add favorites');
      return;
    }
    await toggleFavorite(song);
  };

  const handlePlaySong = (song) => {
    dispatch(playTrack({
      track: song,
      playlist: songs
    }));
  };

  const toMinutes = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const getArtistDisplay = (artists) => {
    if (!artists || !Array.isArray(artists)) return 'Unknown Artist';
    if (artists.length === 0) return 'Unknown Artist';
    if (typeof artists[0] === 'string') return artists.join(', ');
    return artists.map(a => a.name || a).join(', ');
  };

  const getAlbumDisplay = (album) => {
    if (!album) return 'Unknown Album';
    if (typeof album === 'string') return album;
    return album.title || album.name || 'Unknown Album';
  };

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
    return (
      <div className="flex items-center justify-center text-5xl text-white">
        🎵
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-cyan-400 text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Download Success Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-cyan-500/30 shadow-2xl animate-[scale-in_0.2s_ease-out]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Download Started!</h3>
                <p className="text-sm text-slate-400">
                  {downloadedSong?.title} has been added to your downloads
                </p>
              </div>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-24 pb-0 px-4 md:px-6 lg:px-8">
        {/* Free Downloads Table */}
        <section className="mb-8">
          <h3 className="text-base md:text-lg font-semibold text-cyan-400 mb-4">Free Downloads</h3>

          {/* Desktop: Full Table */}
          <div className="hidden lg:block bg-slate-800/40 backdrop-blur-sm rounded-xl border border-cyan-500/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/60 text-slate-300 text-left border-b border-cyan-500/30">
                    <th className="w-12 py-3 px-4">#</th>
                    <th className="py-3 px-4">Song Title</th>
                    <th className="py-3 px-4">Album</th>
                    <th className="w-24 py-3 px-4 text-center">Duration</th>
                    <th className="w-32 py-3 px-4 text-center">Add to Favourites</th>
                    <th className="w-24 py-3 px-4 text-center">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map((song, index) => (
                    <tr
                      key={song.id}
                      className={`hover:bg-slate-700/40 cursor-pointer transition border-b border-slate-700/50 ${selected === song.id ? "bg-slate-700/50" : ""
                        }`}
                      onClick={() => handlePlaySong(song)}
                    >
                      <td className="py-4 px-4 text-slate-400">{String(index + 1).padStart(2, "0")}</td>
                      <td className="py-4 px-4">
                        <div className="font-medium">{song.title}</div>
                        <div className="text-xs text-slate-400">{getArtistDisplay(song.artists)}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-400">{getAlbumDisplay(song.album)}</td>
                      <td className="py-4 px-4 text-center text-slate-400">
                        {toMinutes(song.durationSeconds || song.duration_seconds)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={(e) => handleToggleFavorite(e, song)}
                          className={`transition ${isFavorite(song.id)
                            ? 'text-cyan-400'
                            : 'text-slate-400 hover:text-cyan-400'
                            }`}
                        >
                          <Heart className={`w-5 h-5 inline ${isFavorite(song.id) ? 'fill-cyan-400' : ''}`} />
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(song);
                          }}
                          className="text-slate-400 hover:text-cyan-400 transition"
                        >
                          <Download className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tablet: Compact Table */}
          <div className="hidden md:block lg:hidden bg-slate-800/40 backdrop-blur-sm rounded-xl border border-cyan-500/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/60 text-slate-300 text-left border-b border-cyan-500/30">
                    <th className="w-10 py-3 px-3">#</th>
                    <th className="py-3 px-3">Song Title</th>
                    <th className="py-3 px-3">Album</th>
                    <th className="w-20 py-3 px-3">Duration</th>
                    <th className="w-16 py-3 px-3 text-center">♡</th>
                    <th className="w-16 py-3 px-3 text-center">↓</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map((song, index) => (
                    <tr
                      key={song.id}
                      className="hover:bg-slate-700/40 cursor-pointer transition border-b border-slate-700/50"
                      onClick={() => handlePlaySong(song)}
                    >
                      <td className="py-3 px-3 text-slate-400">{String(index + 1).padStart(2, "0")}</td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-sm">{song.title}</div>
                        <div className="text-xs text-slate-400">{getArtistDisplay(song.artists)}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-sm">{getAlbumDisplay(song.album)}</td>
                      <td className="py-3 px-3 text-slate-400 text-sm">
                        {toMinutes(song.durationSeconds || song.duration_seconds)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => handleToggleFavorite(e, song)}
                          className={`transition ${isFavorite(song.id) ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'
                            }`}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite(song.id) ? 'fill-cyan-400' : ''}`} />
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(song);
                          }}
                          className="text-slate-400 hover:text-cyan-400"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: Card List */}
          <div className="md:hidden space-y-3">
            {songs.map((song, index) => (
              <div
                key={song.id}
                className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/20 hover:border-cyan-500/40 transition"
                onClick={() => handlePlaySong(song)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-slate-400 w-8 text-center">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{song.title}</div>
                    <div className="text-xs text-slate-400 truncate">{getArtistDisplay(song.artists)}</div>
                    <div className="text-xs text-slate-500 truncate">{getAlbumDisplay(song.album)}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => handleToggleFavorite(e, song)}
                      className={`transition ${isFavorite(song.id) ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'
                        }`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite(song.id) ? 'fill-cyan-400' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(song);
                      }}
                      className="text-slate-400 hover:text-cyan-400"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Download Now Section */}
        <section className="mb-8">
          <h4 className="text-cyan-400 font-semibold mb-4 text-lg">Download Now</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {downloadNowSongs.map((song) => (
              <div
                key={song.id}
                className="bg-slate-800/40 backdrop-blur-sm p-5 rounded-xl border border-slate-700 hover:border-cyan-500 transition cursor-pointer group"
                onClick={() => handlePlaySong(song)}
              >
                <div className="relative h-48 rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-cyan-500 to-blue-600">
                  {renderCoverArt(song.thumbnailUrl, song.title)}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => handleToggleFavorite(e, song)}
                      className={`p-2 rounded-full bg-slate-900/80 transition ${isFavorite(song.id) ? 'text-cyan-400' : 'text-white hover:text-cyan-400'
                        }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite(song.id) ? 'fill-cyan-400' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(song);
                      }}
                      className="p-2 rounded-full bg-slate-900/80 text-white hover:text-cyan-400 transition"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="text-base font-medium truncate">{song.title}</div>
                <div className="text-sm text-slate-400 truncate">{getArtistDisplay(song.artists)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <section>
            <h4 className="text-cyan-400 font-semibold mb-4 text-lg">Recently Played</h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {recentlyPlayed.map((song) => (
                <div
                  key={song.id}
                  className="rounded-xl overflow-hidden bg-slate-800/40 backdrop-blur-sm p-3 border border-slate-700 hover:border-cyan-500 transition cursor-pointer group"
                  onClick={() => handlePlaySong(song)}
                >
                  <div className="relative h-28 rounded-lg overflow-hidden mb-2 bg-gradient-to-br from-purple-500 to-pink-600">
                    {renderCoverArt(song.thumbnailUrl, song.title)}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(song);
                        }}
                        className="p-2 rounded-full bg-slate-900/80 text-white hover:text-cyan-400 transition"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-medium truncate">{song.title}</div>
                  <div className="text-xs text-slate-400 truncate">{getArtistDisplay(song.artists)}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default DownloadPage;