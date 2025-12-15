import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Music,
  Calendar,
  Filter,
  Eye,
  Play,
  Crown,
  Check,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import artistService from '../../services/artistService';
import albumService from '../../services/albumService';
import songService from '../../services/songService';

const AlbumManagementPage = () => {
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State cho Modal Edit
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("All");
  
  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    artists: [], 
    artistId: "", 
    releaseDate: "",
    type: "Free",
    songs: [], 
    coverArt: "",
  });

  // State upload ảnh trong Edit
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const navigate = useNavigate();

  // 1. Load dữ liệu ban đầu (Phiên bản Fix lỗi treo + Fix tên Artist)
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("🚀 Bắt đầu tải dữ liệu Album...");

      // Sử dụng Promise.all với catch lỗi riêng lẻ
      const [albumsResponse, songsResponse, artistsResponse] = await Promise.all([
        albumService.getAll({ limit: 100 }).catch(err => { console.error("Lỗi Albums:", err); return []; }),
        songService.getAll({ limit: 200 }).catch(err => { console.error("Lỗi Songs:", err); return []; }),
        artistService.getAll({ limit: 100 }).catch(err => { console.error("Lỗi Artists:", err); return []; })
      ]);

      // XỬ LÝ ARTISTS
      const artistsData = artistsResponse.items || artistsResponse || [];
      const transformedArtists = artistsData.map(artist => ({
        id: artist.id,
        name: artist.name,
        image: artist.avatar_url || artist.image_url
      }));
      setArtists(transformedArtists);

      // XỬ LÝ ALBUMS (Fix Unknown Artist)
      const albumsData = albumsResponse.items || albumsResponse || [];
      const transformedAlbums = albumsData.map(album => {
        // Tìm tên Artist từ ID
        const artistId = album.artist_id || album.artistId;
        const foundArtist = transformedArtists.find(a => a.id === artistId);
        
        return {
          id: album.id,
          title: album.title,
          artist: foundArtist ? foundArtist.name : (album.artist?.name || 'Unknown Artist'), 
          artistId: artistId, 
          artists: foundArtist ? [foundArtist.name] : [], 
          releaseDate: album.release_date ? new Date(album.release_date).toISOString().split('T')[0] : '',
          type: 'Free', 
          coverArt: album.cover_url,
          songs: [], 
          plays: album.play_count || 0,
          likes: 0,
          trackCount: album.total_tracks || 0
        };
      });
      setAlbums(transformedAlbums);

      // XỬ LÝ SONGS
      const songsData = songsResponse.items || songsResponse || [];
      const transformedSongs = songsData.map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artists?.[0]?.name || 'Unknown Artist',
        artists: song.artists || [],
        coverArt: song.thumbnailUrl,
        duration: song.durationSeconds,
        album_id: song.albumId || song.album_id
      }));
      setSongs(transformedSongs);

    } catch (error) {
      console.error('❌ Lỗi nghiêm trọng trong fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Filter hiển thị
  const filteredAlbums = albums.filter((album) => {
    const artistNames = Array.isArray(album.artists)
      ? album.artists.join(", ")
      : album.artist || "";
    const matchesSearch =
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artistNames.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || album.type === filterType;
    return matchesSearch && matchesType;
  });

  // Filter bài hát trong Modal Edit
  const filteredSongsForEdit = songs.filter((song) => {
    if (formData.artists.length === 0) return true; 
    return formData.artists.some((artistName) => {
      if (song.artist.toLowerCase().includes(artistName.toLowerCase())) return true;
      if (song.artists && Array.isArray(song.artists)) {
        return song.artists.some(a => a.name?.toLowerCase().includes(artistName.toLowerCase()));
      }
      return false;
    });
  });

  // 3. Open Edit Modal
  const handleOpenEdit = (album) => {
    setSelectedAlbum(album);
    // Tìm bài hát thuộc album này
    const currentAlbumSongs = songs.filter(s => s.album_id === album.id).map(s => s.id);

    setFormData({
      title: album.title,
      artists: album.artists,
      artistId: album.artistId,
      releaseDate: album.releaseDate || "",
      type: album.type || "Free",
      songs: currentAlbumSongs,
      coverArt: album.coverArt || "",
    });
    setCoverPreview(album.coverArt || "");
    setCoverFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAlbum(null);
    setCoverPreview("");
    setCoverFile(null);
  };

  // Xử lý chọn ảnh mới
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 4. Submit Edit
  const handleEditSubmit = async () => {
    if (!formData.title || !formData.artistId) {
      alert("Please enter title and select an artist.");
      return;
    }

    try {
      let coverUrl = formData.coverArt; 

      // Upload ảnh mới nếu có
      if (coverFile) {
        console.log("Uploading new cover...");
        coverUrl = await albumService.uploadCover(coverFile);
      }

      await albumService.update(selectedAlbum.id, {
        title: formData.title,
        description: "",
        release_date: formData.releaseDate,
        cover_url: coverUrl,
        artist_id: formData.artistId,
        total_tracks: formData.songs.length
      });

      alert('Album updated successfully!');
      handleCloseModal();
      fetchData(); 
    } catch (error) {
      console.error('Error updating album:', error);
      alert('Failed to update album: ' + (error.response?.data?.message || error.message));
    }
  };

  // 5. Delete Album
  const handleDelete = async (albumId) => {
    if (window.confirm("Are you sure you want to delete this album?")) {
      try {
        await albumService.delete(albumId);
        setAlbums((prev) => prev.filter((a) => a.id !== albumId));
      } catch (error) {
        console.error('Error deleting album:', error);
        alert('Failed to delete album.');
      }
    }
  };

  const toggleSong = (songId) => {
    setFormData((prev) => ({
      ...prev,
      songs: prev.songs.includes(songId)
        ? prev.songs.filter((id) => id !== songId)
        : [...prev.songs, songId],
    }));
  };

  const getTypeColor = (type) =>
    type === "Premium"
      ? "bg-amber-50 text-amber-600 border-amber-200"
      : "bg-blue-50 text-blue-600 border-blue-200";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Album Management</h1>
              <p className="text-gray-600">Manage music albums and collections</p>
            </div>
            <button
              onClick={() => navigate("/admin/albums/add")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 justify-center shadow-lg shadow-purple-500/30"
            >
              <Plus className="w-5 h-5" />
              Add New Album
            </button>
          </div>

          {/* Search + Filter */}
          <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 text-gray-900 pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              >
                <option>All</option>
                <option>Free</option>
                <option>Premium</option>
              </select>
            </div>
          </div>

          {/* Albums Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlbums.map((album) => (
              <div
                key={album.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition group"
              >
                <div className="relative h-48">
                  {album.coverArt ? (
                     <img src={album.coverArt} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">🎵</div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition">
                      <Eye className="w-5 h-5 text-gray-900" />
                    </button>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getTypeColor(album.type)}`}>
                      {album.type === "Premium" && <Crown className="w-3 h-3" />}
                      {album.type || "Free"}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-1 truncate">{album.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{album.artist}</p>

                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {album.releaseDate || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Music className="w-4 h-4" />
                      <span>{album.trackCount} songs</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(album)}
                      className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(album.id)}
                      className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* EDIT MODAL */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Edit Album</h2>
                    <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Album Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                      />
                    </div>

                    {/* Artist */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Artist</label>
                      <select 
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                        value={formData.artistId}
                        onChange={(e) => {
                            const selected = artists.find(a => a.id === e.target.value);
                            setFormData({
                                ...formData, 
                                artistId: e.target.value,
                                artists: selected ? [selected.name] : []
                            })
                        }}
                      >
                        <option value="">Select Artist</option>
                        {artists.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Release Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Release Date</label>
                      <input
                        type="date"
                        value={formData.releaseDate}
                        onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                      />
                    </div>

                    {/* Songs Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Songs ({formData.songs.length} selected)
                      </label>
                      <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                        {filteredSongsForEdit.length === 0 ? (
                          <div className="p-4 text-sm text-gray-500">No songs found for selected artist.</div>
                        ) : (
                          filteredSongsForEdit.map((song) => (
                            <div
                              key={song.id}
                              onClick={() => toggleSong(song.id)}
                              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition ${formData.songs.includes(song.id) ? "bg-purple-50" : ""}`}
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${formData.songs.includes(song.id) ? "bg-purple-600 border-purple-600" : "border-gray-300"}`}>
                                {formData.songs.includes(song.id) && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <img src={song.coverArt} alt={song.title} className="w-10 h-10 rounded object-cover" />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{song.title}</p>
                                <p className="text-xs text-gray-500">{song.artist}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Cover Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Album Cover</label>
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition cursor-pointer"
                        onClick={() => document.getElementById('edit-cover-upload').click()}
                      >
                        {coverPreview ? (
                            <img src={coverPreview} className="h-32 w-auto mx-auto rounded-lg object-cover mb-2"/>
                        ) : (
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        )}
                        <p className="text-sm text-gray-600">{coverPreview ? "Click to change image" : "Click to upload new cover"}</p>
                        <input id="edit-cover-upload" type="file" hidden accept="image/*" onChange={handleImageChange}/>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button onClick={handleCloseModal} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">
                        Cancel
                      </button>
                      <button onClick={handleEditSubmit} className="flex-1 px-4 py-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-medium shadow-lg">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlbumManagementPage;