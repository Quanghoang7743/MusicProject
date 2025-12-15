import { useState, useEffect } from 'react';
import { 
  Music, Search, Plus, Edit, Trash2, Eye, Upload, Filter, 
  Users, Star, TrendingUp, ChevronUp, ChevronDown, Power, PowerOff, X 
} from 'lucide-react';
import artistService from '../../services/artistService';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageHelper';

const AdminArtistManagement = () => {
  const navigate = useNavigate();
  
  // --- STATE CŨ ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, artistId: null, artistName: '' });
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all', verified: 'all', followersMin: '', followersMax: '', songsMin: '', songsMax: '', albumsMin: '', albumsMax: ''
  });
  const [verifyConfirmModal, setVerifyConfirmModal] = useState({ isOpen: false, artistId: null, artistName: '', isVerifying: true });
  const [statusConfirmModal, setStatusConfirmModal] = useState({ isOpen: false, artistId: null, artistName: '', currentStatus: 'active' });
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE MỚI CHO FORM THÊM NGHỆ SĨ ---
  const [newArtist, setNewArtist] = useState({
    name: '',
    bio: '',
    file: null,
    previewUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FETCH DATA ---
  const fetchArtists = async () => {
    try {
      setLoading(true);
      const response = await artistService.getAll();
      const artistsData = response.items || [];

      const enrichedArtists = artistsData.map((artist) => ({
        ...artist,
        image: getImageUrl(artist.avatar_url, 'artist'),
        status: artist.status || 'active',
        followers: artist.followers || 0,
        totalSongs: artist.totalSongs || 0,
        totalAlbums: artist.albums?.length || 0,
        verified: artist.is_verified || false,
        joinDate: artist.debut_date ? new Date(artist.debut_date).toISOString().split("T")[0] : null
      }));

      setArtists(enrichedArtists);
    } catch (error) {
      console.error('Error fetching artists:', error);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  // --- XỬ LÝ FORM THÊM MỚI ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewArtist({
        ...newArtist,
        file: file,
        previewUrl: URL.createObjectURL(file)
      });
    }
  };

  const handleAddArtist = async () => {
    if (!newArtist.name) return alert("Please enter artist name");

    setIsSubmitting(true);
    try {
      let avatarUrl = "";

      // 1. Upload ảnh trước (nếu có)
      if (newArtist.file) {
        avatarUrl = await artistService.uploadImage(newArtist.file);
      }

      // 2. Tạo nghệ sĩ với URL ảnh
      await artistService.create({
        name: newArtist.name,
        bio: newArtist.bio,
        avatarUrl: avatarUrl,
        debutDate: new Date().toISOString()
      });

      // 3. Reset & Reload
      alert("Artist created successfully!");
      setIsAddModalOpen(false);
      setNewArtist({ name: '', bio: '', file: null, previewUrl: '' });
      fetchArtists();

    } catch (error) {
      console.error("Failed to create artist", error);
      alert("Failed to create artist. Please check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- CÁC HÀM XỬ LÝ KHÁC (DELETE, FILTER...) ---
  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || artist.status === filters.status;
    // Thêm các logic filter khác ở đây nếu cần (giữ nguyên logic cũ của bạn)
    return matchesSearch && matchesStatus;
  });

  const deleteArtist = async (id) => {
    try {
      await artistService.delete(id);
      setArtists(artists.filter(artist => artist.id !== id));
      setDeleteConfirmModal({ isOpen: false, artistId: null, artistName: '' });
    } catch (error) { console.error(error); alert('Failed to delete'); }
  };

  const openDeleteModal = (id, name) => setDeleteConfirmModal({ isOpen: true, artistId: id, artistName: name });
  
  // Logic Toggle Status
  const openStatusModal = (id, name, status) => setStatusConfirmModal({ isOpen: true, artistId: id, artistName: name, currentStatus: status });
  const confirmToggleStatus = async () => {
    try {
        const newStatus = statusConfirmModal.currentStatus === 'active' ? 'inactive' : 'active';
        await artistService.update(statusConfirmModal.artistId, { status: newStatus });
        fetchArtists(); // Reload list
        setStatusConfirmModal({ isOpen: false, artistId: null, artistName: '', currentStatus: 'active' });
    } catch (error) { alert('Failed to update status'); }
  };

  // Logic Verify
  const openVerifyModal = (id, name, isVerifying) => setVerifyConfirmModal({ isOpen: true, artistId: id, artistName: name, isVerifying });
  const confirmToggleVerification = async () => {
    try {
        await artistService.update(verifyConfirmModal.artistId, { verified: verifyConfirmModal.isVerifying });
        fetchArtists(); // Reload list
        setVerifyConfirmModal({ isOpen: false, artistId: null, artistName: '', isVerifying: true });
    } catch (error) { alert('Failed to verify artist'); }
  };

  const handleEditClick = (artistId) => {
    navigate(`/admin/artists/edit/${artistId}`);
  };

  const resetFilters = () => {
    setFilters({ status: 'all', verified: 'all', followersMin: '', followersMax: '', songsMin: '', songsMax: '', albumsMin: '', albumsMax: '' });
  };

  const hasActiveFilters = () => filters.status !== 'all' || filters.verified !== 'all';

  // Stats Data
  const stats = [
    { label: 'Total Artists', value: artists.length, icon: Users, color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Verified Artists', value: artists.filter(a => a.verified).length, icon: Star, color: 'bg-purple-500', lightColor: 'bg-purple-50', textColor: 'text-purple-600' },
    { label: 'Active Artists', value: artists.filter(a => a.status === 'active').length, icon: TrendingUp, color: 'bg-orange-500', lightColor: 'bg-orange-50', textColor: 'text-orange-600' },
    { label: 'Total Followers', value: `${(artists.reduce((sum, a) => sum + a.followers, 0) / 1000).toFixed(0)}K`, icon: Music, color: 'bg-green-500', lightColor: 'bg-green-50', textColor: 'text-green-600' }
  ];

  if (loading && artists.length === 0) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="w-full">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Artist Management</h1>
              <p className="text-gray-600">Manage and verify artists on your platform</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 justify-center shadow-lg shadow-purple-500/30"
            >
              <Plus className="w-5 h-5" />
              Add New Artist
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.lightColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{stat.label}</h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search artists by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 text-gray-900 pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className={`px-4 py-2.5 rounded-lg border transition relative flex items-center gap-2 ${hasActiveFilters()
                    ? 'bg-purple-50 border-purple-500 text-purple-600'
                    : 'bg-gray-50 border-gray-300 hover:border-purple-500 text-gray-600'
                    }`}
                >
                  <Filter className="w-5 h-5" />
                  {isFilterDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {hasActiveFilters() && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-600 rounded-full"></span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Filter Dropdown */}
          {isFilterDropdownOpen && (
            <div className="mt-6 p-6 bg-gray-100 rounded-lg border border-gray-300 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-gray-900">Advanced Filters</h3>
                {hasActiveFilters() && (
                  <button onClick={resetFilters} className="text-sm text-purple-600 hover:text-purple-700 font-medium">Clear All</button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900">
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                {/* Verification */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Verification</label>
                  <select value={filters.verified} onChange={(e) => setFilters({ ...filters, verified: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900">
                    <option value="all">All Artists</option>
                    <option value="verified">Verified Only</option>
                    <option value="unverified">Unverified Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Artists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtists.map((artist) => (
              <div key={artist.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition group">
                <div className="relative h-48 bg-gray-100">
                  <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                  {artist.verified && (
                    <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Verified
                    </div>
                  )}
                  <div className={`absolute top-3 left-3 ${artist.status === 'active' ? 'bg-green-500' : 'bg-red-500'} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                    {artist.status}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{artist.name}</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{artist.totalSongs}</p>
                      <p className="text-xs text-gray-600">Songs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{artist.totalAlbums}</p>
                      <p className="text-xs text-gray-600">Albums</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{(artist.followers / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-gray-600">Followers</p>
                    </div>
                  </div>

                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600">Joined: <span className="font-medium text-gray-900">{artist.joinDate}</span></p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedArtist(artist)} disabled={artist.status === 'inactive'} className={`flex-1 ${artist.status === 'inactive' ? 'bg-gray-100 text-gray-400' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'} px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 text-sm`}>
                        <Eye className="w-4 h-4" /> View
                      </button>
                      <button onClick={() => openVerifyModal(artist.id, artist.name, !artist.verified)} disabled={artist.status === 'inactive'} className={`flex-1 ${artist.status === 'inactive' ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'} px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 text-sm`}>
                        <Star className={`w-4 h-4 ${artist.verified ? 'fill-current' : ''}`} /> {artist.verified ? 'Unverify' : 'Verify'}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openStatusModal(artist.id, artist.name, artist.status)} className={`flex-1 ${artist.status === 'active' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'} px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 text-sm`}>
                        {artist.status === 'active' ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />} {artist.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                      <button onClick={() => handleEditClick(artist.id)} disabled={artist.status === 'inactive'} className={`${artist.status === 'inactive' ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'} px-3 py-2 rounded-lg transition`}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDeleteModal(artist.id, artist.name)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredArtists.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
              <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No artists found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}

          {/* [MODAL] ADD NEW ARTIST (Giao diện mới + Logic) */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsAddModalOpen(false)}>
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Artist</h2>
                  <button onClick={() => setIsAddModalOpen(false)}><X className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Artist Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={newArtist.name}
                      onChange={(e) => setNewArtist({ ...newArtist, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                      placeholder="Enter artist name"
                    />
                  </div>

                  {/* Image Input (Giao diện ảnh to) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                    <div className="flex justify-center">
                        {newArtist.previewUrl ? (
                            <div className="relative group w-full">
                                <img src={newArtist.previewUrl} alt="Preview" className="w-full h-64 rounded-xl object-cover border-2 border-gray-200 shadow-sm" />
                                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-xl cursor-pointer transition duration-200">
                                   <Upload className="w-8 h-8 text-white mb-2" />
                                   <span className="text-white font-medium">Change Image</span>
                                   <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                                <button onClick={() => setNewArtist({...newArtist, file: null, previewUrl: ''})} className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full shadow-md hover:bg-red-50 transition">
                                  <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center hover:border-purple-500 hover:bg-purple-50/50 transition cursor-pointer">
                              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                                  <Upload className="w-6 h-6" />
                              </div>
                              <span className="text-sm font-semibold text-gray-700">Click to upload image</span>
                              <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (Max. 800x400px)</p>
                            </label>
                        )}
                    </div>
                  </div>

                  {/* Bio Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      rows={4}
                      value={newArtist.bio}
                      onChange={(e) => setNewArtist({ ...newArtist, bio: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                      placeholder="Enter artist biography"
                    />
                  </div>
                </div>

                <div className="flex gap-4 justify-end">
                  <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition font-medium">Cancel</button>
                  <button onClick={handleAddArtist} disabled={isSubmitting} className="px-6 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition font-medium shadow-lg flex items-center gap-2 disabled:opacity-50">
                    {isSubmitting ? 'Creating...' : 'Add Artist'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ... (Các modal Detail, Status, Verify, Delete giữ nguyên như cũ) ... */}
          {statusConfirmModal.isOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setStatusConfirmModal({ isOpen: false, artistId: null, artistName: '', currentStatus: 'active' })}>
              <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 text-center mb-2">{statusConfirmModal.currentStatus === 'active' ? 'Deactivate Artist' : 'Activate Artist'}</h2>
                  <p className="text-gray-600 text-center">Are you sure you want to {statusConfirmModal.currentStatus === 'active' ? 'deactivate' : 'activate'} <span className="font-semibold text-gray-900">{statusConfirmModal.artistName}</span>?</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStatusConfirmModal({ isOpen: false, artistId: null, artistName: '', currentStatus: 'active' })} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition font-medium">Cancel</button>
                  <button onClick={confirmToggleStatus} className={`flex-1 px-4 py-2.5 ${statusConfirmModal.currentStatus === 'active' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition font-medium shadow-lg`}>{statusConfirmModal.currentStatus === 'active' ? 'Deactivate' : 'Activate'}</button>
                </div>
              </div>
            </div>
          )}

          {verifyConfirmModal.isOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setVerifyConfirmModal({ isOpen: false, artistId: null, artistName: '', isVerifying: true })}>
              <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 text-center mb-2">{verifyConfirmModal.isVerifying ? 'Verify Artist' : 'Unverify Artist'}</h2>
                  <p className="text-gray-600 text-center">Are you sure you want to {verifyConfirmModal.isVerifying ? 'verify' : 'unverify'} <span className="font-semibold text-gray-900">{verifyConfirmModal.artistName}</span>?</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setVerifyConfirmModal({ isOpen: false, artistId: null, artistName: '', isVerifying: true })} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition font-medium">Cancel</button>
                  <button onClick={confirmToggleVerification} className={`flex-1 px-4 py-2.5 ${verifyConfirmModal.isVerifying ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded-lg transition font-medium shadow-lg`}>{verifyConfirmModal.isVerifying ? 'Verify' : 'Unverify'}</button>
                </div>
              </div>
            </div>
          )}

          {selectedArtist && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedArtist(null)}>
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start gap-6 mb-6">
                  <img src={selectedArtist.image} alt={selectedArtist.name} className="w-32 h-32 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedArtist.name}</h2>
                    <div className="flex gap-4 text-sm text-gray-600 mb-4">
                      <span>{selectedArtist.totalSongs} Songs</span>
                      <span>•</span>
                      <span>{selectedArtist.totalAlbums} Albums</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                  <button onClick={() => setSelectedArtist(null)} className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition font-medium">Close</button>
                </div>
              </div>
            </div>
          )}

          {deleteConfirmModal.isOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirmModal({ isOpen: false, artistId: null, artistName: '' })}>
              <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Artist</h2>
                  <p className="text-gray-600 text-center">Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteConfirmModal.artistName}</span>?</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirmModal({ isOpen: false, artistId: null, artistName: '' })} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition font-medium">Cancel</button>
                  <button onClick={() => deleteArtist(deleteConfirmModal.artistId)} className="flex-1 px-4 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg transition font-medium shadow-lg">Delete</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminArtistManagement;