// All images moved to public/images — NO imports needed.

// Test audio URL
const testAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

// === Danh sách toàn bộ bài hát (đều dùng ảnh thật) ===
const ALL_SONGS = [
  { id: 'song-1', title: "Until I Met You", artist: "Amy Conrad", duration: "5:33", plays: "12M", album: "Unify Jazz", coverArt: "/images/song1.jpg", genre: "Jazz", audioUrl: testAudioUrl },
  { id: 'song-2', title: "Mellows Promises", artist: "Amy Conrad", duration: "3:20", plays: "10M", album: "Chand Ave", coverArt: "/images/song2.jpg", genre: "Soul", audioUrl: testAudioUrl },
  { id: 'song-3', title: "Always Your Lifeboat", artist: "Amy Conrad", duration: "4:15", plays: "9M", album: "Bonefish", coverArt: "/images/song3.jpg", genre: "Indie", audioUrl: testAudioUrl },
  { id: 'song-4', title: "Record Breaks", artist: "Amy Conrad", duration: "3:45", plays: "8M", album: "Ultra Hype", coverArt: "/images/song4.jpg", genre: "Pop", audioUrl: testAudioUrl },
  { id: 'song-5', title: "Rock Alley Acoustic", artist: "Amy Conrad", duration: "5:10", plays: "7M", album: "Upto James", coverArt: "/images/song5.jpg", genre: "Rock", audioUrl: testAudioUrl },
  { id: 'song-6', title: "Space Your Horizon", artist: "Amy Conrad & Brian Hill", duration: "4:22", plays: "6M", album: "Bonefish", coverArt: "/images/song6.jpg", genre: "Indie", audioUrl: testAudioUrl },
  { id: 'song-7', title: "Midnight Echo", artist: "Amy Conrad", duration: "3:55", plays: "5M", album: "Unify Jazz", coverArt: "/images/song7.jpg", genre: "Jazz", audioUrl: testAudioUrl },
  { id: 'song-8', title: "Dancing Shadows", artist: "Amy Conrad & Brian Hill", duration: "4:40", plays: "4M", album: "Chand Ave", coverArt: "/images/song8.jpg", genre: "Dancing", audioUrl: testAudioUrl },
  { id: 'song-9', title: "Silent Whispers", artist: "Amy Conrad", duration: "3:30", plays: "3M", album: "Ultra Hype", coverArt: "/images/song9.jpg", genre: "Classical", audioUrl: testAudioUrl },
  { id: 'song-10', title: "Neon Dreams", artist: "Amy Conrad & Brian Hill", duration: "4:05", plays: "2M", album: "Upto James", coverArt: "/images/song10.jpg", genre: "EDM", audioUrl: testAudioUrl },
  { id: 'song-11', title: "Velvet Night", artist: "Amy Conrad", duration: "4:20", plays: "1.5M", album: "Unify Jazz", coverArt: "/images/song11.jpg", genre: "Jazz", audioUrl: testAudioUrl },
  { id: 'song-12', title: "Crystal Dreams", artist: "Brian Hill", duration: "3:40", plays: "1M", album: "Chand Ave", coverArt: "/images/song12.jpg", genre: "Blues", audioUrl: testAudioUrl },
  { id: 'song-13', title: "Golden Hour", artist: "Amy Conrad", duration: "4:55", plays: "900K", album: "Bonefish", coverArt: "/images/song13.jpg", genre: "Folk", audioUrl: testAudioUrl },
  { id: 'song-14', title: "Stardust Memories", artist: "Amy Conrad & Brian Hill", duration: "3:25", plays: "800K", album: "Ultra Hype", coverArt: "/images/song14.jpg", genre: "Romantic", audioUrl: testAudioUrl },
  { id: 'song-15', title: "Moonlight Serenade", artist: "Amy Conrad", duration: "5:00", plays: "700K", album: "Upto James", coverArt: "/images/song15.jpg", genre: "Soul", audioUrl: testAudioUrl },
  { id: 'song-16', title: "Eternal Love", artist: "The Romantics", duration: "4:12", plays: "650K", album: "Love Songs", coverArt: "/images/song16.jpg", genre: "Romantic", audioUrl: testAudioUrl },
  { id: 'song-17', title: "Hearts Unite", artist: "Love Symphony", duration: "3:58", plays: "600K", album: "Together", coverArt: "/images/song17.jpg", genre: "Romantic", audioUrl: testAudioUrl },
  { id: 'song-18', title: "Dream Your Moments (Duet)", artist: "Ava Cornish & Brian Hill", duration: "4:30", plays: "550K", album: "Romantic Collection", coverArt: "/images/song18.jpg", genre: "Romantics", audioUrl: testAudioUrl },
  { id: 'song-19', title: "Until I Met You", artist: "Ava Cornish & Brian Hill", duration: "3:50", plays: "500K", album: "Love Stories", coverArt: "/images/song19.jpg", genre: "Romantics", audioUrl: testAudioUrl },
  { id: 'song-20', title: "Gimme Some Courage", artist: "Ava Cornish & Brian Hill", duration: "4:10", plays: "480K", album: "Brave Hearts", coverArt: "/images/song20.jpg", genre: "Romantics", audioUrl: testAudioUrl },
  { id: 'song-21', title: "Dark Alley Acoustic", artist: "Ava Cornish & Brian Hill", duration: "3:40", plays: "460K", album: "Acoustic Sessions", coverArt: "/images/song21.jpg", genre: "Romantics", audioUrl: testAudioUrl },
  { id: 'song-22', title: "Walking Promises", artist: "Ava Cornish & Brian Hill", duration: "4:00", plays: "440K", album: "Journey Together", coverArt: "/images/song22.jpg", genre: "Romantics", audioUrl: testAudioUrl },
  { id: 'song-23', title: "Desired Games", artist: "Ava Cornish & Brian Hill", duration: "3:35", plays: "420K", album: "Playful Love", coverArt: "/images/song23.jpg", genre: "Romantics", audioUrl: testAudioUrl },
  { id: 'song-24', title: "Bloodlust", artist: "Ava Cornish & Brian Hill", duration: "3:35", plays: "400K", album: "Pure Emotions", coverArt: "/images/song24.jpg", genre: "Pure Love", audioUrl: testAudioUrl },
  { id: 'song-25', title: "Time flies", artist: "Ava Cornish & Brian Hill", duration: "4:20", plays: "380K", album: "Moments", coverArt: "/images/song25.jpg", genre: "Pure Love", audioUrl: testAudioUrl },
  { id: 'song-26', title: "Dark matters", artist: "Ava Cornish & Brian Hill", duration: "3:55", plays: "360K", album: "Deep Feelings", coverArt: "/images/song26.jpg", genre: "Pure Love", audioUrl: testAudioUrl },
  { id: 'song-27', title: "Eye to eye", artist: "Ava Cornish & Brian Hill", duration: "4:15", plays: "340K", album: "Connection", coverArt: "/images/song27.jpg", genre: "Pure Love", audioUrl: testAudioUrl },
  { id: 'song-28', title: "Cloud nine", artist: "Ava Cornish & Brian Hill", duration: "3:45", plays: "320K", album: "Euphoria", coverArt: "/images/song28.jpg", genre: "Pure Love", audioUrl: testAudioUrl },
  { id: 'song-29', title: "Cabweb of lies", artist: "Ava Cornish & Brian Hill", duration: "4:05", plays: "300K", album: "Truth", coverArt: "/images/song29.jpg", genre: "Pure Love", audioUrl: testAudioUrl },
  { id: 'song-30', title: "Symphony No. 5", artist: "Orchestra Classic", duration: "5:20", plays: "550K", album: "Classical Masterpieces", coverArt: "/images/song30.jpg", genre: "Classical", audioUrl: testAudioUrl },
  { id: 'song-31', title: "Piano Concerto", artist: "Classical Masters", duration: "6:15", plays: "500K", album: "Piano Collection", coverArt: "/images/song31.jpg", genre: "Classical", audioUrl: testAudioUrl },
  { id: 'song-32', title: "Violin Sonata", artist: "String Quartet", duration: "4:45", plays: "450K", album: "Chamber Music", coverArt: "/images/song32.jpg", genre: "Classical", audioUrl: testAudioUrl },
  { id: 'song-33', title: "Rap Battle", artist: "MC Flow", duration: "3:10", plays: "1.2M", album: "Street Talk", coverArt: "/images/song33.jpg", genre: "Hip Hop", audioUrl: testAudioUrl },
  { id: 'song-34', title: "Street Beats", artist: "Urban Kings", duration: "3:45", plays: "980K", album: "City Life", coverArt: "/images/song34.jpg", genre: "Hip Hop", audioUrl: testAudioUrl },
  { id: 'song-35', title: "Thunder Strike", artist: "Rock Legends", duration: "5:30", plays: "1.8M", album: "Electric", coverArt: "/images/song35.jpg", genre: "Rock", audioUrl: testAudioUrl },
  { id: 'song-36', title: "Salsa Night", artist: "Latin Beats", duration: "3:50", plays: "750K", album: "Dance Floor", coverArt: "/images/song36.jpg", genre: "Dancing", audioUrl: testAudioUrl },
  { id: 'song-37', title: "Electric Pulse", artist: "DJ Techno", duration: "4:30", plays: "1.1M", album: "Rave", coverArt: "/images/song37.jpg", genre: "EDM", audioUrl: testAudioUrl },
  { id: 'song-38', title: "Smooth Jazz", artist: "Jazz Ensemble", duration: "4:10", plays: "600K", album: "Evening Jazz", coverArt: "/images/song38.jpg", genre: "Jazz", audioUrl: testAudioUrl },
  { id: 'song-39', title: "Pop Star", artist: "Chart Toppers", duration: "3:20", plays: "2.5M", album: "Hit Singles", coverArt: "/images/song39.jpg", genre: "Pop", audioUrl: testAudioUrl },
  { id: 'song-40', title: "Country Road", artist: "Folk Band", duration: "4:00", plays: "500K", album: "Rural Life", coverArt: "/images/song40.jpg", genre: "Folk", audioUrl: testAudioUrl },
  { id: 'song-41', title: "Indie Vibes", artist: "Underground", duration: "3:55", plays: "450K", album: "Alternative", coverArt: "/images/song41.jpg", genre: "Indie", audioUrl: testAudioUrl },
  { id: 'song-42', title: "Soulful Journey", artist: "Soul Sisters", duration: "4:25", plays: "680K", album: "Soul Collection", coverArt: "/images/song42.jpg", genre: "Soul", audioUrl: testAudioUrl },
  { id: 'song-43', title: "Blues Night", artist: "Blues Brothers", duration: "5:00", plays: "520K", album: "Midnight Blues", coverArt: "/images/song43.jpg", genre: "Blues", audioUrl: testAudioUrl },
];

