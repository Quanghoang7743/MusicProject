import api from '../config/api';
import { getImageUrl, transformImageUrls } from '../utils/imageHelper';

const songService = {
  // Record play count
  recordPlay: async (id) => {
    try {
      await api.post(`/v1/songs/${id}/play`);
      console.log(`✅ Recorded play for song ${id}`);
    } catch (error) {
      console.error(`⚠️ Failed to record play for song ${id}:`, error);
    }
  },

  getTopByPlayCount: async (params = {}) => {
    try {
      // Use the public/songs endpoint with sortBy parameter
      const queryParams = {
        ...params,
        sortBy: 'playCount', // Sort by play count
        order: 'desc'        // Descending order (highest first)
      };

      const response = await api.get('/v1/public/songs', { params: queryParams });

      // Handle different response formats
      let songs = response.items || response.data || response || [];

      if (Array.isArray(songs)) {
        songs = transformImageUrls(songs, 'thumbnailUrl', 'song');
      }

      console.log('✅ Top played songs loaded:', songs.length);
      return songs;
    } catch (error) {
      console.error('❌ Error fetching top played songs:', error);
      return [];
    }
  },

  // Get all songs (with filters)
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/v1/public/songs', { params });
      if (response.items && Array.isArray(response.items)) {
        response.items = transformImageUrls(response.items, 'thumbnailUrl', 'song');
      }
      return response;
    } catch (error) {
      console.error('❌ Error fetching songs:', error);
      throw error;
    }
  },

  // Get song by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/v1/public/songs/${id}`);
      if (response.thumbnailUrl) {
        response.thumbnailUrl = getImageUrl(response.thumbnailUrl, 'song');
      }
      return response;
    } catch (error) {
      console.error(`❌ Error fetching song ${id}:`, error);
      throw error;
    }
  },

  // Get songs by genre
  getByGenre: async (genreId, params = {}) => {
    try {
      const queryParams = { ...params, genreId };
      const response = await api.get('/v1/public/songs', { params: queryParams });

      let items = response.items || response || [];
      if (Array.isArray(items)) {
        items = transformImageUrls(items, 'thumbnailUrl', 'song');
      }

      return { items };
    } catch (error) {
      console.error(`❌ Error fetching songs for genre ${genreId}:`, error);
      return { items: [] };
    }
  },

  // Get songs by artist
  getByArtist: async (artistId, params = {}) => {
    try {
      const queryParams = { ...params, artistId };
      const response = await api.get('/v1/public/songs', { params: queryParams });

      let items = response.items || response || [];
      if (Array.isArray(items)) {
        items = transformImageUrls(items, 'thumbnailUrl', 'song');
      }

      return { items };
    } catch (error) {
      console.error(`❌ Error fetching songs for artist ${artistId}:`, error);
      return { items: [] };
    }
  },

  // Get songs by album
  getByAlbum: async (albumId, params = {}) => {
    try {
      const queryParams = { ...params, albumId };
      const response = await api.get('/v1/public/songs', { params: queryParams });

      let items = response.items || response || [];
      if (Array.isArray(items)) {
        items = transformImageUrls(items, 'thumbnailUrl', 'song');
      }

      return { items };
    } catch (error) {
      console.error(`❌ Error fetching songs for album ${albumId}:`, error);
      return { items: [] };
    }
  },

  // Search songs
  search: async (query, params = {}) => {
    try {
      const queryParams = { ...params, search: query };
      const response = await api.get('/v1/public/songs', { params: queryParams });

      let items = response.items || response || [];
      if (Array.isArray(items)) {
        items = transformImageUrls(items, 'thumbnailUrl', 'song');
      }

      return { items };
    } catch (error) {
      console.error('❌ Error searching songs:', error);
      return { items: [] };
    }
  },

  // Get suggestions
  getSuggestions: async () => {
    try {
      const response = await api.get('/v1/songs/suggestions');
      let songs = response;
      if (Array.isArray(songs)) {
        songs = transformImageUrls(songs, 'thumbnailUrl', 'song');
      }
      return songs;
    } catch (error) {
      console.error('❌ Error fetching suggestions:', error);
      return [];
    }
  },

  // Upload file (audio or image)
  uploadFile: async (file, type) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const endpoint = type === 'audio' ? '/v1/upload/music' : '/v1/upload/image';
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response?.publicUrl || response?.data?.publicUrl || response;
    } catch (error) {
      console.error(`❌ Error uploading ${type}:`, error);
      throw error;
    }
  },

  getAllManage: async (params = {}) => {
    try {
      const response = await api.get('/v1/manage/songs', { params });
      if (response.items && Array.isArray(response.items)) {
        response.items = transformImageUrls(response.items, 'thumbnailUrl', 'song');
      }
      return response;
    } catch (error) {
      console.error('❌ Error fetching songs (manage):', error);
      throw error;
    }
  },

  // Get song by ID for management
  getByIdManage: async (id) => {
    try {
      const response = await api.get(`/v1/manage/songs/${id}`);
      if (response.thumbnailUrl) {
        response.thumbnailUrl = getImageUrl(response.thumbnailUrl, 'song');
      }
      return response;
    } catch (error) {
      console.error(`❌ Error fetching song ${id} (manage):`, error);
      throw error;
    }
  },

  // Create song
  create: async (songData) => {
    try {
      const payload = {
        title: songData.title,
        audioUrl: songData.audioUrl || '',
        durationSeconds: parseInt(songData.durationSeconds || 0),
        albumId: songData.albumId || null,
        thumbnailUrl: songData.thumbnailUrl || '',
        thumbnail_url: songData.thumbnailUrl || '', // ✅ ADD THIS LINE - try snake_case too
        artistIds: Array.isArray(songData.artistIds) ? songData.artistIds : [],
        genreIds: Array.isArray(songData.genreIds) ? songData.genreIds : []
      };

      console.log('🚀 Sending to backend:', payload);

      const response = await api.post('/v1/manage/songs', payload);

      console.log('✅ Backend response:', response);

      return response;
    } catch (error) {
      console.error('❌ Error creating song:', error);
      throw error;
    }
  },

  // Update song
  update: async (id, songData) => {
    try {
      const updateData = {
        title: songData.title,
        durationSeconds: parseInt(songData.durationSeconds || 0),
        albumId: songData.albumId || null,
        audioUrl: songData.audioUrl,
        thumbnailUrl: songData.thumbnailUrl,
        artistIds: songData.artistIds || [],
        genreIds: songData.genreIds || []
      };
      const response = await api.put(`/v1/manage/songs/${id}`, updateData);
      if (response.thumbnailUrl) {
        response.thumbnailUrl = getImageUrl(response.thumbnailUrl, 'song');
      }
      return response;
    } catch (error) {
      console.error(`❌ Error updating song ${id}:`, error);
      throw error;
    }
  },

  // Delete song
  delete: async (id) => {
    try {
      return await api.delete(`/v1/manage/songs/${id}`);
    } catch (error) {
      console.error(`❌ Error deleting song ${id}:`, error);
      throw error;
    }
  },
};

export default songService;