

import { useState, useEffect } from 'react';
import { Users, Music, TrendingUp, Activity, Play, Download, Heart, Calendar, Filter } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import artistService from '../../services/artistService';
import songService from '../../services/songService';
import genreService from '../../services/genreService';

const CombinedDashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('plays');
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [genres, setGenres] = useState([]);
  const [topSongs, setTopSongs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [artistsResponse, songsResponse, genresResponse, topPlayedSongs] = await Promise.all([
          artistService.getAll(),
          songService.getAll(),
          genreService.getAll().catch(() => ({ items: [] })),
          songService.getTopByPlayCount({ limit: 10 }) // Add this line
        ]);

        // Process artists
        const artistsData = artistsResponse.items || artistsResponse || [];
        setArtists(artistsData.map(artist => ({
          id: artist.id,
          name: artist.name,
          image: artist.avatar_url ? (artist.avatar_url.startsWith('http') ? artist.avatar_url : `/images/${artist.avatar_url}`) : '/images/default-artist.jpg',
          verified: artist.verified || false,
          status: artist.status || 'active',
          followers: artist.followers || Math.floor(Math.random() * 100000) + 10000,
          totalSongs: artist.albums?.reduce((sum, album) => sum + (album.total_tracks || 0), 0) || 0,
          totalAlbums: artist.albums?.length || 0
        })));

        // Process songs
        const songsData = songsResponse.items || songsResponse || [];
        setSongs(songsData);

        const topSongsWithMetrics = (Array.isArray(topPlayedSongs) ? topPlayedSongs : []).map(song => ({
          ...song,
          id: song.id,
          title: song.title,
          // thumbnailUrl is already transformed by getTopByPlayCount
          image: song.thumbnailUrl || song.thumbnail_url || '/images/song1.jpg',
          artist: song.artists && song.artists.length > 0
            ? { name: song.artists.map(a => a.name).join(', ') }
            : { name: 'Unknown Artist' },
          plays: song.playCount || song.play_count || 0,
          trend: `+${Math.floor(Math.random() * 20 + 5)}%`,
          downloads: `${Math.floor(Math.random() * 500 + 300)}K`,
          favorites: `${(Math.random() * 1.5 + 0.5).toFixed(1)}M`
        }));
        setTopSongs(topSongsWithMetrics);

        // Process genres
        const genresData = genresResponse.items || genresResponse || [];
        setGenres(genresData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // alert('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const overallStats = [
    {
      icon: Users,
      label: "Active Users",
      value: "342K",
      change: "+12.8%",
      color: "from-blue-500 to-cyan-500",
      iconBg: "from-blue-100 to-cyan-100",
      iconColor: "text-blue-600"
    },
    {
      icon: Music,
      label: "Total Songs",
      value: songs.length.toString(),
      change: "+8.2%",
      color: "from-purple-500 to-pink-500",
      iconBg: "from-purple-100 to-pink-100",
      iconColor: "text-purple-600"
    },
    {
      icon: Play,
      label: "Total Plays",
      value: "125.4M",
      change: "+18.5%",
      color: "from-green-500 to-emerald-500",
      iconBg: "from-green-100 to-emerald-100",
      iconColor: "text-green-600"
    },
    {
      icon: Download,
      label: "Downloads",
      value: "8.5M",
      change: "+15.2%",
      color: "from-orange-500 to-red-500",
      iconBg: "from-orange-100 to-red-100",
      iconColor: "text-orange-600"
    }
  ];

  // Chart data
  const listeningTrendsData = [
    { day: 'Mon', plays: 65, downloads: 12, favorites: 28, users: 250 },
    { day: 'Tue', plays: 80, downloads: 15, favorites: 32, users: 280 },
    { day: 'Wed', plays: 70, downloads: 11, favorites: 25, users: 240 },
    { day: 'Thu', plays: 90, downloads: 18, favorites: 38, users: 320 },
    { day: 'Fri', plays: 85, downloads: 16, favorites: 35, users: 300 },
    { day: 'Sat', plays: 95, downloads: 20, favorites: 42, users: 350 },
    { day: 'Sun', plays: 75, downloads: 14, favorites: 30, users: 270 }
  ];

  const genreDistributionData = genres.slice(0, 5).map((genre, index) => ({
    name: genre.name,
    value: 30 - (index * 3.5),
    color: ['#ec4899', '#6366f1', '#f59e0b', '#a855f7', '#06b6d4'][index]
  }));

  const userActivityData = [
    { time: '00:00', users: 120 },
    { time: '04:00', users: 80 },
    { time: '08:00', users: 250 },
    { time: '12:00', users: 400 },
    { time: '16:00', users: 380 },
    { time: '20:00', users: 450 },
    { time: '23:00', users: 200 }
  ];

  const recentActivities = [
    { action: "New user registered", user: "john@example.com", time: "5 mins ago" },
    {
      action: "Song uploaded",
      user: artists.length > 0 ? artists[Math.floor(Math.random() * artists.length)].name : "Artist",
      time: "12 mins ago"
    },
    { action: "User reported content", user: "sarah@example.com", time: "1 hour ago" },
    { action: "Payment received", user: "Premium User", time: "2 hours ago" },
    {
      action: "Album published",
      user: artists.length > 0 ? artists[Math.floor(Math.random() * artists.length)].name : "Artist",
      time: "3 hours ago"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // --- HELPER FUNCTIONS (NEW) ---

  // Hàm parse giá trị (xử lý cả số và chuỗi K/M)
  const parseMetric = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;

    // Nếu là chuỗi (VD: "1.5M", "500K")
    const str = value.toString().toUpperCase();
    const num = parseFloat(str.replace(/[^0-9.-]/g, '')); // Lấy phần số

    if (str.includes('M')) return num * 1000000;
    if (str.includes('K')) return num * 1000;
    return num || 0;
  };

  // Hàm format hiển thị số đẹp
  const formatNumber = (num) => {
    const n = parseMetric(num);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  // --- SORTING LOGIC (FIXED) ---
  const getCurrentData = () => {
    const sorted = [...topSongs];
    switch (selectedCategory) {
      case 'downloads':
        return sorted.sort((a, b) => parseMetric(b.downloads) - parseMetric(a.downloads));
      case 'favorites':
        return sorted.sort((a, b) => parseMetric(b.favorites) - parseMetric(a.favorites));
      default: // Plays
        return sorted.sort((a, b) => {
          const playsA = parseMetric(a.plays || a.play_count);
          const playsB = parseMetric(b.plays || b.play_count);
          return playsB - playsA;
        });
    }
  };

  const getMetricLabel = () => {
    switch (selectedCategory) {
      case 'downloads': return 'Downloads';
      case 'favorites': return 'Favorites';
      default: return 'Plays';
    }
  };

  const getMetricValue = (song) => {
    switch (selectedCategory) {
      case 'downloads': return song.downloads;
      case 'favorites': return song.favorites;
      default: return formatNumber(song.plays || song.play_count); // Sử dụng formatNumber để hiển thị đẹp
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl">
          <p className="text-gray-900 font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name === 'Users' ? '' : 'M'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's your performance overview.</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600 text-sm font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600 text-sm font-medium">Time Range:</span>
              <div className="flex gap-2">
                {['today', 'week', 'month', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedTimeRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedTimeRange === range
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overallStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
                  <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                </div>
                <span className="text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Listening Trends - Spans 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Listening Trends (Last 7 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={listeningTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="plays"
                  stroke="#a855f7"
                  strokeWidth={3}
                  name="Plays"
                  dot={{ fill: '#a855f7', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="downloads"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  name="Downloads"
                  dot={{ fill: '#06b6d4', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="favorites"
                  stroke="#ec4899"
                  strokeWidth={3}
                  name="Favorites"
                  dot={{ fill: '#ec4899', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm font-medium">{activity.action}</p>
                    <p className="text-gray-600 text-xs truncate">{activity.user}</p>
                  </div>
                  <span className="text-gray-500 text-xs whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Genre Distribution */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-600" />
              Genre Distribution
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={genreDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genreDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* User Activity by Hour */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              User Activity by Hour
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar
                  dataKey="users"
                  fill="url(#colorGradient)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Songs Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-600" />
              Top Performing Songs
            </h2>
            <div className="flex gap-2">
              {[
                { id: 'plays', label: 'Most Played', icon: Play },
                { id: 'downloads', label: 'Most Downloaded', icon: Download },
                { id: 'favorites', label: 'Most Favorited', icon: Heart }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getCurrentData().map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 transition-all duration-300 border border-gray-200 hover:border-purple-300 hover:shadow-md group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm shadow-md">
                  {index + 1}
                </div>
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                  <img
                    src={song.image || '/images/song1.jpg'}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => { e.target.src = '/images/song1.jpg'; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-semibold truncate group-hover:text-purple-600 transition">
                    {song.title}
                  </h3>
                  <p className="text-gray-600 text-sm truncate">
                    {song.artist?.name || 'Unknown Artist'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-bold text-lg">
                    {getMetricValue(song)}
                  </p>
                  <span className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-1 rounded-full">
                    {song.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedDashboard;