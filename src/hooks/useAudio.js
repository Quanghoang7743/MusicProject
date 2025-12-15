import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setCurrentTime, 
  nextTrack, 
  pause,
  setDuration 
} from '../redux/slices/playerSlice';
import songService from '../services/songService';

export const useAudio = () => {
  const audioRef = useRef(null);
  const dispatch = useDispatch();
  
  // Dùng useRef để lưu track hiện tại, giúp so sánh tránh re-load không cần thiết
  const previousTrackRef = useRef(null);
  
  const { currentTrack, isPlaying, currentTime, volume, repeatMode } = useSelector(
    (state) => state.player
  );

  // 1. Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto'; // Đổi thành auto để load nhanh hơn
    }

    const audio = audioRef.current;
    
    const handleLoadedMetadata = () => {
      const durationInSeconds = Math.floor(audio.duration);
      // Chỉ dispatch nếu duration hợp lệ (tránh NaN)
      if (!isNaN(durationInSeconds)) {
        dispatch(setDuration(durationInSeconds));
        console.log('✅ Audio loaded:', durationInSeconds + 's');
      }
    };

    const handleTimeUpdate = () => {
      const currentSeconds = Math.floor(audio.currentTime);
      dispatch(setCurrentTime(currentSeconds));
    };

    const handleEnded = () => {
      console.log('🎵 Track ended');
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        safePlay(audio); // Dùng hàm safePlay
      } else {
        dispatch(nextTrack());
      }
    };

    // Called when playback actually starts (fires when audio begins playing)
    const handlePlaying = () => {
      try {
        const track = previousTrackRef.current;
        if (track && track.id) {
          // Ensure we only record once per track start
          if (!audio._lastRecordedPlayId || audio._lastRecordedPlayId !== track.id) {
            audio._lastRecordedPlayId = track.id;
            // Fire-and-forget record play call; don't block UI
            songService.recordPlay(track.id).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Error in playing handler:', err);
      }
    };

    const handleError = (e) => {
      console.error('❌ Audio error event:', e);
      // Không dispatch pause ngay lập tức để tránh loop nếu lỗi nhẹ
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('error', handleError);
    };
  }, [dispatch, repeatMode]); // Bỏ currentTrack ra khỏi đây

  /// --- Helper: Hàm Play an toàn ---
  const safePlay = async (audio) => {
    try {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        console.log('▶️ Playing safe');
      }
    } catch (error) {
      // ✅ SỬA: Bỏ qua cả lỗi AbortError (do chuyển bài nhanh) và NotAllowedError (do chưa tương tác)
      if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
        console.error('❌ Play failed:', error);
      } else if (error.name === 'NotAllowedError') {
        console.warn('⚠️ Autoplay bị chặn. Người dùng cần click Play thủ công.');
        // Có thể dispatch(pause()) ở đây để nút Play trên giao diện chuyển về trạng thái Pause
      }
    }
  };

  // 2. Update audio source (Chỉ chạy khi đổi bài)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audioUrl) return;

    // Kiểm tra xem có phải bài hát mới không?
    // Nếu ID hoặc URL giống hệt bài cũ thì KHÔNG load lại (tránh lỗi reload khi re-render)
    if (previousTrackRef.current?.audioUrl === currentTrack.audioUrl) {
      return;
    }

    console.log('🎵 Loading new track:', currentTrack.title);
    
    // Update ref
    previousTrackRef.current = currentTrack;

    // Pause bài cũ trước khi đổi
    audio.pause();
    audio.src = currentTrack.audioUrl;
    audio.load();
    
    if (isPlaying) {
      safePlay(audio);
    }
  }, [currentTrack?.audioUrl]); // Chỉ phụ thuộc vào URL

  // 3. Handle play/pause toggle (Chỉ chạy khi bấm nút Play/Pause)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (isPlaying) {
      safePlay(audio);
    } else {
      audio.pause();
      console.log('⏸️ Paused');
    }
  }, [isPlaying]);

  // 4. Handle volume
  useEffect(() => {
    if (audioRef.current) {
      // Đảm bảo volume từ 0-1
      const safeVolume = Math.max(0, Math.min(1, volume));
      audioRef.current.volume = safeVolume;
    }
  }, [volume]);

  // 5. Handle manual seeking
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && Math.abs(audio.currentTime - currentTime) > 2) {
      // Kiểm tra xem currentTime có hợp lệ không
      if (isFinite(currentTime)) {
        audio.currentTime = currentTime;
        console.log('⏩ Seeked to:', currentTime);
      }
    }
  }, [currentTime]);

  return audioRef;
};