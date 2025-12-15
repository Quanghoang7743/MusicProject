import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Music, Upload, ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react';
import artistService from '../../services/artistService';
import { getImageUrl } from '../../utils/imageHelper';

const AdminArtistEdit = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    bio: '',
    image: '', // URL ảnh hiện tại từ server
    status: 'active',
    verified: false,
    followers: 0,
    totalSongs: 0,
    totalAlbums: 0,
    joinDate: new Date().toISOString().split('T')[0],
    albums: []
  });

  // [MỚI] State quản lý file ảnh mới
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newAlbum, setNewAlbum] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArtist = async () => {
      try {
        setLoading(true);
        const artist = await artistService.getById(artistId);

        setFormData({
          id: artist.id,
          name: artist.name,
          bio: artist.bio || '',
          image: getImageUrl(artist.avatarUrl || artist.avatar_url, 'artist'),
          status: artist.status || 'active',
          verified: artist.is_verified || artist.verified || false,
          followers: artist.followers || 0,
          totalSongs: artist.totalSongs || 0,
          totalAlbums: artist.albums?.length || 0,
          joinDate: artist.debut_date ? new Date(artist.debut_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          albums: artist.albums || []
        });
      } catch (error) {
        console.error("Error loading artist:", error);
        alert("Failed to load artist data");
        navigate('/admin/artists');
      } finally {
        setLoading(false);
      }
    };
    loadArtist();
  }, [artistId, navigate]);

  // [MỚI] Hàm xử lý chọn ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const addAlbum = () => {
    if (newAlbum.trim()) {
      setFormData({
        ...formData,
        albums: [...formData.albums, newAlbum.trim()],
        totalAlbums: formData.albums.length + 1
      });
      setNewAlbum('');
    }
  };

  const removeAlbum = (index) => {
    const newAlbums = formData.albums.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      albums: newAlbums,
      totalAlbums: newAlbums.length
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Artist name is required';
    if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // [CẬP NHẬT] Handle Save: Upload ảnh -> Update Info
  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      let finalAvatarUrl = formData.image;

      // 1. Nếu có chọn ảnh mới -> Upload lên server lấy link
      if (selectedFile) {
        console.log("📤 Uploading new image...");
        finalAvatarUrl = await artistService.uploadImage(selectedFile);
      }

      // 2. Gọi API Update
      const updateData = {
        name: formData.name,
        bio: formData.bio,
        debutDate: formData.joinDate,
        avatarUrl: finalAvatarUrl, // Gửi link ảnh (mới hoặc cũ)
        status: formData.status,
        verified: formData.verified
      };

      await artistService.update(artistId, updateData);
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        navigate('/admin/artists');
      }, 2000);

    } catch (error) {
      console.error("Error saving artist:", error);
      alert("Failed to save changes: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => window.history.back();

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Header Section */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">Edit Artist</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Update details for {formData.name}</p>
            </div>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 bg-white px-3 py-2 rounded-lg hover:bg-gray-100 transition border border-gray-200 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <span className="font-medium">Artist updated successfully! Redirecting...</span>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* [CẬP NHẬT] Giao diện Profile Image To Đẹp */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
              <div className="flex justify-center">
                {(previewUrl || formData.image) ? (
                  <div className="relative group w-full max-w-md">
                    <img 
                      src={previewUrl || formData.image} 
                      alt="Preview" 
                      className="w-full h-64 rounded-xl object-cover border-2 border-gray-200 shadow-sm" 
                    />
                    {/* Overlay: Hover vào để đổi ảnh */}
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-xl cursor-pointer transition duration-200">
                       <Upload className="w-8 h-8 text-white mb-2" />
                       <span className="text-white font-medium">Change Image</span>
                       <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                    {/* Nút reset ảnh mới chọn (nếu có) */}
                    {selectedFile && (
                      <button 
                        onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                        className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full shadow-md hover:bg-red-50 transition"
                        title="Revert to original"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <label className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center hover:border-purple-500 hover:bg-purple-50/50 transition cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Upload Image</span>
                  </label>
                )}
              </div>
            </div>

            {/* Artist Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Artist Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-200`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Biography <span className="text-red-500">*</span></label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className={`w-full px-4 py-2.5 border ${errors.bio ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-200`}
              />
              {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
            </div>

            {/* Join Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
              <input
                type="date"
                value={formData.joinDate}
                onChange={(e) => handleInputChange('joinDate', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Verified */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.verified}
                  onChange={(e) => handleInputChange('verified', e.target.checked)}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-200"
                />
                <span className="text-sm font-medium text-gray-700">Verified Artist</span>
              </label>
            </div>
          </div>
        </div>

        {/* Statistics (Read Only) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Followers</label>
              <input type="number" value={formData.followers} readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Songs</label>
              <input type="number" value={formData.totalSongs} readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Albums</label>
              <input type="number" value={formData.totalAlbums} readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Albums Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Albums</h2>
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={newAlbum}
              onChange={(e) => setNewAlbum(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAlbum()}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200"
              placeholder="Enter album name"
            />
            <button onClick={addAlbum} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add Album
            </button>
          </div>
          <div className="space-y-2">
            {formData.albums.length === 0 ? (
              <div className="text-center py-8 text-gray-500"><p>No albums added yet</p></div>
            ) : (
              formData.albums.map((album, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <Music className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-medium">{typeof album === 'string' ? album : album.title}</span>
                  </div>
                  <button onClick={() => removeAlbum(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={handleCancel} className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSubmitting}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition shadow-lg flex items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
               <>Saving...</>
            ) : (
               <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminArtistEdit;