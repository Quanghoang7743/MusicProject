import { useDispatch, useSelector } from 'react-redux';
import {
  togglePlay,
  play,
  pause,
  nextTrack,
  previousTrack,
  playTrack,
  setPlaylist,
  toggleShuffle,
  setRepeatMode,
  setVolume,
  seekTo,
} from '../redux/slices/playerSlice';

export const usePlayer = () => {
  const dispatch = useDispatch();
  const playerState = useSelector((state) => state.player);

  return {
    ...playerState,
    
    playTrack: (track, playlist = null) => {
      dispatch(playTrack({ track, playlist }));
    },
    
    togglePlay: () => {
      dispatch(togglePlay());
    },
    
    play: () => {
      dispatch(play());
    },
    
    pause: () => {
      dispatch(pause());
    },
    
    next: () => {
      dispatch(nextTrack());
    },
    
    previous: () => {
      dispatch(previousTrack());
    },
    
    setPlaylist: (playlist) => {
      dispatch(setPlaylist(playlist));
    },
    
    toggleShuffle: () => {
      dispatch(toggleShuffle());
    },
    
    toggleRepeat: () => {
      dispatch(setRepeatMode());
    },
    
    setVolume: (volume) => {
      dispatch(setVolume(volume));
    },
    
    seekTo: (time) => {
      dispatch(seekTo(time));
    },
  };
};