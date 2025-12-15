import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Music, Upload } from "lucide-react";
import genreService from '../../services/genreService';

const GenresManagement = () => {
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  
  // State cho form
  const [newGenre, setNewGenre] = useState({ name: "", description: "", image: "" });
  const [editingGenre, setEditingGenre] = useState(null);
  
  // State quản lý ảnh
  const [imagePreview, setImagePreview] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null); // ✅ Lưu file gốc để upload

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentGenre = editingGenre || newGenre;
  const setCurrentGenre = editingGenre ? setEditingGenre : setNewGenre;

  // Load Genres
  const fetchGenres = async () => {
    try {
      setLoading(true);
      const response = await genreService.getAll({ limit: 100 });
      const genresData = response.items || response || [];

      const transformedGenres = genresData.map((genre) => ({
        id: genre.id,
        name: genre.name,
        description: genre.description || `${genre.name} music style`,
        image: genre.thumbnailUrl || genre.coverArt || "", // Đảm bảo map đúng trường
        color: "bg-purple-500",
      }));

      setGenres(transformedGenres);
    } catch (error) {
      console.error('Error fetching genres:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  // ✅ Xử lý chọn ảnh (Chỉ hiển thị preview, chưa upload)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file); // Lưu file gốc
      
      // Tạo preview base64 để hiển thị ngay
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Xử lý Thêm mới
  const handleAddGenre = async () => {
    if (!newGenre.name.trim()) return alert("Please enter a genre name!");

    try {
      let imageUrl = "";

      // 1. Upload ảnh nếu có file
      if (fileToUpload) {
        console.log("Uploading image...");
        imageUrl = await genreService.uploadFile(fileToUpload);
        console.log("Image uploaded:", imageUrl);
      }

      // 2. Tạo Genre với URL ảnh đã upload
      const genreData = {
        name: newGenre.name,
        description: newGenre.description,
        thumbnailUrl: imageUrl // Gửi URL, không gửi base64
      };

      await genreService.create(genreData);
      alert("Genre created successfully!");
      
      fetchGenres();
      closeModal();
    } catch (error) {
      console.error('Error adding genre:', error);
      alert('Failed to add genre: ' + (error.response?.data?.message || error.message));
    }
  };

  // ✅ Xử lý Cập nhật
  const handleUpdate = async () => {
    if (!editingGenre.name.trim()) return alert("Please enter a genre name!");

    try {
      let imageUrl = editingGenre.image; // Giữ nguyên URL cũ mặc định

      // 1. Nếu người dùng chọn file mới thì upload lại
      if (fileToUpload) {
        console.log("Uploading new image...");
        imageUrl = await genreService.uploadFile(fileToUpload);
      }

      // 2. Cập nhật thông tin
      const genreData = {
        name: editingGenre.name,
        description: editingGenre.description,
        thumbnailUrl: imageUrl
      };

      await genreService.update(editingGenre.id, genreData);
      alert("Genre updated successfully!");

      fetchGenres();
      closeModal();
    } catch (error) {
      console.error('Error updating genre:', error);
      alert('Failed to update genre: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this genre?")) return;

    try {
      await genreService.delete(id);
      setGenres(genres.filter((g) => g.id !== id));
    } catch (error) {
      console.error('Error deleting genre:', error);
      alert('Failed to delete genre.');
    }
  };

  const handleEdit = (genre) => {
    setEditingGenre(genre);
    setImagePreview(genre.image); // Hiển thị ảnh hiện tại
    setFileToUpload(null); // Reset file upload
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGenre(null);
    setNewGenre({ name: "", description: "", image: "" });
    setImagePreview("");
    setFileToUpload(null);
  };

  const filteredGenres = genres.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading genres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">Genres Management</h1>
          <p className="text-gray-500 mt-1">Manage and organize music genres</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium shadow-md transition"
        >
          <Plus className="w-5 h-5" /> Add Genre
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow border border-gray-100 mb-6">
        <input
          type="text"
          placeholder="Search genres..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 outline-none"
        />
      </div>

      {/* Grid view */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGenres.map((genre) => (
          <div key={genre.id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-lg transition group">
            <div className="relative h-48 bg-gray-200 overflow-hidden">
              {genre.image ? (
                <img src={genre.image} alt={genre.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
              ) : (
                <div className={`w-full h-full ${genre.color} flex items-center justify-center`}>
                  <Music className="w-16 h-16 text-white opacity-50" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(genre)} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
                  <Edit className="w-4 h-4 text-green-600" />
                </button>
                <button onClick={() => handleDelete(genre.id)} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{genre.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{genre.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingGenre ? "Edit Genre" : "Add New Genre"}
            </h2>
            <p className="text-gray-600 mb-6">
              {editingGenre ? "Update the genre information below" : "Fill in the genre details to add it to the platform"}
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Genre Name</label>
                <input
                  type="text"
                  placeholder="Enter genre name"
                  value={currentGenre.name}
                  onChange={(e) => setCurrentGenre({ ...currentGenre, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Genre Image</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition cursor-pointer"
                  onClick={() => document.getElementById('genre-image-upload').click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-2" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    </>
                  )}
                  <input id="genre-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  placeholder="Enter genre description"
                  value={currentGenre.description}
                  onChange={(e) => setCurrentGenre({ ...currentGenre, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button onClick={closeModal} className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition font-medium">Cancel</button>
              <button
                onClick={editingGenre ? handleUpdate : handleAddGenre}
                className="px-6 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition font-medium shadow-lg shadow-purple-500/30"
              >
                {editingGenre ? "Update Genre" : "Add Genre"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenresManagement;