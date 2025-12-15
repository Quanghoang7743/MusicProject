import { useState, useEffect } from 'react';
import { ChevronRight, Play, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import genreService from '../../services/genreService';
import Footer from '../../components/Footer';
import songService from '../../services/songService';

const GenresViewMore = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Lấy danh sách Genre (Lấy khoảng 20 cái)
        const genresRes = await genreService.getAll({ limit: 20 });
        const genres = genresRes.items || genresRes || [];

        console.log('📋 Fetched genres:', genres.length);

        // 2. Lấy 6 bài hát preview cho TỪNG Genre
        // Sử dụng Promise.all để gọi song song
        const sectionsData = await Promise.all(
          genres.map(async (genre) => {
            try {
              // Lấy 6 bài hát cho mỗi genre
              const songsRes = await songService.getByGenre(genre.id, { limit: 6 });
              const songs = songsRes.items || songsRes || [];

              console.log(`🎵 Genre "${genre.name}": ${songs.length} songs`);

              // ✅ ALWAYS return the genre, even if no songs
              return {
                id: genre.id,
                name: genre.name,
                songs: songs,
                hasSongs: songs.length > 0
              };
            } catch (err) {
              console.error(`Error fetching songs for genre ${genre.name}`, err);

              // Still return the genre with empty songs array
              return {
                id: genre.id,
                name: genre.name,
                songs: [],
                hasSongs: false
              };
            }
          })
        );

        // ✅ Show ALL genres (filter out null values if any)
        setSections(sectionsData.filter(section => section !== null));

      } catch (error) {
        console.error("Failed to load genres", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSongClick = (songId) => {
    navigate(`/song/${songId}`);
  };

  const handleViewGenreDetail = (genreId) => {
    navigate(`/genres/${genreId}`);
  };

  if (loading) {
    return (
      <main className="pt-32 px-4 bg-[#0B1221] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  if (sections.length === 0) {
    return (
      <main className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 bg-[#0B1221] min-h-screen">
        <h1 className="text-3xl font-bold text-white mb-8">Explore Genres</h1>
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎵</div>
          <h2 className="text-xl font-semibold text-white mb-2">No genres available</h2>
          <p className="text-slate-400">Check back later!</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="pt-24 pb-0 px-4 sm:px-6 lg:px-8 bg-[#0B1221] min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/genres')}
          className="p-2 bg-slate-800/50 rounded-full hover:bg-slate-700 text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-white">Explore All Genres</h1>
      </div>

      {/* Genres Sections */}
      <div className="space-y-16">
        {sections.map((genre) => (
          <section key={genre.id}>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-2">
              <h2 className="text-2xl font-bold text-cyan-400">
                {genre.name}
              </h2>
              <button
                onClick={() => handleViewGenreDetail(genre.id)}
                className="text-slate-300 hover:text-white text-sm font-medium transition flex items-center gap-1 group"
              >
                See All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Songs Grid or Empty State */}
            {genre.hasSongs ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                {genre.songs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => handleSongClick(song.id)}
                    className="cursor-pointer group relative bg-slate-800/20 p-3 rounded-xl hover:bg-slate-800/60 transition border border-transparent hover:border-white/10"
                  >
                    {/* Cover Art */}
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-slate-900 shadow-lg">
                      {song.thumbnailUrl ? (
                        <img
                          src={song.thumbnailUrl}
                          alt={song.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-4xl bg-gradient-to-br from-cyan-900 to-slate-900">
                          🎵
                        </div>
                      )}

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[1px]">
                        <button className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform translate-y-2 group-hover:translate-y-0">
                          <Play className="w-5 h-5 ml-0.5 text-white" fill="white" />
                        </button>
                      </div>
                    </div>

                    {/* Song Info */}
                    <div>
                      <h3 className="font-semibold text-white truncate text-sm mb-1 group-hover:text-cyan-400 transition">
                        {song.title}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">
                        {song.artists?.map(a => a.name).join(', ') || 'Unknown'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty state for genres with no songs
              <div className="bg-slate-800/30 rounded-lg p-8 text-center border border-slate-700/50">
                <div className="text-4xl mb-3">🎵</div>
                <p className="text-slate-400 text-sm">
                  No songs available in this genre yet
                </p>
                <button
                  onClick={() => handleViewGenreDetail(genre.id)}
                  className="mt-4 text-cyan-400 hover:text-cyan-300 text-xs font-medium transition"
                >
                  View Genre Details →
                </button>
              </div>
            )}
          </section>
        ))}
      </div>

      <Footer />
    </main>
  );
};

export default GenresViewMore;