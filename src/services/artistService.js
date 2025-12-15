import api from '../config/api';
import { getImageUrl, transformImageUrls } from '../utils/imageHelper';

const artistService = {
  // --- GET ALL ---
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/v1/artists', { params });

      if (response.items && Array.isArray(response.items)) {
        response.items = response.items.map(artist => ({
          ...artist,
          avatar_url: getImageUrl(artist.avatarUrl || artist.avatar_url, 'artist')
        }));
      }
      return response;
    } catch (error) {
      console.error('❌ Error fetching artists:', error);
      throw error;
    }
  },

  // --- GET BY ID ---
  getById: async (id) => {
    try {
      const artist = await api.get(`/v1/artists/${id}`);
      if (artist.avatarUrl || artist.avatar_url) {
        artist.avatar_url = getImageUrl(artist.avatarUrl || artist.avatar_url, 'artist');
      }
      return artist;
    } catch (error) {
      console.error(`❌ Error fetching artist ${id}:`, error);
      throw error;
    }
  },
  
  search: async (query, params = {}) => {
    try {
      const queryParams = { ...params, search: query };
      const response = await api.get('/v1/artists', { params: queryParams });

      let items = response.items || response || [];
      if (Array.isArray(items)) {
        items = items.map(artist => ({
          ...artist,
          avatar_url: getImageUrl(artist.avatarUrl || artist.avatar_url, 'artist')
        }));
      }

      return { items };
    } catch (error) {
      console.error('❌ Error searching artists:', error);
      return { items: [] };
    }
  },

  // --- [MỚI] UPLOAD IMAGE (Dùng chung để lấy URL trước khi tạo) ---
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Gọi vào API upload chung
      const response = await api.post('/v1/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.publicUrl || response.data?.publicUrl || response;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw error;
    }
  },

  // --- CREATE ---
  create: async (artistData) => {
    try {
      const payload = {
        name: artistData.name,
        bio: artistData.bio || '',
        // Nhận URL ảnh đã upload
        avatarUrl: artistData.avatarUrl || artistData.avatar_url || '',
        debutDate: artistData.debutDate || artistData.debut_date || null
      };

      const response = await api.post('/v1/artists', payload);
      return response;
    } catch (error) {
      console.error('❌ Error creating artist:', error);
      throw error;
    }
  },

  // --- UPDATE (Đã sửa thành PUT) ---
  update: async (id, artistData) => {
    try {
      const updateData = {};
      if (artistData.name !== undefined) updateData.name = artistData.name;
      if (artistData.bio !== undefined) updateData.bio = artistData.bio;

      // Map avatarUrl
      if (artistData.avatarUrl !== undefined) updateData.avatarUrl = artistData.avatarUrl;
      else if (artistData.avatar_url !== undefined) updateData.avatarUrl = artistData.avatar_url;

      if (artistData.debutDate !== undefined) updateData.debutDate = artistData.debutDate;

      // Các trường trạng thái
      if (artistData.verified !== undefined) updateData.isVerified = artistData.verified;
      if (artistData.status !== undefined) updateData.status = artistData.status;

      // Dùng PUT theo Swagger
      const response = await api.put(`/v1/artists/${id}`, updateData);
      return response;
    } catch (error) {
      console.error(`❌ Error updating artist ${id}:`, error);
      throw error;
    }
  },

  // --- DELETE ---
  delete: async (id) => {
    try {
      return await api.delete(`/v1/artists/${id}`);
    } catch (error) {
      console.error(`❌ Error deleting artist ${id}:`, error);
      throw error;
    }
  },

  // --- GET ALBUMS/SONGS ---
  getAlbums: async (id, params = {}) => {
    try {
      const response = await api.get(`/v1/artists/${id}/albums`, { params });
      if (response.items && Array.isArray(response.items)) {
        response.items = transformImageUrls(response.items, 'cover_url', 'album');
      }
      return response;
    } catch (error) {
      console.error(`❌ Error fetching albums for artist ${id}:`, error);
      throw error;
    }
  },

  getSongs: async (id, params = {}) => {
    try {
      const response = await api.get(`/v1/artists/${id}/songs`, { params });
      const items = Array.isArray(response) ? response : [];
      const transformedItems = transformImageUrls(items, 'thumbnailUrl', 'song');
      return { items: transformedItems };
    } catch (error) {
      console.error(`❌ Error fetching songs for artist ${id}:`, error);
      throw error;
    }
  }
};

export default artistService;