// ====== EXTRA SONGS ======
const EXTRA_SONGS = [
  { id: 'song-44', title: "Sweet Rendezvous", artist: "Amy Conrad", duration: "3:40", plays: "300K", album: "Love Bloom", coverArt: "/images/song44.jpg", genre: "Romantic", audioUrl: testAudioUrl },
  { id: 'song-45', title: "Promise Me", artist: "Brian Hill", duration: "4:05", plays: "280K", album: "Promise Me", coverArt: "/images/song45.jpg", genre: "Romantic", audioUrl: testAudioUrl },
  { id: 'song-46', title: "Tender Nights", artist: "The Romantics", duration: "3:55", plays: "260K", album: "Love Lights", coverArt: "/images/song46.jpg", genre: "Romantic", audioUrl: testAudioUrl },
];

// Gộp bài hát
const ALL_SONGS_FULL = [...ALL_SONGS, ...EXTRA_SONGS];

// === Artists ===
const ALL_ARTISTS = [
  { id: 'artist-1', name: "Amy Conrad", image: "/images/artist1.jpg", albums: ["Best Of Ava Cornish"] },
  { id: 'artist-2', name: "Brian Hill", image: "/images/artist2.jpg", albums: ["Until I Met You"] },
  { id: 'artist-3', name: "The Jazz Collective", image: "/images/artist3.jpg", albums: ["Gimme Some Courage"] },
  { id: 'artist-4', name: "Echo Rivers", image: "/images/artist4.jpg", albums: ["Dark Alley Acoustic"] },
  { id: 'artist-5', name: "Sunset Boulevard", image: "/images/artist5.jpg", albums: ["Walking Promises"] },
  { id: 'artist-6', name: "Midnight Voices", image: "/images/artist6.jpg", albums: ["Desired Games"] },
  { id: 'artist-7', name: "Claire Hudson", image: "/images/artist7.jpg", albums: ["Winter Songs"] },
  { id: 'artist-8', name: "Carl Brown", image: "/images/artist8.jpg", albums: ["Brown Beats"] },
  { id: 'artist-9', name: "Virginia Harris", image: "/images/artist9.jpg", albums: ["Country Roads"] },
  { id: 'artist-10', name: "Max Glover", image: "/images/artist10.jpg", albums: ["Max Hits"] },
  { id: 'artist-11', name: "Jennifer Kelly", image: "/images/artist11.jpg", albums: ["Kelly's World"] },
  { id: 'artist-12', name: "Harry Jackson", image: "/images/artist12.jpg", albums: ["Jackson Five"] },
  { id: 'artist-13', name: "Kevin Buckland", image: "/images/artist13.jpg", albums: ["Business Time"] },
  { id: 'artist-14', name: "Anna Ellison", image: "/images/artist14.jpg", albums: ["Anna's Collection"] },
  { id: 'artist-15', name: "Kylie Greene", image: "/images/artist15.jpg", albums: ["Green Days"] },
  { id: 'artist-16', name: "Sarah Wilson", image: "/images/artist16.jpg", albums: ["Midnight Sarah"] },
  { id: 'artist-17', name: "Steven Walker", image: "/images/artist17.jpg", albums: ["Walking Tunes"] },
  { id: 'artist-18', name: "Olivia Paige", image: "/images/artist18.jpg", albums: ["Paige Turner"] },
  { id: 'artist-19', name: "Nicole Miller", image: "/images/artist19.jpg", albums: ["Miller Time"] },
  { id: 'artist-20', name: "Edward Clark", image: "/images/artist20.jpg", albums: ["Sunny Days"] },
  { id: 'artist-21', name: "Adam Glover", image: "/images/artist21.jpg", albums: ["Winter Warmth"] },
  { id: 'artist-22', name: "Leah Knox", image: "/images/artist22.jpg", albums: ["Dark Beauty"] },
  { id: 'artist-23', name: "Charles Davidson", image: "/images/artist23.jpg", albums: ["Classical Charm"] },
  { id: 'artist-24', name: "Vanessa Hunter", image: "/images/artist24.jpg", albums: ["Summer Vibes"] },
  { id: 'artist-25', name: "Sophie Hudson", image: "/images/artist25.jpg", albums: ["Acoustic Soul"] },
];

