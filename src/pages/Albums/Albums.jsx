import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import albumService from '../../services/albumService';
import Section from '../../components/Section';
import AlbumCard from '../../components/AlbumCard';
import Footer from '../../components/Footer';

const Albums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all albums using /v1/albums
        const albumsRes = await albumService.getAll({ limit: 100 });
        const rawAlbums = albumsRes.items || albumsRes || [];

        // Transform album data to handle both camelCase and snake_case
        const processed = rawAlbums.map(album => {
          return {
            id: album.id,
            title: album.title,
            artist: album.artist?.name || 'Unknown Artist',
            coverArt: album.cover_url || album.coverUrl || album.thumbnailUrl,
            releaseDate: album.release_date || album.releaseDate,
            totalTracks: album.total_tracks || album.totalTracks || 0
          };
        });

        setAlbums(processed);
      } catch (error) {
        console.error("Failed to load albums", error);
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle album click
  const handleAlbumClick = (id) => {
    console.log("Navigating to album:", id);
    navigate(`/album/${id}`);
  };

  if (loading) return (
    <main className="pt-32 px-8 bg-[#0B1221] min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
    </main>
  );

  const featuredAlbums = albums.slice(0, 6);
  const trendingAlbums = albums.slice(0, 5);
  const top15Albums = albums.slice(12, 27);
  const newReleases = albums.slice(0, 5);

  return (
    <main className="pt-24 pb-0 px-4 sm:px-6 lg:px-8 bg-[#0B1221] min-h-screen">

      {/* Featured Albums */}
      {featuredAlbums.length > 0 && (
        <Section title="Featured Albums">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {featuredAlbums.map((album) => (
              <AlbumCard
                key={album.id}
                id={album.id}
                title={album.title}
                artist={album.artist}
                coverArt={album.coverArt}
                onClick={() => handleAlbumClick(album.id)}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Trending Albums */}
      {trendingAlbums.length > 0 && (
        <Section title="Trending Albums">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {trendingAlbums.map((album) => (
              <AlbumCard
                key={album.id}
                id={album.id}
                title={album.title}
                artist={album.artist}
                coverArt={album.coverArt}
                onClick={() => handleAlbumClick(album.id)}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Top 15 Albums (List View) */}
      {top15Albums.length > 0 && (
        <Section title="Top 15 Albums">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {top15Albums.map((album, index) => (
              <div
                key={album.id}
                onClick={() => handleAlbumClick(album.id)}
                className="bg-slate-800/40 rounded-lg p-3 flex items-center gap-4 hover:bg-slate-800 transition border border-white/5 hover:border-cyan-500/30 cursor-pointer group"
              >
                <div className="text-xl font-bold text-cyan-400 w-8 text-center font-mono">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900">
                  {album.coverArt ? (
                    <img
                      src={album.coverArt}
                      alt={album.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-2xl">🎵</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-white group-hover:text-cyan-400 transition">{album.title}</div>
                  <div className="text-sm text-slate-400 truncate">{album.artist}</div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAlbumClick(album.id);
                  }}
                  className="w-8 h-8 rounded-full bg-cyan-500/10 hover:bg-cyan-500 flex items-center justify-center transition group-hover:scale-110"
                >
                  <Play className="w-3.5 h-3.5 text-cyan-400 group-hover:text-black fill-current" />
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* New Releases */}
      {newReleases.length > 0 && (
        <Section title="New Releases">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {newReleases.map((album) => (
              <AlbumCard
                key={album.id}
                id={album.id}
                title={album.title}
                artist={album.artist}
                coverArt={album.coverArt}
                onClick={() => handleAlbumClick(album.id)}
              />
            ))}
          </div>
        </Section>
      )}

      {albums.length === 0 && (
        <div className="text-slate-400 text-center mt-10 py-20">No albums available.</div>
      )}

      <Footer />
    </main>
  );
};

export default Albums;