import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Section from '../../components/Section';
import AlbumCard from '../../components/AlbumCard';
import TrackRow from '../../components/TrackRow';
import ArtistCard from '../../components/ArtistCard';
import Footer from '../../components/Footer';
import artistService from '../../services/artistService';
import albumService from '../../services/albumService';
import genreService from '../../services/genreService';
import songService from '../../services/songService';
import { getImageUrl } from '../../utils/imageHelper';
import { playTrack } from '../../redux/slices/playerSlice';
import userService from '../../services/userService';
import { useFavorites } from '../FavouritePage/FavouritePage';

const Homepage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [listenHistory, setListenHistory] = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [weeklyTop, setWeeklyTop] = useState([]);
  const [featuredAlbums, setFeaturedAlbums] = useState([]);
  const [topGenres, setTopGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const heroImage = getImageUrl('thang.jpg', 'album');

  // Helper format thời gian (giây -> mm:ss)
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📄 Starting to fetch homepage data...');

        const [artistsRes, albumsRes, genresRes, topSongsRes, historyRes] = await Promise.allSettled([
          artistService.getAll(),
          albumService.getAll(),
          genreService.getAll(),
          songService.getTopByPlayCount({ limit: 15 }),
          userService.getListenHistory({ limit: 10 })
        ]);

        console.log('📦 API Responses:', {
          artists: artistsRes,
          albums: albumsRes,
          genres: genresRes,
          topSongs: topSongsRes,
          history: historyRes
        });

        // Process Artists
        if (artistsRes.status === 'fulfilled') {
          const artistsData = artistsRes.value?.items || artistsRes.value || [];
          const transformed = artistsData.slice(0, 6).map(artist => ({
            id: artist.id,
            name: artist.name,
            image: getImageUrl(artist.avatar_url, 'artist')
          }));
          setFeaturedArtists(transformed);
        }

        // Process Albums 
        if (albumsRes.status === 'fulfilled') {
          const albumsData = albumsRes.value?.items || albumsRes.value || [];

          // Featured Albums
          const featuredAlbumsTransformed = albumsData.slice(0, 12).map(album => ({
            id: album.id,
            title: album.title,
            artist: album.artist?.name || 'Unknown Artist',
            coverArt: getImageUrl(album.cover_url, 'album')
          }));
          setFeaturedAlbums(featuredAlbumsTransformed);

          // Recently Played - Use listen history if available
          // Recently Played - Only Songs
          if (historyRes.status === 'fulfilled') {
            const hr = historyRes.value;
            const historyData = Array.isArray(hr) ? hr : (hr?.items || []);

            if (Array.isArray(historyData) && historyData.length > 0) {
              const transformedHistory = historyData.slice(0, 10).map(song => ({
                id: song.id,
                title: song.title,
                artist: song.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
                coverArt: song.thumbnailUrl || getImageUrl(song.thumbnailUrl, 'song'),
                isSong: true
              }));

              setRecentlyPlayed(transformedHistory);
            }
          }
        }

        // Process Top Songs (Weekly Top 15)
        if (topSongsRes.status === 'fulfilled') {
          const songsData = topSongsRes.value || [];

          const transformedSongs = songsData.slice(0, 15).map((song, index) => ({
            id: song.id,
            rank: index + 1,
            title: song.title,
            artist: song.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
            coverArt: song.thumbnailUrl,
            duration: formatDuration(song.durationSeconds),
            playCount: song.play_count || song.playCount || 0,
            isPlaying: false,
            originalData: song
          }));

          console.log('✅ Top Songs by Play Count:', transformedSongs.length);
          console.log('🎵 Play counts:', transformedSongs.map(s => ({
            title: s.title,
            plays: s.playCount
          })));

          setWeeklyTop(transformedSongs);
        } else {
          console.error('❌ Top songs failed:', topSongsRes.reason);
        }

        // Process Genres
        if (genresRes.status === 'fulfilled') {
          const genresData = genresRes.value?.items || genresRes.value || [];
          const transformed = genresData.slice(0, 10).map((genre) => ({
            id: genre.id,
            name: genre.name,
            coverArt: getImageUrl(genre.thumbnailUrl, 'genre')
          }));
          setTopGenres(transformed);
        }

        console.log('✅ All data fetched successfully');
      } catch (err) {
        console.error('❌ Critical error fetching homepage data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleArtistClick = (artistId) => {
    navigate(`/artists/${artistId}`);
  };

  const handleAlbumClick = (albumId) => {
    navigate(`/album/${albumId}`);
  };

  const handleGenreClick = (genreId) => {
    navigate(`/genres/${genreId}`);
  };

  const handleSongClick = (songId) => {
    navigate(`/song/${songId}`);
  };

  // Hàm xử lý khi bấm vào bài hát trong Weekly Top
  const handlePlaySong = (selectedTrack) => {
    if (!selectedTrack.originalData) return;

    // Tạo playlist từ danh sách Weekly Top
    const playlist = weeklyTop.map(item => item.originalData);

    dispatch(playTrack({
      track: selectedTrack.originalData,
      playlist: playlist
    }));

    // Record play count
    if (selectedTrack.originalData.id) {
      songService.recordPlay(selectedTrack.originalData.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-cyan-400 text-xl">Loading amazing music...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-xl mb-4">⚠️ Error loading content</div>
          <div className="text-slate-400 mb-6">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-cyan-400 px-6 py-2 rounded-full text-slate-900 font-medium hover:bg-cyan-300 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if we have any data at all
  const hasAnyData =
    featuredArtists.length > 0 ||
    recentlyPlayed.length > 0 ||
    weeklyTop.length > 0 ||
    featuredAlbums.length > 0 ||
    topGenres.length > 0;

  if (!hasAnyData) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4">
        <div className="text-center max-w-md">
          <div className="text-cyan-400 text-xl mb-4">🎵 No content available</div>
          <div className="text-slate-400 mb-6">
            There's no music data available at the moment. Please check your API connection or contact support.
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-cyan-400 px-6 py-2 rounded-full text-slate-900 font-medium hover:bg-cyan-300 transition"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="pt-20 md:pt-24 pb-0 md:pb-0 px-4 md:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl md:rounded-3xl overflow-hidden mb-8 md:mb-12 border border-cyan-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
        <div className="relative z-20 p-6 md:p-8 lg:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-12">
          <div className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-xl md:rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 shadow-2xl">
            <img
              src={heroImage}
              alt="Featured"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = getImageUrl(null, 'album');
              }}
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="text-xs md:text-sm text-cyan-400 mb-2 tracking-wide">TRENDING NOW</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">This Month's</h1>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4 md:mb-6">
              Record Breaking Albums !
            </h2>
            <p className="text-slate-300 text-sm md:text-base lg:text-lg max-w-2xl mb-6 md:mb-8 leading-relaxed">
              Discover the biggest releases breaking records worldwide. From chart-topping hits to critically acclaimed masterpieces.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start">
              <button
                onClick={() => navigate('/albums')}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 px-6 md:px-8 py-2.5 md:py-3 rounded-full font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 md:w-5 md:h-5" fill="white" />
                Listen Now
              </button>
              <button
                onClick={() => navigate('/top-tracks')}
                className="border border-cyan-400 px-6 md:px-8 py-2.5 md:py-3 rounded-full font-medium hover:bg-cyan-400/10 transition"
              >
                See More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <Section title="Recently Played">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
            {recentlyPlayed.map((item) => (
              <AlbumCard
                key={item.id}
                id={item.id}
                title={item.title}
                artist={item.artist}
                coverArt={item.coverArt}
                isSong={item.isSong}
                onClick={() => handleSongClick(item.id)}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Weekly Top 15 */}
      {weeklyTop.length > 0 && (
        <Section title={`Weekly Top ${weeklyTop.length} - Most Played`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Column 1 */}
            <div className="space-y-3">
              {weeklyTop
                .slice(0, Math.ceil(weeklyTop.length / 2))
                .map(track => (
                  <TrackRow
                    key={track.id}
                    {...track}
                    onSelect={() => handlePlaySong(track)}
                    onLike={() => toggleFavorite(track.originalData)}
                    isLiked={isFavorite(track.id)}
                  />
                ))}
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              {weeklyTop
                .slice(Math.ceil(weeklyTop.length / 2))
                .map(track => (
                  <TrackRow
                    key={track.id}
                    {...track}
                    onSelect={() => handlePlaySong(track)}
                    onLike={() => toggleFavorite(track.originalData)}
                    isLiked={isFavorite(track.id)}
                  />
                ))}
            </div>

          </div>
        </Section>
      )}

      {/* Featured Albums */}
      {featuredAlbums.length > 0 && (
        <Section title="Featured Albums">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
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

      {/* Featured Artists */}
      {featuredArtists.length > 0 && (
        <Section title="Featured Artists">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
            {featuredArtists.map((artist) => (
              <ArtistCard
                key={artist.id}
                id={artist.id}
                name={artist.name}
                image={artist.image}
                onClick={() => handleArtistClick(artist.id)}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Upgrade Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 rounded-2xl md:rounded-3xl p-8 md:p-10 lg:p-12 text-center my-8 md:my-12 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">LISTEN TO UNLIMITED SONGS FOR FREE</h3>
          <p className="text-base md:text-lg lg:text-xl mb-4 md:mb-6">Upgrade To Pro Version Now !</p>
          <button
            onClick={() => navigate('/payment')}
            className="bg-white text-purple-600 px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold hover:bg-slate-100 transition"
          >
            Upgrade Now
          </button>
        </div>
      </div>

      {/* Top Genres */}
      {topGenres.length > 0 && (
        <Section title="Top Genres">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
            {topGenres.map((genre) => (
              <div
                key={genre.id}
                onClick={() => handleGenreClick(genre.id)}
                className="group relative bg-gradient-to-br rounded-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
              >
                {genre.coverArt && (
                  <img
                    src={genre.coverArt}
                    alt={genre.name}
                    className="w-full h-32 sm:h-40 object-cover group-hover:opacity-75 transition-opacity"
                    onError={(e) => {
                      e.target.src = getImageUrl(null, 'song');
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <h3 className="text-white font-semibold text-center text-sm sm:text-base px-2">
                    {genre.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Footer />
    </main>
  );
};

export default Homepage;