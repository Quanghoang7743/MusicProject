import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Music } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { playTrack } from '../../redux/slices/playerSlice';
import songService from '../../services/songService';
import albumService from '../../services/albumService';
import favouritesService from '../../services/favouritesService';
import TrackRow from '../../components/TrackRow';

const AlbumDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedTracks, setLikedTracks] = useState(new Set());
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Helper function to format duration in mm:ss
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Get Album Info using /v1/albums/{id}
        const albumRes = await albumService.getById(id);
        setAlbum(albumRes);

        // 2. Get Songs in Album using /v1/manage/songs?albumId={id}
        const tracksRes = await songService.getByAlbum(id);
        const rawTracks = tracksRes.items || tracksRes || [];

        // Transform tracks data to handle both camelCase and snake_case
        const transformedTracks = rawTracks.map(track => ({
          id: track.id,
          title: track.title,
          audioUrl: track.audioUrl || track.audio_url,
          durationSeconds: track.durationSeconds || track.duration_seconds || 0,
          thumbnailUrl: track.thumbnailUrl || track.thumbnail_url,
          playCount: track.playCount || track.play_count || 0,
          artists: track.artists || [],
          genres: track.genres || []
        }));

        setTracks(transformedTracks);

        // 3. Fetch user's favorites to check which tracks are liked
        try {
          const favoritesRes = await favouritesService.getAll();
          const favoriteIds = new Set(
            (favoritesRes.items || []).map(fav => fav.id)
          );
          setLikedTracks(favoriteIds);
        } catch (favError) {
          console.warn('Could not load favorites:', favError);
          // Continue without favorites if not logged in or error occurs
        }
      } catch (error) {
        console.error("Failed to load album detail", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePlayAlbum = () => {
    if (tracks.length > 0) {
      dispatch(playTrack({
        track: tracks[0],
        playlist: tracks
      }));
    }
  };

  const handlePlayTrack = (track) => {
    dispatch(playTrack({
      track: track,
      playlist: tracks
    }));
  };

  const handleLikeTrack = async (trackId) => {
    if (loadingFavorites) return;

    setLoadingFavorites(true);
    const wasLiked = likedTracks.has(trackId);

    try {
      if (wasLiked) {
        // Remove from favorites
        await favouritesService.remove(trackId);
        setLikedTracks(prev => {
          const newSet = new Set(prev);
          newSet.delete(trackId);
          return newSet;
        });
        console.log('✅ Removed from favorites');
      } else {
        // Add to favorites
        await favouritesService.add(trackId);
        setLikedTracks(prev => new Set([...prev, trackId]));
        console.log('✅ Added to favorites');
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      // Show error to user (you might want to add a toast notification here)
      alert('Failed to update favorites. Please try again.');
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Calculate total duration
  const totalDuration = tracks.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
  const formatTotalTime = (seconds) => {
    if (!seconds) return '0 min';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hr ${mins} min`;
    }
    return `${mins} min`;
  };

  if (loading) return (
    <div className="pt-32 bg-[#0B1221] min-h-screen flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!album) return (
    <div className="pt-32 bg-[#0B1221] min-h-screen flex flex-col items-center justify-center text-white">
      <h2 className="text-2xl font-bold mb-4">Album not found</h2>
      <button onClick={() => navigate('/albums')} className="text-cyan-400 hover:underline">Back to Albums</button>
    </div>
  );

  return (
    <main className="pt-24 pb-0 px-4 sm:px-6 lg:px-8 bg-[#0B1221] min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-12">
          <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden bg-slate-800 shadow-2xl shadow-cyan-900/20 flex-shrink-0 border border-white/10">
            {album.cover_url || album.coverUrl ? (
              <img src={album.cover_url || album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-cyan-900 to-slate-900">🎵</div>
            )}
          </div>

          <div className="text-center md:text-left flex-1 space-y-4">
            <div>
              <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase mb-2 inline-block bg-cyan-900/30 px-2 py-1 rounded">Album</span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2 leading-tight">{album.title}</h1>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">👤</div>
                <span className="font-semibold text-white hover:text-cyan-400 cursor-pointer transition">{album.artist?.name || 'Unknown Artist'}</span>
              </div>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <CalendarIcon />
                {album.release_date || album.releaseDate ? new Date(album.release_date || album.releaseDate).getFullYear() : 'Unknown Year'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1"><Music className="w-4 h-4" /> {tracks.length} songs</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatTotalTime(totalDuration)}</span>
            </div>

            <div className="pt-2">
              <button
                onClick={handlePlayAlbum}
                disabled={tracks.length === 0}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3.5 rounded-full text-base font-bold transition shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5 fill-white" /> Play Album
              </button>
            </div>
          </div>
        </div>

        {/* Tracklist */}
        <section>
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2 px-2">
            <h2 className="text-xl font-bold text-white">Tracks</h2>
            <span className="text-sm text-slate-500 uppercase tracking-wider">Duration</span>
          </div>

          <div className="space-y-1">
            {tracks.length > 0 ? (
              tracks.map((t, idx) => (
                <TrackRow
                  key={t.id}
                  rank={idx + 1}
                  title={t.title}
                  artist={t.artists?.map(a => a.name).join(', ') || 'Unknown'}
                  duration={formatDuration(t.durationSeconds)}
                  coverArt={t.thumbnailUrl}
                  id={t.id}
                  onSelect={() => handlePlayTrack(t)}
                  onLike={() => handleLikeTrack(t.id)}
                  isLiked={likedTracks.has(t.id)}
                />
              ))
            ) : (
              <div className="text-slate-400 py-16 text-center bg-slate-800/20 rounded-xl border border-white/5 flex flex-col items-center gap-3">
                <Music className="w-10 h-10 text-slate-600" />
                <p>No tracks found for this album.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

// Helper Icon Component
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
);

export default AlbumDetail;