// === Albums ===
const ALL_ALBUMS = [
  { id: "album-1", title: "Dream Horizons", artist: "Amy Conrad", coverArt: "/images/album1.jpg" },
  { id: "album-2", title: "Soul Journey", artist: "Brian Hill", coverArt: "/images/album2.jpg" },
  { id: "album-3", title: "Golden Light", artist: "The Romantics", coverArt: "/images/album3.jpg" },
  { id: "album-4", title: "Midnight Echoes", artist: "Ava Cornish", coverArt: "/images/album4.jpg" },
  { id: "album-5", title: "Skyline", artist: "DJ Techno", coverArt: "/images/album5.jpg" },
  { id: "album-6", title: "Echo of Time", artist: "Orchestra Classic", coverArt: "/images/album6.jpg" },
];

const ALL_STATIONS = [
  { id: 'station-1', title: "Favorites" },
  { id: 'station-2', title: "Type-Series" },
  { id: 'station-3', title: "Relaxing" },
  { id: 'station-4', title: "Jazz" },
  { id: 'station-5', title: "Soul" },
];

// === History Songs ===
export const HISTORY_SONGS = [
  { historyId: '1', id: 'song-1', title: 'Until I Met You', artist: 'Amy Conrad', coverArt: "/images/song1.jpg" },
  { historyId: '2', id: 'song-2', title: 'Mellows Promises', artist: 'Amy Conrad', coverArt: "/images/song2.jpg" },
  { historyId: '3', id: 'song-3', title: 'Always Your Lifeboat', artist: 'Amy Conrad', coverArt: "/images/song3.jpg" },
  { historyId: '4', id: 'song-4', title: 'Record Breaks', artist: 'Amy Conrad', coverArt: "/images/song4.jpg" },
  { historyId: '5', id: 'song-5', title: 'Rock Alley Acoustic', artist: 'Amy Conrad', coverArt: "/images/song5.jpg" },
  { historyId: '6', id: 'song-6', title: 'Space Your Horizon', artist: 'Amy Conrad & Brian Hill', coverArt: "/images/song6.jpg" },
  { historyId: '7', id: 'song-7', title: 'Midnight Echo', artist: 'Amy Conrad', coverArt: "/images/song7.jpg" },
  { historyId: '8', id: 'song-8', title: 'Dancing Shadows', artist: 'Amy Conrad & Brian Hill', coverArt: "/images/song8.jpg" },
  { historyId: '9', id: 'song-9', title: 'Silent Whispers', artist: 'Amy Conrad', coverArt: "/images/song9.jpg" },
  { historyId: '10', id: 'song-10', title: 'Neon Dreams', artist: 'Amy Conrad & Brian Hill', coverArt: "/images/song10.jpg" },
  { historyId: '11', id: 'song-11', title: 'Velvet Night', artist: 'Amy Conrad', coverArt: "/images/song11.jpg" },
  { historyId: '12', id: 'song-12', title: 'Crystal Dreams', artist: 'Brian Hill', coverArt: "/images/song12.jpg" },
];

