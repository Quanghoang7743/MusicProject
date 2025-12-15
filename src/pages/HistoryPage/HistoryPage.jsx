import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Play } from 'lucide-react';
import userService from '../../services/userService';
import Footer from '../../components/Footer';
import { useFavorites } from '../FavouritePage/FavouritePage';
import { Heart } from 'lucide-react';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const { toggleFavorite, isFavorite, isAuthenticated } = useFavorites();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        if (!isAuthenticated) {
          setHistoryData([]);
          setLoading(false);
          return;
        }
        // Request more items from API and then trim/sort client-side
        const resp = await userService.getListenHistory({ limit: 100 });

        const data = Array.isArray(resp) ? resp : (resp.items || []);
        const serverTimestamp = resp.timestamp || null;

        if (!Array.isArray(data)) {
          setHistoryData([]);
          return;
        }

        // Sort by the most relevant timestamp: prefer per-item timestamp fields, fall back to server timestamp
        // Normalize item shape: some backends return history entries wrapping the song
        const normalize = (it) => {
          if (!it) return null;
          const song = it.song || it.track || it.item || null;

          const songId = song?.id || it.songId || it.song_id || it.trackId || it.id || null;

          const title = song?.title || it.title || song?.name || it.name || 'Unknown Title';

          const artistsArr = song?.artists || it.artists || [];
          const artist = Array.isArray(artistsArr) ? artistsArr.map(a => a.name || a).join(', ') : (artistsArr || 'Unknown Artist');

          const coverArt = song?.thumbnailUrl || song?.thumbnail || it.thumbnailUrl || it.coverArt || '';

          // Prefer `last_listen_at` (item-level or song-level) as the authoritative play time
          const ts = it.last_listen_at || song?.last_listen_at || it.timestamp || song?.timestamp || it.createdAt || it.created_at || serverTimestamp || null;

          const time = (ts ? new Date(ts).getTime() : 0) || 0;

          return {
            raw: it,
            songId,
            title,
            artist,
            coverArt,
            time,
            lastListenAt: ts
          };
        };

        const normalized = data.map(normalize).filter(Boolean);

        // Sort newest-first by resolved timestamp
        normalized.sort((a, b) => b.time - a.time);

        // Deduplicate by songId (keep the first/newest) and limit to 20
        const unique = [];
        const seen = new Set();
        for (const item of normalized) {
          const id = item.songId || item.raw?.id;
          if (!id) continue;
          if (seen.has(id)) continue;
          seen.add(id);
          unique.push(item);
          if (unique.length >= 20) break;
        }

        const mappedData = unique.map((entry, index) => ({
          id: entry.songId || entry.raw?.id,
          uniqueKey: `${entry.songId || entry.raw?.id}-${index}`,
          title: entry.title,
          artist: entry.artist,
          coverArt: entry.coverArt,
          lastListenAt: entry.lastListenAt
        }));

        setHistoryData(mappedData);
      } catch (error) {
        console.error("Failed to load history", error);
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isAuthenticated]);

  const handleItemClick = (songId) => {
    navigate(`/song/${songId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1221] flex items-center justify-center pt-24">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="pt-20 sm:pt-24 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 lg:py-32">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
              <Clock className="w-12 h-12 lg:w-16 lg:h-16 text-slate-600" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-300 mb-3">
              Login Required
            </h2>
            <p className="text-base lg:text-lg text-slate-500 mb-6 text-center max-w-md">
              Please log in to view your listening history
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

  return (
    <main className="pt-24 pb-0 px-4 sm:px-6 lg:px-8 bg-[#0B1221] min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
          <Clock className="w-8 h-8" />
          Listen History
        </h1>
        <div className="text-slate-400 text-sm">
          {historyData.length} songs played
        </div>
      </div>

      {historyData.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-lg">You haven't listened to any songs yet.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-cyan-400 hover:underline"
          >
            Go Discover Music
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {historyData.map((item) => (
            <div
              key={item.uniqueKey}
              onClick={() => handleItemClick(item.id)}
              className="group relative bg-slate-800/30 hover:bg-slate-800/60 rounded-2xl p-4 transition-all border border-slate-700/30 hover:border-cyan-400/30 cursor-pointer"
            >
              <div className="relative mb-4 rounded-xl overflow-hidden aspect-square bg-slate-900">
                {item.coverArt ? (
                  <img
                    src={item.coverArt}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🎵</div>
                )}

                {/* ✅ ADD HEART BUTTON HERE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite({
                      id: item.id,
                      title: item.title,
                      artists: item.artist.split(', ').map(name => ({ name })),
                      thumbnailUrl: item.coverArt,
                      durationSeconds: 180 // Default duration
                    });
                  }}
                  className="absolute top-2 right-2 p-2 bg-slate-900/80 rounded-full hover:bg-slate-800 z-10 opacity-0 group-hover:opacity-100 transition"
                >
                  <Heart
                    className={`w-5 h-5 ${isFavorite(item.id) ? 'fill-red-500 text-red-500' : 'text-white'
                      }`}
                  />
                </button>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    <Play className="w-6 h-6 text-black ml-1" fill="black" />
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white truncate group-hover:text-cyan-400 transition mb-1">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      <br />
      <br />
      <Footer />
    </main>
  );
};

export default HistoryPage;