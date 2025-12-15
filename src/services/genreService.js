import api from '../config/api';
import { getImageUrl, transformImageUrls } from '../utils/imageHelper';

const genreService = {

  // --- PUBLIC ---
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/v1/genres', { params });
      if (response.items && Array.isArray(response.items)) {
        response.items = transformImageUrls(response.items, 'thumbnailUrl', 'genre');
      } else if (Array.isArray(response)) {
        return transformImageUrls(response, 'thumbnailUrl', 'genre');
      }
      return response;
    } catch (error) {
      console.error('❌ Error fetching genres:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const genre = await api.get(`/v1/genres/${id}`);
      if (genre.thumbnailUrl) {
        genre.thumbnailUrl = getImageUrl(genre.thumbnailUrl, 'genre');
      }
      return genre;
    } catch (error) {
      console.error(`❌ Error fetching genre ${id}:`, error);
      throw error;
    }
  },

  search: async (query, params = {}) => {
    try {
      const queryParams = { ...params, search: query };
      const response = await api.get('/v1/genres', { params: queryParams });

      let items = response.items || response || [];
      if (Array.isArray(items)) {
        items = transformImageUrls(items, 'thumbnailUrl', 'genre');
      }

      return { items };
    } catch (error) {
      console.error('❌ Error searching genres:', error);
      return { items: [] };
    }
  },

  // --- ADMIN / MANAGE ---

  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/v1/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.publicUrl || response.data?.publicUrl || response;
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      throw error;
    }
  },

  create: async (genreData) => {
    try {
      const payload = {
        name: genreData.name,
        description: genreData.description || '',
        thumbnailUrl: genreData.thumbnailUrl || ''
      };

      console.log('📤 Creating genre payload:', payload);
      const response = await api.post('/v1/manage/genres', payload);

      if (response.thumbnailUrl) {
        response.thumbnailUrl = getImageUrl(response.thumbnailUrl, 'genre');
      }
      return response;
    } catch (error) {
      console.error('❌ Error creating genre:', error);
      throw error;
    }
  },

  update: async (id, genreData) => {
    try {
      const updateData = {
        name: genreData.name,
        description: genreData.description,
        thumbnailUrl: genreData.thumbnailUrl
      };

      console.log('📤 Updating genre:', id, updateData);
      const response = await api.put(`/v1/manage/genres/${id}`, updateData);

      if (response.thumbnailUrl) {
        response.thumbnailUrl = getImageUrl(response.thumbnailUrl, 'genre');
      }
      return response;
    } catch (error) {
      console.error(`❌ Error updating genre ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      return await api.delete(`/v1/manage/genres/${id}`);
    } catch (error) {
      console.error(`❌ Error deleting genre ${id}:`, error);
      throw error;
    }
  },

  // ✅ GET SONGS - Use /v1/manage/songs with genreId filter
  getSongs: async (id, params = {}) => {
    try {
      console.log('🎵 Fetching songs for genre:', id);

      // Use the manage/songs endpoint with genreId parameter
      const queryParams = {
        ...params,
        genreId: id  // Filter by genre ID
      };

      const response = await api.get('/v1/manage/songs', { params: queryParams });

      // Handle different response formats
      let items = [];
      if (response.items && Array.isArray(response.items)) {
        items = response.items;
      } else if (Array.isArray(response)) {
        items = response;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      }

      console.log(`✅ Found ${items.length} songs for genre ${id}`);

      // Transform thumbnail URLs
      const transformedItems = transformImageUrls(items, 'thumbnailUrl', 'song');

      return { items: transformedItems };
    } catch (error) {
      console.error(`❌ Error fetching songs for genre ${id}:`, error);

      // Return empty array instead of throwing to prevent crashes
      return { items: [] };
    }
  }
};

export default genreService;