// === Genres ===
const ALL_GENRES = [
  { id: 1, name: 'Romantic', gradient: 'from-cyan-400 via-blue-400 to-blue-500', row: 1, col: 1, rowSpan: 2, colSpan: 2, coverArt: "/images/romantic.jpg" },
  { id: 2, name: 'Pure Love', gradient: 'from-pink-500 via-rose-500 to-red-500', coverArt: "/images/purelove.jpg" },
  { id: 3, name: 'Classical', gradient: 'from-amber-600 via-orange-600 to-red-600', coverArt: "/images/classical.jpg" },
  { id: 4, name: 'Hip Hop', gradient: 'from-purple-400 via-pink-400 to-blue-400', coverArt: "/images/hiphop.jpg" },
  { id: 5, name: 'Rock', gradient: 'from-purple-700 via-purple-800 to-indigo-900', coverArt: "/images/rock.jpg" },
  { id: 6, name: 'Dancing', gradient: 'from-pink-500 via-rose-500 to-red-600', coverArt: "/images/dancing.jpg" },
  { id: 7, name: 'EDM', gradient: 'from-cyan-400 via-blue-500 to-indigo-600', coverArt: "/images/edm.jpg" },
  { id: 8, name: 'Jazz', gradient: 'from-yellow-700 via-amber-700 to-orange-800', coverArt: "/images/jazz.jpg" },
  { id: 9, name: 'Metal', gradient: 'from-slate-700 via-slate-800 to-slate-900', coverArt: "/images/metal.jpg" },
  { id: 10, name: 'Pop', gradient: 'from-pink-400 via-purple-400 to-indigo-500', coverArt: "/images/pop.jpg" },
  { id: 11, name: 'Folk', gradient: 'from-rose-500 via-pink-600 to-purple-600', coverArt: "/images/folk.jpg" },
  { id: 12, name: 'Indie', gradient: 'from-blue-400 via-indigo-500 to-purple-600', coverArt: "/images/indie.jpg" },
  { id: 13, name: 'Soul', gradient: 'from-slate-600 via-slate-700 to-gray-800', coverArt: "/images/soul.jpg" },
  { id: 14, name: 'Blues', gradient: 'from-purple-500 via-purple-600 to-indigo-700', coverArt: "/images/blues.jpg" },
];

export const MOCK_DATA = {
  hero: {
    title: "This Month's",
    subtitle: "Record Breaking Albums !",
    description: "Discover the biggest releases breaking records worldwide. From chart-topping hits to critically acclaimed masterpieces.",
  },
  
  historySongs: HISTORY_SONGS,
  allSongs: ALL_SONGS,
  allArtists: ALL_ARTISTS,
  allAlbums: ALL_ALBUMS,
  allGenres: ALL_GENRES,
  allStations: ALL_STATIONS,

  recentlyPlayed: ['song-6', 'song-1', 'song-3', 'song-5', 'song-2', 'song-4']
    .map(id => ALL_SONGS_FULL.find(song => song.id === id)),

  weeklyTop15: ['song-1', 'song-2', 'song-3', 'song-4', 'song-5', 'song-7', 'song-8', 'song-9', 'song-10', 'song-6', 'song-11', 'song-12', 'song-13', 'song-14', 'song-15']
    .map((id, index) => ({
      ...ALL_SONGS.find(song => song.id === id),
      rank: index + 1
    })),

  featuredArtists: ALL_ARTISTS.slice(0, 6),
  allArtistsPage: ALL_ARTISTS,

  featuredAlbums: ['album-1', 'album-2', 'album-3', 'album-4', 'album-5', 'album-6']
    .map(id => ALL_ALBUMS.find(album => album.id === id)),

  topStations: ['station-1', 'station-2', 'station-3', 'station-4', 'station-5']
    .map(id => ALL_STATIONS.find(station => station.id === id)),
};

export { ALL_GENRES, ALL_ARTISTS, ALL_SONGS_FULL, ALL_ALBUMS };

// Helper function to get songs by genre
export const getSongsByGenre = (genreName) => {
  return ALL_SONGS_FULL.filter(song => song.genre === genreName);
};
