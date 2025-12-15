// src/components/PlayerControl.jsx
import { useState } from 'react';
import { usePlayer } from '../hooks/usePlayer';
import { useFavorites } from '../pages/FavouritePage/FavouritePage';
import { Play, Pause, SkipBack, SkipForward, Share2, Volume2, Shuffle, Repeat, Heart, Users } from 'lucide-react';
import JamQueueSidebar from './JamQueueSidebar';
import playlistService from '../services/playlistService';

function toMinutes(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = String(Math.floor(seconds % 60)).padStart(2, "0");
  return `${m}:${s}`;
}

const PlayerControl = ({ isSidebarOpen, isSidebarExpanded, isDesktop, isJamOpen, setIsJamOpen }) => {
  const [jamSession, setJamSession] = useState(null);
  const [isLoadingJam, setIsLoadingJam] = useState(false);

  const {
    currentTrack, isPlaying, currentTime, duration, volume, isShuffle, repeatMode,
    togglePlay, next, previous, toggleShuffle, toggleRepeat, setVolume, seekTo
  } = usePlayer();

  const { toggleFavorite, isFavorite } = useFavorites();

  const startJamSession = async () => {
    if (jamSession) {
      setIsJamOpen(!isJamOpen);
      return;
    }

    try {
      setIsLoadingJam(true);
      const res = await playlistService.startSession();
      const sessionData = res.data?.data || res.data || res;

      setJamSession(sessionData);
      setIsJamOpen(true);

    } catch (error) {
      console.error("Error creating jam", error);
      const errorCode = error.response?.data?.message;
      if (errorCode === 'sv_err_live_playlist_session_already_exists') {
        setIsJamOpen(true);
        alert("Session cũ vẫn còn tồn tại. Sidebar đã được mở lại.");
      } else {
        alert("Lỗi kết nối Jam Server.");
      }
    } finally {
      setIsLoadingJam(false);
    }
  };

  if (!currentTrack) return null;

  const currentImage = currentTrack.coverArt || currentTrack.thumbnailUrl || currentTrack.cover_url || "";

  const getArtistName = (track) => {
    if (!track) return "Unknown Artist";

    // Case 1: artist is string
    if (typeof track.artist === 'string') return track.artist;

    // Case 2: artist is object with name
    if (track.artist?.name) return track.artist.name;

    // Case 3: artists array
    if (Array.isArray(track.artists)) {
      if (track.artists.length === 0) return "Unknown Artist";

      // Handle array of strings: ["Midnight Jazz Quartet"]
      if (typeof track.artists[0] === 'string') {
        return track.artists.join(', ');
      }

      // Handle array of objects: [{name: "Midnight Jazz Quartet"}]
      return track.artists.map(a => a.name || a).join(', ');
    }

    return "Unknown Artist";
  };
  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seekTo(Math.floor(percent * duration));
  };

  const handleVolumeChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setVolume(Math.max(0, Math.min(1, percent)));
  };

  const renderCoverArt = (imgUrl) => {
    if (!imgUrl) return <div className="w-full h-full flex items-center justify-center bg-slate-800 text-2xl">🎵</div>;
    return <img src={imgUrl} alt="Cover" className="w-full h-full object-cover" />;
  };

  return (
    <>
      {/* 1. JAM SIDEBAR */}
      {isJamOpen && (
        <JamQueueSidebar
          sessionData={jamSession}
          onClose={() => setIsJamOpen(false)}
          currentUser={{ name: "You" }}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
        />
      )}

      {/* 2. MAIN PLAYER BAR */}
      <footer
        className={`fixed bottom-0 left-0 flex flex-col z-50 transition-all duration-300 
        ${isDesktop && isSidebarOpen ? (isSidebarExpanded ? 'ml-64' : 'ml-20') : 'ml-0'}
        ${isJamOpen ? 'right-[350px]' : 'right-0'} 
        `}
      >
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-t border-cyan-500/20 backdrop-blur-sm px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0 relative z-50">

          {/* Track Info */}
          <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
            <div className="relative w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {renderCoverArt(currentImage)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-base truncate text-white">{currentTrack.title}</div>
              {/* [CẬP NHẬT] Gọi hàm getArtistName thay vì gọi trực tiếp */}
              <div className="text-sm text-slate-400 truncate">{getArtistName(currentTrack)}</div>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex-1 flex flex-col items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-6 text-white">
              <button onClick={toggleShuffle} className={`transition hover:text-cyan-400 hover:scale-110 active:scale-95 ${isShuffle ? 'text-cyan-400' : ''}`}><Shuffle className="w-5 h-5" /></button>
              <button onClick={previous} className="transition hover:text-cyan-400 hover:scale-110 active:scale-95"><SkipBack className="w-5 h-5" /></button>
              <button onClick={togglePlay} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 active:scale-95 transition">
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <button onClick={next} className="transition hover:text-cyan-400 hover:scale-110 active:scale-95"><SkipForward className="w-5 h-5" /></button>
              <button onClick={toggleRepeat} className={`transition hover:text-cyan-400 hover:scale-110 active:scale-95 ${repeatMode !== 'off' ? 'text-cyan-400' : ''}`}><Repeat className="w-5 h-5" /></button>
            </div>
            <div className="w-full flex items-center gap-3">
              <span className="text-xs text-slate-400 w-8 text-right">{toMinutes(currentTime)}</span>
              <div className="flex-1 h-1 bg-slate-600 rounded-full cursor-pointer group" onClick={handleProgressClick}>
                <div className="h-full bg-white rounded-full relative group-hover:bg-green-500" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}></div>
              </div>
              <span className="text-xs text-slate-400 w-8">{toMinutes(duration)}</span>
            </div>
          </div>

          {/* Volume & Actions */}
          <div className="flex items-center gap-4 flex-1 justify-end text-white hidden md:flex">
            <button onClick={() => toggleFavorite(currentTrack)} className="hover:text-cyan-400 transition">
              <Heart className={`w-5 h-5 ${isFavorite(currentTrack.id) ? 'fill-red-500 text-red-500' : ''}`} />
            </button>

            <button className="hover:text-cyan-400 transition">
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={startJamSession}
              className={`hover:text-cyan-400 transition ${isJamOpen ? 'text-green-500' : ''}`}
              title={jamSession ? "Toggle Jam Sidebar" : "Start a Jam Session"}
            >
              {isLoadingJam ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Users className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center gap-2 w-24">
              <Volume2 className="w-5 h-5" />
              <div className="flex-1 h-1 bg-slate-600 rounded-full cursor-pointer" onClick={handleVolumeChange}>
                <div className="h-full bg-white rounded-full" style={{ width: `${volume * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default PlayerControl;