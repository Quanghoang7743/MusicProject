import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, X, Music, Clock, PlayCircle, Check, Search, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import songService from "../../services/songService";
import api from "../../config/api";
import { getImageUrl as getImgUrl } from "../../utils/imageHelper";

export default function SongManagementPage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterArtist, setFilterArtist] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [artistsList, setArtistsList] = useState([]);
  const [genresList, setGenresList] = useState([]);

  // Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const SONGS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterGenre, filterArtist]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel - using getAll() instead of getAllManage()
      const [songsRes, artistsRes, genresRes] = await Promise.all([
        songService.getAll(), // ✅ Use getAll() which works properly
        api.get("/v1/artists").catch(() => ({ items: [] })),
        api.get("/v1/genres").catch(() => ({ items: [] }))
      ]);

      console.log('📦 Raw songs response:', songsRes);

      // Extract songs array from response
      let rawSongs = [];
      if (Array.isArray(songsRes)) {
        rawSongs = songsRes;
      } else if (songsRes?.items && Array.isArray(songsRes.items)) {
        rawSongs = songsRes.items;
      } else if (songsRes?.data && Array.isArray(songsRes.data)) {
        rawSongs = songsRes.data;
      }

      console.log('📋 Extracted songs:', rawSongs.length);

      // Format songs with proper thumbnail URLs
      const formattedSongs = rawSongs.map(song => {
        // Get thumbnail URL - it's already transformed by songService.getAll()
        const thumbnailUrl = song.thumbnailUrl || song.thumbnail_url || "";

        console.log(`🖼️ Song "${song.title}" thumbnail:`, thumbnailUrl);

        return {
          ...song,
          id: song.id,
          title: song.title,
          thumbnailUrl: thumbnailUrl, // Already processed by transformImageUrls
          audioUrl: song.audioUrl || song.audio_url || "",
          durationSeconds: song.durationSeconds || 0,
          playCount: song.playCount || 0,
          durationFormatted: formatDuration(song.durationSeconds || 0),
          playsFormatted: (song.playCount || 0).toLocaleString(),
          artistIds: song.artists?.map(a => a.id) || [],
          genreIds: song.genres?.map(g => g.id) || [],
          artistNames: song.artists?.map(a => a.name).join(", ") || "Unknown",
        };
      });

      console.log('✅ Formatted songs:', formattedSongs.length);

      setSongs(formattedSongs);
      setArtistsList(Array.isArray(artistsRes) ? artistsRes : (artistsRes?.items || []));
      setGenresList(Array.isArray(genresRes) ? genresRes : (genresRes?.items || []));

    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = String(seconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  const filteredSongs = songs.filter((song) => {
    const matchSearch = !search || song.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = !filterGenre || song.genreIds.includes(filterGenre);
    const matchArtist = !filterArtist || song.artistIds.includes(filterArtist);
    return matchSearch && matchGenre && matchArtist;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredSongs.length / SONGS_PER_PAGE);
  const startIndex = (currentPage - 1) * SONGS_PER_PAGE;
  const endIndex = startIndex + SONGS_PER_PAGE;
  const paginatedSongs = filteredSongs.slice(startIndex, endIndex);

  const handleEditClick = async (song) => {
    let currentArtistIds = [];
    let currentGenreIds = [];
    let fullAudioUrl = song.audioUrl || "";
    let fullThumbnailUrl = song.thumbnailUrl || "";

    try {
      const fullDetail = await songService.getById(song.id);
      const detailData = fullDetail.data || fullDetail;
      currentArtistIds = detailData.artists?.map(a => a.id) || [];
      currentGenreIds = detailData.genres?.map(g => g.id) || [];
      fullAudioUrl = detailData.audioUrl || detailData.audio_url || fullAudioUrl;
      fullThumbnailUrl = detailData.thumbnailUrl || detailData.thumbnail_url || fullThumbnailUrl;
    } catch (error) {
      console.warn("⚠️ Using list data due to backend error");
      currentArtistIds = song.artistIds || [];
      currentGenreIds = song.genreIds || [];
    }

    setEditingSong({
      id: song.id,
      title: song.title,
      durationSeconds: song.durationSeconds,
      audioUrl: fullAudioUrl,
      thumbnailUrl: fullThumbnailUrl,
      artistIds: currentArtistIds,
      genreIds: currentGenreIds,
    });

    // Set preview - thumbnail URL is already transformed
    setImagePreview(fullThumbnailUrl);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(editingSong?.thumbnailUrl || "");
  };

  const toggleEditArtist = (id) => {
    if (!editingSong) return;
    const currentIds = editingSong.artistIds || [];
    const newIds = currentIds.includes(id) ? currentIds.filter(item => item !== id) : [...currentIds, id];
    setEditingSong({ ...editingSong, artistIds: newIds });
  };

  const toggleEditGenre = (id) => {
    if (!editingSong) return;
    const currentIds = editingSong.genreIds || [];
    const newIds = currentIds.includes(id) ? [] : [id];
    setEditingSong({ ...editingSong, genreIds: newIds });
  };

  const handleUpdate = async () => {
    if (!editingSong.title?.trim()) return alert("Title required");

    try {
      let finalThumbnailUrl = editingSong.thumbnailUrl;

      // Upload new image if selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          const uploadedUrl = await songService.uploadFile(imageFile, 'image');
          finalThumbnailUrl = uploadedUrl;
          console.log("✅ Image uploaded:", finalThumbnailUrl);
        } catch (uploadError) {
          console.error("❌ Image upload failed:", uploadError);
          alert("Failed to upload image. Proceeding with existing thumbnail.");
          setUploadingImage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      const payload = {
        title: editingSong.title,
        durationSeconds: parseInt(editingSong.durationSeconds),
        artistIds: editingSong.artistIds,
        genreIds: editingSong.genreIds,
        audioUrl: editingSong.audioUrl,
        thumbnailUrl: finalThumbnailUrl,
        albumId: null
      };

      console.log("📤 Updating song:", payload);

      await songService.update(editingSong.id, payload);

      // Refresh the entire list from backend
      console.log("🔄 Refreshing song list...");
      await fetchData();

      alert("Updated successfully!");
      setIsModalOpen(false);
      setImageFile(null);
      setImagePreview("");
    } catch (error) {
      console.error("❌ Update error:", error);
      const msg = error.response?.data?.message || error.message || "Failed";
      alert(`Error: ${Array.isArray(msg) ? msg.join(", ") : msg}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await songService.delete(deleteConfirmId);
      setSongs((prev) => prev.filter((s) => s.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      alert("Song deleted successfully!");
    } catch (error) {
      alert('Failed to delete song.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading songs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Song Management</h1>
          <p className="text-gray-600 mt-1">Manage your music catalog ({songs.length} songs)</p>
        </div>
        <button
          onClick={() => navigate("/admin/songs/add")}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" /> Add Song
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
        >
          <option value="">All Genres</option>
          {genresList.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select
          value={filterArtist}
          onChange={(e) => setFilterArtist(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
        >
          <option value="">All Artists</option>
          {artistsList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 w-16">#</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 w-20">Cover</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Title</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Artist</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Plays</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Duration</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-700 w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedSongs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <Music className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium">No songs found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or add a new song</p>
                  </td>
                </tr>
              ) : (
                paginatedSongs.map((song, index) => (
                  <tr key={song.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/50 transition`}>
                    <td className="px-6 py-4 text-gray-500 font-medium">{startIndex + index + 1}</td>
                    <td className="px-6 py-4">
                      <img
                        src={song.thumbnailUrl || '/images/song1.jpg'}
                        className="w-12 h-12 rounded-lg object-cover shadow-sm"
                        alt={song.title}
                        onError={(e) => {
                          console.error('❌ Image failed to load:', song.thumbnailUrl);
                          e.target.src = '/images/song1.jpg';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{song.title}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 italic truncate max-w-[150px]">
                      {song.artistNames}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-blue-500" />
                        <span>{song.playsFormatted}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {song.durationFormatted}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(song)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Edit song"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(song.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Delete song"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* PAGINATION */}
        {filteredSongs.length > 0 && totalPages > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 mt-4 px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">{Math.min(endIndex, filteredSongs.length)}</span> of{" "}
              <span className="font-medium">{filteredSongs.length}</span> songs
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Previous page"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Show first, last, current, and adjacent pages
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition ${currentPage === page
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Next page"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && editingSong && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Edit Song</h3>
                <p className="text-sm text-gray-500 mt-0.5">Update song information and thumbnail</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Song Title & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Song Title</label>
                  <input
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                    value={editingSong.title}
                    onChange={(e) => setEditingSong({ ...editingSong, title: e.target.value })}
                    placeholder="Enter song title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                    value={editingSong.durationSeconds}
                    onChange={(e) => setEditingSong({ ...editingSong, durationSeconds: e.target.value })}
                    placeholder="180"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                  <div className="h-[42px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <span className="text-gray-500 text-sm">{formatDuration(editingSong.durationSeconds)}</span>
                  </div>
                </div>
              </div>

              {/* Thumbnail Image Upload */}
              <div className="border-t-2 border-gray-100 pt-5">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Music className="w-4 h-4 inline mr-1" />
                  Song Thumbnail
                </label>
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    {imagePreview ? (
                      <div className="relative group">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300 shadow-md"
                        />
                        {imageFile && (
                          <button
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        <Music className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="thumbnail-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer font-medium ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Upload className="w-4 h-4" />
                      {imageFile ? "Change Image" : "Upload Image"}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG up to 5MB. Recommended: 300x300px
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Uploads to Cloudinary
                    </p>
                    {imageFile && (
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Ready to upload: {imageFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Artists & Genres */}
              <div className="grid grid-cols-2 gap-4 border-t-2 border-gray-100 pt-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Artists (multiple)</label>
                  <div className="border-2 border-gray-300 rounded-lg h-52 overflow-y-auto">
                    {artistsList.map(a => (
                      <div
                        key={a.id}
                        onClick={() => toggleEditArtist(a.id)}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition ${editingSong.artistIds.includes(a.id) ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-b border-gray-100'}`}
                      >
                        <div className={`w-5 h-5 border-2 rounded flex justify-center items-center flex-shrink-0 ${editingSong.artistIds.includes(a.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                          {editingSong.artistIds.includes(a.id) && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{a.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Genre (single)</label>
                  <div className="border-2 border-gray-300 rounded-lg h-52 overflow-y-auto">
                    {genresList.map(g => (
                      <div
                        key={g.id}
                        onClick={() => toggleEditGenre(g.id)}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition ${editingSong.genreIds.includes(g.id) ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-b border-gray-100'}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex justify-center items-center flex-shrink-0 ${editingSong.genreIds.includes(g.id) ? 'border-blue-600' : 'bg-white border-gray-300'}`}>
                          {editingSong.genreIds.includes(g.id) && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{g.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                disabled={uploadingImage}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={uploadingImage}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadingImage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading to Cloudinary...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Song?</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone. The song will be permanently removed from your catalog.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-lg shadow-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}