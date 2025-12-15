import { createSlice } from '@reduxjs/toolkit';

// Helper: Chuyển đổi thời gian linh hoạt (Số hoặc Chuỗi)
function parseDuration(input) {
    if (!input) return 0;
    
    // Nếu là số (API trả về giây), dùng luôn
    if (typeof input === 'number') return input;
    
    // Nếu là chuỗi "mm:ss" (Mock data cũ)
    if (typeof input === 'string' && input.includes(':')) {
        const [m, s] = input.split(":").map(Number);
        return m * 60 + s;
    }
    
    // Trường hợp khác (string số), ép kiểu về số
    return Number(input) || 0;
}

const initialState = {
    currentTrack: null,
    playlist: [],
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isShuffle: false,
    repeatMode: 'off', // 'off', 'all', 'one'
};

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        // 1. Phát một bài hát mới
        playTrack: (state, action) => {
            const { track, playlist } = action.payload;
            state.currentTrack = track;
            
            // Nếu có playlist mới thì cập nhật, không thì giữ playlist cũ
            if (playlist && Array.isArray(playlist) && playlist.length > 0) {
                state.playlist = playlist;
            } else if (!state.playlist.find(s => s.id === track.id)) {
                // Nếu bài hát lẻ không có trong playlist hiện tại, thêm nó vào
                state.playlist = [track];
            }

            state.isPlaying = true;
            state.currentTime = 0;
            
            // Xử lý duration (Ưu tiên durationSeconds từ API)
            const duration = track.durationSeconds || track.duration;
            state.duration = parseDuration(duration);
        },

        // 2. Toggle Play/Pause
        togglePlay: (state) => {
            if (state.currentTrack) {
                state.isPlaying = !state.isPlaying;
            }
        },
        play: (state) => {
            state.isPlaying = true;
        },
        pause: (state) => {
            state.isPlaying = false;
        },

        // 3. Cập nhật thời gian chạy (Time Update)
        setCurrentTime: (state, action) => {
            state.currentTime = action.payload;
        },
        
        setDuration: (state, action) => {
            state.duration = parseDuration(action.payload);
        },

        // 4. Next Track (Xử lý Shuffle & Repeat)
        nextTrack: (state) => {
            if (!state.playlist || state.playlist.length === 0) return;

            const currentIndex = state.playlist.findIndex(
                track => track.id === state.currentTrack?.id
            );

            let nextIndex = -1;

            if (state.isShuffle) {
                // Random nhưng cố gắng không trùng bài hiện tại
                if (state.playlist.length === 1) {
                    nextIndex = 0;
                } else {
                    do {
                        nextIndex = Math.floor(Math.random() * state.playlist.length);
                    } while (nextIndex === currentIndex);
                }
            } else {
                // Tuần tự
                if (currentIndex < state.playlist.length - 1) {
                    nextIndex = currentIndex + 1;
                } else {
                    // Đã đến cuối danh sách
                    if (state.repeatMode === 'all') {
                        nextIndex = 0; // Quay lại đầu
                    } else {
                        // Hết bài, dừng lại
                        state.isPlaying = false;
                        state.currentTime = 0;
                        return; 
                    }
                }
            }

            if (nextIndex !== -1) {
                const nextSong = state.playlist[nextIndex];
                state.currentTrack = nextSong;
                state.currentTime = 0;
                const duration = nextSong.durationSeconds || nextSong.duration;
                state.duration = parseDuration(duration);
                state.isPlaying = true;
            }
        },

        // 5. Previous Track
        previousTrack: (state) => {
            // Nếu đã nghe quá 3 giây, bấm Previous sẽ replay lại từ đầu bài
            if (state.currentTime > 3) {
                state.currentTime = 0;
                return;
            }

            if (!state.playlist || state.playlist.length === 0) return;

            const currentIndex = state.playlist.findIndex(
                track => track.id === state.currentTrack?.id
            );

            let prevIndex = -1;

            if (currentIndex > 0) {
                prevIndex = currentIndex - 1;
            } else {
                // Nếu đang ở bài đầu tiên
                if (state.repeatMode === 'all') {
                    prevIndex = state.playlist.length - 1; // Quay về bài cuối
                } else {
                    // Replay bài đầu
                    prevIndex = 0; 
                }
            }

            const prevSong = state.playlist[prevIndex];
            state.currentTrack = prevSong;
            state.currentTime = 0;
            const duration = prevSong.durationSeconds || prevSong.duration;
            state.duration = parseDuration(duration);
            state.isPlaying = true;
        },

        // 6. Các settings khác
        setPlaylist: (state, action) => {
            state.playlist = action.payload;
        },
        setVolume: (state, action) => {
            state.volume = action.payload;
        },
        toggleShuffle: (state) => {
            state.isShuffle = !state.isShuffle;
        },
        setRepeatMode: (state) => {
            // Cycle: off -> all -> one -> off
            const modes = ['off', 'all', 'one'];
            const nextIndex = (modes.indexOf(state.repeatMode) + 1) % modes.length;
            state.repeatMode = modes[nextIndex];
        },
        seekTo: (state, action) => {
            state.currentTime = action.payload;
        },
    },
});

export const {
    playTrack,
    togglePlay,
    play,
    pause,
    setCurrentTime,
    setDuration,
    nextTrack,
    previousTrack,
    setPlaylist,
    setVolume,
    toggleShuffle,
    setRepeatMode,
    seekTo
} = playerSlice.actions;

export default playerSlice.reducer;