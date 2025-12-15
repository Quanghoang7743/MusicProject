import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import genreService from '../../services/genreService';
import Footer from '../../components/Footer';
import { getImageUrl } from '../../utils/imageHelper';

// Định nghĩa STYLE_PATTERNS... (Giữ nguyên)
const STYLE_PATTERNS = [
  { colSpan: 2, rowSpan: 2, gradient: 'from-purple-600 to-blue-600' },
  { colSpan: 1, rowSpan: 1, gradient: 'from-pink-500 to-rose-500' },
  { colSpan: 1, rowSpan: 1, gradient: 'from-amber-400 to-orange-500' },
  { colSpan: 2, rowSpan: 1, gradient: 'from-emerald-500 to-cyan-500' },
  { colSpan: 1, rowSpan: 2, gradient: 'from-fuchsia-600 to-purple-600' },
  { colSpan: 1, rowSpan: 1, gradient: 'from-blue-400 to-indigo-500' },
  { colSpan: 2, rowSpan: 1, gradient: 'from-red-500 to-orange-500' },
];

const Genres = () => {
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const response = await genreService.getAll({ limit: 20 });
        
        const rawGenres = response.items || response || [];
        
        // Map dữ liệu API + Gán style giao diện
        const processedGenres = rawGenres.map((genre, index) => {
          const style = STYLE_PATTERNS[index % STYLE_PATTERNS.length];
          
          return {
            ...genre,
            colSpan: style.colSpan,
            rowSpan: style.rowSpan,
            gradient: style.gradient,
            coverArt: getImageUrl(genre.thumbnailUrl, 'genre')
          };
        });

        setGenres(processedGenres);
      } catch (error) {
        console.error("Failed to load genres", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  const handleGenreClick = (genreId) => {
    // ✅ This should work - it will navigate to the genre page
    // The genre page will load genre details but show "no songs" message
    navigate(`/genres/${genreId}`);
  };

  const handleViewMore = () => {
    // ✅ SỬA: Điều hướng sang trang xem tất cả genres (đường dẫn mới)
    navigate('/all-genres');
  };

  if (loading) {
    return (
      <main className="pt-32 lg:pt-28 pb-32 px-4 sm:px-6 lg:px-8 bg-[#0B1221] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="pt-32 lg:pt-28 pb-0 px-4 sm:px-6 lg:px-8 bg-[#0B1221] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative"> {/* relative để chứa con */}
        <h1 className="text-2xl font-bold text-cyan-400">Top Genres</h1>
        
        {/* ✅ SỬA NÚT BẤM: Thêm z-10 và relative để nổi lên trên */}
        <button
          onClick={handleViewMore}
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition text-sm cursor-pointer relative z-10 px-3 py-2 hover:bg-white/10 rounded-lg"
        >
          View More
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Responsive grid */}
      <div className="grid gap-3 grid-cols-1 lg:grid-cols-6 auto-rows-[180px] grid-flow-dense">
        {genres.map((genre) => (
          <div
            key={genre.id}
            onClick={() => handleGenreClick(genre.id)}
            className={`
              relative rounded-xl overflow-hidden cursor-pointer group
              flex items-center justify-center
              transition-transform duration-300 hover:scale-[1.02]
              h-40 lg:h-auto
              ${genre.colSpan === 2 ? 'lg:col-span-2' : 'lg:col-span-1'}
              ${genre.rowSpan === 2 ? 'lg:row-span-2' : 'lg:row-span-1'}
            `}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${genre.gradient}`} />
            {genre.coverArt && (
              <img src={genre.coverArt} alt={genre.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-300" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 pointer-events-none">
              <div className="flex items-center justify-between">
                <h3 className="text-base lg:text-lg font-semibold text-white drop-shadow-lg">
                  {genre.name}
                </h3>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium hidden lg:inline">
                  View Songs →
                </span>
              </div>
            </div>
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 rounded-xl transition-all duration-300 pointer-events-none" />
          </div>
        ))}
      </div>
      <Footer />
    </main>
  );
};

export default Genres;