import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import artistService from '../../services/artistService';
import { getImageUrl } from '../../utils/imageHelper';
import Footer from '../../components/Footer';

const Artists = () => {
  const navigate = useNavigate();
  const [featuredPage, setFeaturedPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [allArtists, setAllArtists] = useState([]);

  const itemsPerPage = 6;

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const response = await artistService.getAll();
        const artistsData = response.items || [];

        // Transform API data to match component expectations
        const transformedArtists = artistsData.map(artist => ({
          id: artist.id,
          name: artist.name,
          image: getImageUrl(artist.avatar_url, 'artist'),
          albums: artist.albums || []
        }));

        // Split into featured (first 12) and all artists
        setFeaturedArtists(transformedArtists.slice(0, 12));
        setAllArtists(transformedArtists);
      } catch (error) {
        console.error('Error fetching artists:', error);
        setFeaturedArtists([]);
        setAllArtists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const handleArtistClick = (artistId) => {
    navigate(`/artists/${artistId}`);
  };

  const renderArtistImage = (artist) => {
    if (
      artist.image &&
      (artist.image.startsWith('/images') ||
        artist.image.startsWith('http') ||
        artist.image.includes('placeholder'))
    ) {
      return (
        <img
          src={artist.image}
          alt={artist.name}
          className="w-full h-full object-cover"
        />
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center text-4xl lg:text-5xl">
        👤
      </div>
    );
  };

  if (loading) {
    return (
      <main className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 bg-[#0B1221] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading artists...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-0 px-4 sm:px-6 lg:px-8 bg-[#0B1221] min-h-screen">
      {/* Featured Artists Section */}
      <div className="mb-8 lg:mb-12">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-cyan-400">
            Featured Artists
          </h2>
        </div>

        <div className="relative">
          {/* Navigation buttons */}
          <button
            onClick={() => setFeaturedPage(Math.max(0, featuredPage - 1))}
            disabled={featuredPage === 0}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-slate-800/90 hover:bg-slate-700 rounded-full items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() =>
              setFeaturedPage(
                Math.min(
                  Math.ceil(featuredArtists.length / itemsPerPage) - 1,
                  featuredPage + 1
                )
              )
            }
            disabled={
              featuredPage >=
              Math.ceil(featuredArtists.length / itemsPerPage) - 1
            }
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-slate-800/90 hover:bg-slate-700 rounded-full items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Artist cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
            {featuredArtists
              .slice(
                featuredPage * itemsPerPage,
                (featuredPage + 1) * itemsPerPage
              )
              .map((artist) => (
                <div
                  key={artist.id}
                  onClick={() => handleArtistClick(artist.id)}
                  className="bg-slate-800/40 rounded-xl p-3 lg:p-4 hover:bg-slate-800/60 transition cursor-pointer group border border-cyan-500/10"
                >
                  <div className="relative mb-2 lg:mb-3">
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                      {renderArtistImage(artist)}
                    </div>
                  </div>
                  <h3 className="font-medium text-white text-xs sm:text-sm mb-1 truncate text-center">
                    {artist.name}
                  </h3>
                  <p className="text-xs text-slate-400 truncate text-center">
                    {artist.albums?.[0] || 'Artist'}
                  </p>
                </div>
              ))}
          </div>

          {/* Mobile pagination dots */}
          <div className="flex md:hidden justify-center gap-2 mt-4">
            {Array.from({
              length: Math.ceil(featuredArtists.length / itemsPerPage),
            }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setFeaturedPage(idx)}
                className={`w-2 h-2 rounded-full transition ${idx === featuredPage ? 'bg-cyan-400 w-6' : 'bg-slate-600'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* All Artists Section */}
      <div className="mb-12">
        <h2 className="text-cyan-400 text-xl sm:text-2xl font-bold mb-6">
          All Artists
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {allArtists.map((artist) => (
            <div
              key={artist.id}
              onClick={() => handleArtistClick(artist.id)}
              className="bg-slate-800/40 rounded-xl p-3 lg:p-4 hover:bg-slate-800/60 transition cursor-pointer group border border-cyan-500/10"
            >
              <div className="relative mb-2 lg:mb-3">
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                  {renderArtistImage(artist)}
                </div>
              </div>
              <h3 className="font-medium text-white text-xs sm:text-sm mb-1 truncate text-center">
                {artist.name}
              </h3>
              <p className="text-xs text-slate-400 truncate text-center">
                {artist.albums?.[0] || 'Artist'}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Artists;