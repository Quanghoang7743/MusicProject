import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import artistService from "../../services/artistService";
import albumService from "../../services/albumService";
import { ArrowLeft, Upload, X, Disc, Save, Calendar, FileText } from "lucide-react";

const AddNewAlbum = () => {
  const navigate = useNavigate();

  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load danh sách Artist để chọn
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const artistsRes = await artistService.getAll({ limit: 100 });
        setArtists(artistsRes?.items || artistsRes || []);
      } catch (error) {
        console.error("Error loading artists:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    artistId: "",
    releaseDate: "",
    description: ""
  });

  // Xử lý chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form reload
    if (!formData.title.trim()) return alert("Please enter album title");
    if (!formData.artistId) return alert("Please select an artist");

    setIsSubmitting(true);
    try {
      let coverUrl = "";
      
      // 1. Upload Cover nếu có
      if (coverFile) {
        console.log("Uploading cover...");
        coverUrl = await albumService.uploadCover(coverFile);
        console.log("Cover uploaded:", coverUrl);
      }

      // 2. Tạo Album
      const payload = {
        title: formData.title,
        artist_id: formData.artistId,
        release_date: formData.releaseDate || null,
        description: formData.description,
        cover_url: coverUrl,
        total_tracks: 0 
      };

      await albumService.create(payload);
      
      alert("Album created successfully!");
      navigate("/admin/albums");
    } catch (error) {
      console.error("Error creating album:", error);
      alert("Failed to create album: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
          <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Disc className="w-8 h-8 text-blue-600" />
                  Add New Album
              </h1>
              <p className="text-gray-600 mt-1">Create a new album collection</p>
          </div>
          <button 
              onClick={() => navigate("/admin/albums")} 
              className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
              <ArrowLeft className="w-5 h-5" /> Back to List
          </button>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN: COVER IMAGE */}
              <div className="lg:col-span-1 space-y-4">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <Upload className="w-4 h-4"/> Album Cover
                  </h3>
                  {!coverPreview ? (
                      <label className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition group bg-gray-50/50">
                          <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition">
                              <Disc className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition" />
                          </div>
                          <span className="text-gray-600 font-medium">Upload Cover Image</span>
                          <span className="text-xs text-gray-400 mt-2 text-center px-4">Min 500x500px, PNG or JPG</span>
                          <input type="file" hidden accept="image/*" onChange={handleImageChange}/>
                      </label>
                  ) : (
                      <div className="relative h-80 group">
                          <img src={coverPreview} className="w-full h-full object-cover rounded-xl shadow-md border border-gray-200" alt="Preview"/>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
                              <button 
                                  type="button"
                                  onClick={() => {setCoverPreview(""); setCoverFile(null)}} 
                                  className="bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-red-500 hover:text-white transition text-white"
                              >
                                  <X size={24}/>
                              </button>
                          </div>
                      </div>
                  )}
              </div>

              {/* RIGHT COLUMN: INFO FORM */}
              <div className="lg:col-span-2 space-y-6">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                      <FileText className="w-4 h-4"/> Album Details
                  </h3>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Album Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition placeholder-gray-400"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g. The Dark Side of the Moon"
                      autoFocus
                    />
                  </div>

                  {/* Artist */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Artist <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <select 
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none appearance-none cursor-pointer"
                          value={formData.artistId}
                          onChange={(e) => setFormData({...formData, artistId: e.target.value})}
                        >
                          <option value="">-- Select Main Artist --</option>
                          {artists.map(a => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                        {/* Custom Arrow Icon for Select */}
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Release Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Release Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                                value={formData.releaseDate}
                                onChange={(e) => setFormData({...formData, releaseDate: e.target.value})}
                            />
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5"/>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <input
                          type="text"
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Short description (optional)"
                        />
                      </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-4">
                      <button 
                          type="button" 
                          onClick={() => navigate("/admin/albums")} 
                          className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium"
                      >
                          Cancel
                      </button>
                      <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/30 transition flex items-center gap-2"
                      >
                          {isSubmitting ? (
                              <span className="animate-pulse">Creating...</span>
                          ) : (
                              <>
                                <Save className="w-5 h-5"/> Create Album
                              </>
                          )}
                      </button>
                  </div>
              </div>
          </form>
      </div>
    </div>
  );
};

export default AddNewAlbum;