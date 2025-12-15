import { useState, useEffect } from "react";
import { ArrowLeft, Music, Save, X, Check, Disc, Upload, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import songService from "../../services/songService";
import api from "../../config/api";
import artistService from "../../services/artistService";
import genreService from "../../services/genreService";

const API_BASE_URL = "http://localhost:3010";

export default function AddSongPage() {
    const navigate = useNavigate();

    // Data
    const [artistsList, setArtistsList] = useState([]);
    const [genresList, setGenresList] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Form
    const [selectedArtistIds, setSelectedArtistIds] = useState([]);
    const [selectedGenreId, setSelectedGenreId] = useState("");
    const [audioFile, setAudioFile] = useState(null);

    const [formData, setFormData] = useState({ title: "", durationSeconds: 0 });

    // Upload State
    const [uploadedAudioUrl, setUploadedAudioUrl] = useState("");
    const [uploadedImageUrl, setUploadedImageUrl] = useState("");
    const [audioFileName, setAudioFileName] = useState("");
    const [coverPreview, setCoverPreview] = useState("");

    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load Data
    useEffect(() => {
        const fetchResources = async () => {
            try {
                setIsLoadingData(true);
                const [artistsRes, genresRes] = await Promise.all([
                    artistService.getAll({ limit: 100 }),
                    genreService.getAll({ limit: 100 })
                ]);

                const realArtists = artistsRes?.items || artistsRes || [];
                const realGenres = genresRes?.items || genresRes || [];

                setArtistsList(realArtists);
                setGenresList(realGenres);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchResources();
    }, []);

    const toggleArtist = (id) => {
        setSelectedArtistIds(prev => {
            if (prev.includes(id)) return prev.filter(item => item !== id);
            return [...prev, id];
        });
    };

    const toggleGenre = (id) => {
        setSelectedGenreId(prev => (prev === id ? "" : id));
    };

    // ✅ FIXED: Ensure HTTPS URL is stored
    const normalizeCloudinaryUrl = (url) => {
        if (!url) return "";
        // Convert HTTP to HTTPS for Cloudinary URLs
        if (url.startsWith('http://')) {
            return url.replace('http://', 'https://');
        }
        return url;
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setCoverPreview(objectUrl);

        setIsUploadingImage(true);
        try {
            const publicUrl = await songService.uploadFile(file, 'image');
            // ✅ Normalize URL before storing
            const normalizedUrl = normalizeCloudinaryUrl(publicUrl);
            console.log('🖼️ Image uploaded:', normalizedUrl);
            setUploadedImageUrl(normalizedUrl);
        } catch (error) {
            console.error("Upload image error:", error);
            alert("Lỗi upload ảnh! Vui lòng thử lại.");
            setCoverPreview("");
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleAudioUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAudioFileName(file.name);

        // Tính duration
        const objectUrl = URL.createObjectURL(file);
        const audio = new Audio(objectUrl);
        audio.addEventListener('loadedmetadata', () => {
            const duration = Math.floor(audio.duration);
            setFormData(prev => ({ ...prev, durationSeconds: duration }));
        });

        setIsUploadingAudio(true);
        try {
            const publicUrl = await songService.uploadFile(file, 'audio');
            // ✅ Normalize URL before storing
            const normalizedUrl = normalizeCloudinaryUrl(publicUrl);
            console.log('🎵 Audio uploaded:', normalizedUrl);
            setUploadedAudioUrl(normalizedUrl);
        } catch (error) {
            console.error("Upload audio error:", error);
            alert("Upload nhạc thất bại! Vui lòng thử lại.");
            setAudioFileName("");
        } finally {
            setIsUploadingAudio(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return alert("Vui lòng nhập tên bài hát");
        if (selectedArtistIds.length === 0) return alert("Vui lòng chọn ít nhất 1 ca sĩ");
        if (!selectedGenreId) return alert("Vui lòng chọn thể loại");
        if (!uploadedAudioUrl) return alert("Vui lòng upload file nhạc");
        if (!uploadedImageUrl) return alert("Vui lòng upload ảnh bìa");

        console.log("🔍 DEBUG - uploadedImageUrl:", uploadedImageUrl);
        console.log("🔍 DEBUG - uploadedAudioUrl:", uploadedAudioUrl);

        setIsSubmitting(true);
        try {
            const payload = {
                title: formData.title,
                artistIds: selectedArtistIds,
                genreIds: [selectedGenreId],
                durationSeconds: formData.durationSeconds,
                audioUrl: uploadedAudioUrl,
                thumbnailUrl: uploadedImageUrl,
                albumId: null
            };

            console.log('📤 Creating song with payload:', payload);

            await songService.create(payload);
            alert("🎉 Thêm bài hát thành công!");
            navigate('/admin/songs');
        } catch (error) {
            console.error("Create song error:", error);
            const msg = error.response?.data?.message || "Lỗi tạo bài hát";
            alert(`Error: ${msg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getHelperUrl = (url) => {
        if (!url) return "/images/artist1.jpg"; // Default fallback
        if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/images/")) return url;
        return `${API_BASE_URL}/uploads/${url}`;
    };

    const formatDuration = (seconds) => {
        if (!seconds) return "00:00";
        const min = Math.floor(seconds / 60);
        const sec = String(seconds % 60).padStart(2, '0');
        return `${min}:${sec}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Music className="w-8 h-8 text-blue-600" />
                        Add New Song
                    </h1>
                    <p className="text-gray-600 mt-1">Fill in the details to create a new track</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to List
                </button>
            </div>

            {/* MAIN CONTAINER - Full Width Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* 1. TITLE INPUT */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Song Title</label>
                        <input
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition placeholder-gray-400"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter the name of the song..."
                            autoFocus
                        />
                    </div>

                    {/* 2. MEDIA UPLOAD SECTION (Grid 2 Cols) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Cover Image */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Cover Image
                            </h3>
                            {!coverPreview ? (
                                <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition group">
                                    {isUploadingImage ? (
                                        <span className="text-blue-600 font-medium animate-pulse">Uploading...</span>
                                    ) : (
                                        <>
                                            <div className="p-3 bg-gray-100 rounded-full mb-3 group-hover:bg-blue-100 transition">
                                                <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                                            </div>
                                            <span className="text-gray-600 font-medium">Click to upload image</span>
                                            <span className="text-xs text-gray-400 mt-1">JPG, PNG support</span>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" hidden onChange={handleImageUpload} disabled={isUploadingImage} />
                                </label>
                            ) : (
                                <div className="relative h-48 group">
                                    <img src={coverPreview} className="w-full h-full object-cover rounded-xl shadow-sm border border-gray-200" alt="Preview" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
                                        <button type="button" onClick={() => { setCoverPreview(""); setUploadedImageUrl("") }} className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-red-500 hover:text-white transition text-white">
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Audio File */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Disc className="w-4 h-4" /> Audio File
                            </h3>
                            {!audioFileName ? (
                                <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition group">
                                    {isUploadingAudio ? (
                                        <span className="text-blue-600 font-medium animate-pulse">Uploading...</span>
                                    ) : (
                                        <>
                                            <div className="p-3 bg-gray-100 rounded-full mb-3 group-hover:bg-blue-100 transition">
                                                <Music className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                                            </div>
                                            <span className="text-gray-600 font-medium">Click to upload audio</span>
                                            <span className="text-xs text-gray-400 mt-1">MP3, WAV, OGG, FLAC</span>
                                        </>
                                    )}
                                    <input type="file" accept="audio/*,.mp3,.wav,.ogg,.flac" hidden onChange={handleAudioUpload} disabled={isUploadingAudio} />
                                </label>
                            ) : (
                                <div className="h-48 border-2 border-blue-100 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center p-6 relative">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                        <Music className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <span className="font-medium text-gray-800 text-center line-clamp-1 break-all px-4">{audioFileName}</span>
                                    <span className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {formatDuration(formData.durationSeconds)}
                                    </span>
                                    <button type="button" onClick={() => { setAudioFileName(""); setUploadedAudioUrl("") }} className="absolute top-3 right-3 p-1.5 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-lg transition">
                                        <X size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. SELECTION LISTS (Grid 2 Cols) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t-2 border-gray-100 pt-8">
                        {/* Artists List */}
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <label className="block text-sm font-medium text-gray-700">Select Artists</label>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{selectedArtistIds.length} selected</span>
                            </div>
                            <div className="border-2 border-gray-300 rounded-xl h-[350px] overflow-y-auto custom-scrollbar">
                                {artistsList.length === 0 && <p className="p-6 text-center text-gray-500">Loading artists...</p>}
                                {artistsList.map(a => (
                                    <div
                                        key={a.id}
                                        onClick={() => toggleArtist(a.id)}
                                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 last:border-0 ${selectedArtistIds.includes(a.id) ? 'bg-blue-50/80' : ''}`}
                                    >
                                        <div className={`w-5 h-5 border-2 rounded flex justify-center items-center flex-shrink-0 transition-colors ${selectedArtistIds.includes(a.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                            {selectedArtistIds.includes(a.id) && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                        </div>
                                        <img src={getHelperUrl(a.avatar_url || a.image_url)} className="w-10 h-10 rounded-lg object-cover shadow-sm" alt={a.name} />
                                        <span className={`text-sm font-medium ${selectedArtistIds.includes(a.id) ? 'text-blue-700' : 'text-gray-700'}`}>{a.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Genres List */}
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <label className="block text-sm font-medium text-gray-700">Select Genre</label>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{selectedGenreId ? "1" : "0"} selected</span>
                            </div>
                            <div className="border-2 border-gray-300 rounded-xl h-[350px] overflow-y-auto custom-scrollbar">
                                {genresList.length === 0 && <p className="p-6 text-center text-gray-500">Loading genres...</p>}
                                {genresList.map(g => (
                                    <div
                                        key={g.id}
                                        onClick={() => toggleGenre(g.id)}
                                        className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 last:border-0 ${selectedGenreId === g.id ? 'bg-blue-50/80' : ''}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex justify-center items-center flex-shrink-0 transition-colors ${selectedGenreId === g.id ? 'border-blue-600' : 'bg-white border-gray-300'}`}>
                                            {selectedGenreId === g.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                        </div>
                                        <span className={`text-sm font-medium ${selectedGenreId === g.id ? 'text-blue-700' : 'text-gray-700'}`}>{g.name || g.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>Creating...</>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" /> Create Song
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}