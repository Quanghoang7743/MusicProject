import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Play, MoreVertical } from 'lucide-react';
import Section from '../../components/Section';
import AlbumCard from '../../components/AlbumCard';
import Footer from '../../components/Footer';
import songService from '../../services/songService';
import albumService from '../../services/albumService';
import { playTrack } from '../../redux/slices/playerSlice';
import { useFavorites } from '../FavouritePage/FavouritePage';
import { Heart } from 'lucide-react';

const renderCover = (coverArt, title, sizeClass = "w-12 h-12 md:w-14 md:h-14") => {
  const isImage =
    typeof coverArt === 'string' &&
    (coverArt.includes('/images/') ||
      coverArt.includes('data:image') ||
      coverArt.includes('http') ||
      coverArt.includes('src'));

  return (
    <div className={`${sizeClass} rounded-lg overflow-hidden flex-shrink-0`}>
      {isImage ? (
        <img src={coverArt} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-600 to-blue-600">
          <span className="text-lg md:text-xl">🎵</span>
        </div>
      )}
    </div>
  );
};

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec < 10 ? '0' + sec : sec}`;
};

const TopTracks = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [topSongs, setTopSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [songsData, albumsData] = await Promise.all([
          songService.getTopByPlayCount({ limit: 50 }),
          albumService.getAll({ limit: 12 })
        ]);

        // Transform songs
        const transformedSongs = songsData.map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
          coverArt: song.thumbnailUrl,
          duration: formatDuration(song.durationSeconds),
          playCount: song.play_count || song.playCount || 0,
          originalData: song
        }));

        // Transform albums
        const transformedAlbums = (albumsData.items || albumsData || []).map(album => ({
          id: album.id,
          title: album.title,
          artist: album.artist?.name || 'Unknown Artist',
          coverArt: album.cover_url
        }));

        setTopSongs(transformedSongs);
        setAlbums(transformedAlbums);
      } catch (err) {
        console.error('Error fetching top tracks data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectSong = (song) => {
    if (song.originalData) {
      dispatch(playTrack({
        track: song.originalData,
        playlist: topSongs.map(s => s.originalData)
      }));
    }
    navigate(`/song/${song.id}`);
  };

  const handleAlbumClick = (albumId) => {
    navigate(`/album/${albumId}`);
  };

  if (loading) {
    return (
      <main className="pt-24 pb-32 px-4 md:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-cyan-400 text-xl">Loading top tracks...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-24 pb-32 px-4 md:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-xl mb-4">⚠️ Error loading tracks</div>
          <div className="text-slate-400 mb-6">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-cyan-400 px-6 py-2 rounded-full text-slate-900 font-medium hover:bg-cyan-300 transition"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const weeklyTop15 = topSongs.slice(0, 15);
  const allTimeTracks = topSongs.slice(0, 12);
  const trendingTracks = topSongs.slice(0, 4);
  const mostPlayedLeft = topSongs.slice(0, 8);
  const mostPlayedRight = topSongs.slice(8, 16);

  return (
    <main className="pt-24 pb-0 px-4 md:px-6 lg:px-8">
      {/* Weekly Top 15 Section */}
      <Section title="Weekly Top 15 - Most Played">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          {weeklyTop15.map((track, index) => (
            <div
              key={track.id}
              onClick={() => handleSelectSong(track)}
              className="bg-slate-800/50 rounded-lg p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:bg-slate-800 transition border border-cyan-500/10 hover:border-cyan-500/30 cursor-pointer"
            >
              <div className="text-xl md:text-2xl font-bold text-slate-400 w-8 md:w-12 text-center flex-shrink-0">
                {String(index + 1).padStart(2, '0')}
              </div>
              {renderCover(track.coverArt, track.title)}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm md:text-base truncate">{track.title}</div>
                <div className="text-xs md:text-sm text-slate-400 truncate">{track.artist}</div>
              </div>
              <div className="text-xs md:text-sm text-slate-400 flex-shrink-0">
                {track.playCount} plays
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(track.originalData);
                }}
                className="text-slate-400 hover:text-red-500 transition flex-shrink-0"
              >
                <Heart
                  className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite(track.id) ? 'fill-red-500 text-red-500' : ''
                    }`}
                />
              </button>
              <button
                className="text-slate-400 hover:text-cyan-400 transition flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Top Tracks Of All Time Section */}
      {allTimeTracks.length > 0 && (
        <Section title="Top Tracks Of All Time">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5 lg:gap-6">
            {allTimeTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => handleSelectSong(track)}
                className="cursor-pointer group"
              >
                <div className="relative mb-2 md:mb-3">
                  <div className="w-full aspect-square rounded-lg md:rounded-xl overflow-hidden flex items-center justify-center">
                    {renderCover(track.coverArt, track.title, "w-full h-full")}
                  </div>
                  <button className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-10 h-10 md:w-12 md:h-12 bg-cyan-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110">
                    <Play className="w-4 h-4 md:w-5 md:h-5 text-white" fill="white" />
                  </button>
                </div>
                <div className="font-medium text-xs md:text-sm lg:text-base truncate">{track.title}</div>
                <div className="text-xs md:text-sm text-slate-400 truncate">{track.artist}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Trending Tracks Section */}
      {trendingTracks.length > 0 && (
        <Section title="Trending Tracks">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
            {trendingTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => handleSelectSong(track)}
                className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800 transition border border-cyan-500/10 hover:border-cyan-500/30 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  {renderCover(track.coverArt, track.title)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{track.title}</div>
                    <div className="text-xs text-slate-400 truncate">{track.playCount} plays</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">{track.artist}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Most Played Section */}
      {topSongs.length >= 16 && (
        <div className="hidden md:block">
          <Section title="Most Played">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-3">
                {mostPlayedLeft.map((track, index) => (
                  <div
                    key={track.id}
                    onClick={() => handleSelectSong(track)}
                    className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3 hover:bg-slate-800 transition border border-cyan-500/10 hover:border-cyan-500/30 cursor-pointer"
                  >
                    <div className="text-lg font-bold text-slate-400 w-8 text-center">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    {renderCover(track.coverArt, track.title)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{track.title}</div>
                      <div className="text-xs text-slate-400 truncate">{track.artist}</div>
                    </div>
                    <div className="text-xs text-slate-400">{track.duration}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {mostPlayedRight.map((track, index) => (
                  <div
                    key={track.id}
                    onClick={() => handleSelectSong(track)}
                    className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3 hover:bg-slate-800 transition border border-cyan-500/10 hover:border-cyan-500/30 cursor-pointer"
                  >
                    <div className="text-lg font-bold text-slate-400 w-8 text-center">
                      {String(index + 9).padStart(2, '0')}
                    </div>
                    {renderCover(track.coverArt, track.title)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{track.title}</div>
                      <div className="text-xs text-slate-400 truncate">{track.artist}</div>
                    </div>
                    <div className="text-xs text-slate-400">{track.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* Popular This Week */}
      {albums.length > 0 && (
        <div className="hidden md:block">
          <Section title="Popular Albums This Week">
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5 lg:gap-6">
              {albums.slice(0, 6).map((album) => (
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
        </div>
      )}
      <Footer />
    </main>
  );
};

export default TopTracks;