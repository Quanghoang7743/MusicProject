import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft, Play, Heart, Plus, Share2 } from 'lucide-react';
import { useFavorites } from '../FavouritePage/FavouritePage';
import Footer from '../../components/Footer';
import TrackRow from '../../components/TrackRow';
import songService from '../../services/songService';
import { playTrack } from '../../redux/slices/playerSlice';

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec < 10 ? '0' + sec : sec}`;
};

const SongDetailPage = () => {
  const { songId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [song, setSong] = useState(null);
  const [relatedSongs, setRelatedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSongData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the song details
        const songData = await songService.getById(songId);

        // Transform song data
        const transformedSong = {
          id: songData.id,
          title: songData.title,
          artist: songData.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
          coverArt: songData.thumbnailUrl,
          duration: formatDuration(songData.durationSeconds),
          album: songData.album?.title || 'Unknown Album',
          genres: songData.genres?.map(g => g.name) || [],
          playCount: songData.play_count || songData.playCount || 0,
          originalData: songData
        };

        setSong(transformedSong);

        // Fetch related songs (top played songs excluding current)
        const topSongs = await songService.getTopByPlayCount({ limit: 20 });
        const related = topSongs
          .filter(s => s.id !== songId)
          .slice(0, 10)
          .map((s, index) => ({
            id: s.id,
            rank: index + 1,
            title: s.title,
            artist: s.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
            coverArt: s.thumbnailUrl,
            duration: formatDuration(s.durationSeconds),
            playCount: s.play_count || s.playCount || 0,
            originalData: s
          }));

        setRelatedSongs(related);
      } catch (err) {
        console.error('Error fetching song details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (songId) {
      fetchSongData();
    }
  }, [songId]);

  const handlePlaySong = () => {
    if (song?.originalData) {
      const playlist = [song.originalData, ...relatedSongs.map(s => s.originalData)];
      dispatch(playTrack({
        track: song.originalData,
        playlist: playlist
      }));
    }
  };

  const handlePlayRelated = (relatedSong) => {
    if (relatedSong.originalData) {
      const playlist = relatedSongs.map(s => s.originalData);
      dispatch(playTrack({
        track: relatedSong.originalData,
        playlist: playlist
      }));
    }
  };

  const handleToggleFavorite = () => {
    if (song?.originalData) {
      toggleFavorite(song.originalData);
    }
  };

  if (loading) {
    return (
      <main className="pt-24 pb-32 px-4 md:px-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-cyan-400 text-xl">Loading song...</div>
        </div>
      </main>
    );
  }

  if (error || !song) {
    return (
      <main className="pt-24 pb-32 px-4 md:px-8 text-white min-h-screen">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-cyan-400 transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <div className="text-center py-20">
          <h1 className="text-2xl text-red-400 mb-4">Song not found!</h1>
          <p className="text-slate-400 mb-6">{error || 'The requested song could not be loaded.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-cyan-400 text-slate-900 rounded-full hover:bg-cyan-300 transition"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-0 px-4 md:px-8 text-white">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-cyan-400 transition flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Song Info Section */}
        <div className="w-full lg:w-1/3 flex-shrink-0">
          <div className="relative mb-6 overflow-hidden rounded-2xl bg-slate-800 aspect-square shadow-2xl shadow-cyan-500/20">
            {song.coverArt ? (
              <img
                src={song.coverArt}
                alt={song.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                🎵
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold truncate mb-2">{song.title}</h1>
          <p className="text-lg md:text-xl text-slate-400 mb-2 truncate">{song.artist}</p>
          <p className="text-sm text-slate-500 mb-1">{song.album}</p>
          <p className="text-xs text-slate-500 mb-4">{song.playCount} plays • {song.duration}</p>

          {song.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {song.genres.map((genre, index) => (
                <span
                  key={index}
                  className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handlePlaySong}
              className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 px-6 md:px-8 py-3 rounded-full font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" fill="white" />
              Play
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`p-3 border rounded-full transition ${isFavorite(song.id)
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-slate-700 hover:bg-slate-800'
                }`}
            >
              <Heart
                className={`w-5 h-5 ${isFavorite(song.id) ? 'fill-red-500 text-red-500' : ''}`}
              />
            </button>
            <button className="p-3 border border-slate-700 rounded-full hover:bg-slate-800 transition">
              <Plus className="w-5 h-5" />
            </button>
            <button className="p-3 border border-slate-700 rounded-full hover:bg-slate-800 transition">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Related Tracks Section */}
        <div className="w-full lg:w-2/3">
          <h2 className="text-xl md:text-2xl font-bold text-cyan-400 mb-6">
            Related Tracks
          </h2>
          {relatedSongs.length > 0 ? (
            <div className="space-y-2">
              {relatedSongs.map((track) => (
                <TrackRow
                  key={track.id}
                  {...track}
                  onSelect={() => handlePlayRelated(track)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <p>No related tracks found</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default SongDetailPage;