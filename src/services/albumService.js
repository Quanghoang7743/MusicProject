import api from '../config/api';
import { getImageUrl } from '../utils/imageHelper';

const albumService = {
  // Get all albums
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/v1/albums', { params });

      let albums = response.items || response || [];

      if (!Array.isArray(albums)) {
        albums = [];
      }

      // Fetch artist info if missing
      if (albums.length > 0 && !albums[0].artist) {
        const artistIds = [...new Set(albums.map(album =>
          album.artist_id || album.artistId
        ).filter(Boolean))];

        if (artistIds.length > 0) {
          try {
            const artistsResponse = await api.get('/v1/artists', {
              params: { limit: 100 }
            });
            const artists = artistsResponse.items || artistsResponse || [];

            const artistMap = {};
            artists.forEach(artist => {
              artistMap[artist.id] = artist;
            });

            albums = albums.map(album => {
              const artistId = album.artist_id || album.artistId;
              return {
                ...album,
                artist: artistId ? artistMap[artistId] : null
              };
            });
          } catch (err) {
            console.warn('Failed to fetch artists for albums:', err);
          }
        }
      }

      // Transform image URLs
      albums = albums.map(album => ({
        ...album,
        cover_url: getImageUrl(album.coverUrl || album.cover_url, 'album'),
        artist: album.artist ? {
          ...album.artist,
          name: album.artist.name || 'Unknown Artist'
        } : { name: 'Unknown Artist' }
      }));

      return { items: albums };
    } catch (error) {
      console.error('❌ Error fetching albums:', error);
      return { items: [] };
    }
  },

  // Get album by ID
  getById: async (id) => {
    try {
      const album = await api.get(`/v1/albums/${id}`);

      // Fetch artist if missing
      if (!album.artist && (album.artist_id || album.artistId)) {
        const artistId = album.artist_id || album.artistId;
        try {
          const artist = await api.get(`/v1/artists/${artistId}`);
          album.artist = artist;
        } catch (err) {
          console.warn(`Failed to fetch artist ${artistId}:`, err);
          album.artist = { name: 'Unknown Artist' };
        }
      }

      // Transform cover URL
      if (album.coverUrl || album.cover_url) {
        album.cover_url = getImageUrl(album.coverUrl || album.cover_url, 'album');
      }

      return album;
    } catch (error) {
      console.error(`❌ Error fetching album ${id}:`, error);
      throw error;
    }
  },

search: async (query, params = {}) => {
  try {
    const queryParams = { ...params, search: query };
    const response = await api.get('/v1/albums', { params: queryParams });
    
    let items = response.items || response || [];
    if (Array.isArray(items)) {
      items = items.map(album => ({
        ...album,
        cover_url: getImageUrl(album.coverUrl || album.cover_url, 'album'),
        artist: album.artist || { name: 'Unknown Artist' }
      }));
    }
    
    return { items };
  } catch (error) {
    console.error('❌ Error searching albums:', error);
    return { items: [] };
  }
},

  // Upload cover
  uploadCover: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/v1/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.publicUrl || response.data?.publicUrl || response;
    } catch (error) {
      console.error('❌ Error uploading cover:', error);
      throw error;
    }
  },

  // Create album
  create: async (albumData) => {
    try {
      const payload = {
        title: albumData.title,
        description: albumData.description || '',
        artistId: albumData.artist_id || albumData.artistId,
        releaseDate: albumData.release_date || albumData.releaseDate || null,
        coverUrl: albumData.cover_url || albumData.coverUrl || '',
        totalTracks: parseInt(albumData.total_tracks || albumData.totalTracks || 0)
      };

      const response = await api.post('/v1/albums', payload);

      if (response.cover_url || response.coverUrl) {
        response.cover_url = getImageUrl(response.cover_url || response.coverUrl, 'album');
      }
      return response;
    } catch (error) {
      console.error('❌ Error creating album:', error);
      throw error;
    }
  },

  // Update album
  update: async (id, albumData) => {
    try {
      const updateData = {
        title: albumData.title,
        description: albumData.description,
        artistId: albumData.artist_id || albumData.artistId,
        releaseDate: albumData.releaseDate || albumData.release_date,
        coverUrl: albumData.cover_url || albumData.coverUrl || albumData.coverArt,
        totalTracks: parseInt(albumData.total_tracks || 0)
      };

      const response = await api.put(`/v1/albums/${id}`, updateData);

      if (response.cover_url || response.coverUrl) {
        response.cover_url = getImageUrl(response.cover_url || response.coverUrl, 'album');
      }
      return response;
    } catch (error) {
      console.error(`❌ Error updating album ${id}:`, error);
      throw error;
    }
  },

  // Delete album
  delete: async (id) => {
    try {
      return await api.delete(`/v1/albums/${id}`);
    } catch (error) {
      console.error(`❌ Error deleting album ${id}:`, error);
      throw error;
    }
  }
};

export default albumService;