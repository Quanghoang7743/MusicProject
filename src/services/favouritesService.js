import api from '../config/api';
import { transformImageUrls } from '../utils/imageHelper';

const favouritesService = {
    // Get all user favorites with proper pagination
    getAll: async (params = {}) => {
        try {
            console.log('🔍 [FavouritesService] Calling API: GET /v1/favorites');

            let allFavorites = [];
            let currentPage = 1;
            let hasMore = true;
            const limit = 100;
            const maxPages = 10; // Safety limit

            while (hasMore && currentPage <= maxPages) {
                console.log(`🔄 [FavouritesService] Fetching page ${currentPage}...`);

                const url = `/v1/favorites?page=${currentPage}&limit=${limit}`;
                console.log('🔗 [FavouritesService] Request URL:', url);

                const response = await api.get(url);
                console.log('✅ [FavouritesService] Response:', response);

                // Extract favorites - handle both response structures
                const favorites = response.favorites || response.data?.favorites || [];
                const totalPages = response.totalPages || response.data?.totalPages;

                console.log(`📊 [FavouritesService] Page ${currentPage}, got ${favorites.length} items, totalPages: ${totalPages}`);

                // CRITICAL: Check if we got any results BEFORE adding to collection
                if (!Array.isArray(favorites) || favorites.length === 0) {
                    console.log('⚠️ [FavouritesService] No more favorites, stopping pagination');
                    hasMore = false;
                    break;
                }

                // Add to collection
                allFavorites = [...allFavorites, ...favorites];

                // Determine if we should continue
                // Stop if:
                // 1. We got fewer items than requested (last page)
                // 2. We have totalPages info and reached it
                if (favorites.length < limit) {
                    console.log('✅ [FavouritesService] Got fewer items than limit, last page reached');
                    hasMore = false;
                } else if (totalPages && currentPage >= totalPages) {
                    console.log('✅ [FavouritesService] Reached totalPages limit');
                    hasMore = false;
                } else {
                    currentPage++;
                }
            }

            console.log(`✅ [FavouritesService] Total favorites fetched: ${allFavorites.length}`);

            // Transform image URLs
            if (allFavorites.length > 0) {
                allFavorites = transformImageUrls(allFavorites, 'thumbnailUrl', 'song');
            }

            return { items: allFavorites };
        } catch (error) {
            console.error('❌ [FavouritesService] Error fetching favorites:', error);
            console.error('❌ [FavouritesService] Error response:', error.response?.data);
            console.error('❌ [FavouritesService] Error status:', error.response?.status);
            return { items: [] };
        }
    },

    // Add song to favorites
    add: async (songId) => {
        try {
            console.log('➕ [FavouritesService] Adding song to favorites:', songId);

            // Ensure songId is a clean string (no extra whitespace or hidden characters)
            const cleanSongId = String(songId || '').trim();

            if (!cleanSongId) {
                console.error('❌ [FavouritesService] Empty songId provided');
                throw new Error('Empty songId');
            }

            // Be tolerant about id formats. Some backends use numeric ids, others UUIDs.
            // Don't enforce a strict UUID format here; allow backend to validate.
            // But send both common key names to tolerate different API shapes.
            const requestBody = {
                songId: cleanSongId,
                song_id: cleanSongId
            };

            console.log('➕ [FavouritesService] Final request body (tolerant):', requestBody);

            const response = await api.post('/v1/favorites', requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ [FavouritesService] Add response:', response);
            return response;
        } catch (error) {
            console.error('❌ [FavouritesService] Error adding favorite:', error);
            console.error('❌ [FavouritesService] Error response:', error.response?.data);
            console.error('❌ [FavouritesService] Error status:', error.response?.status);
            console.error('❌ [FavouritesService] Error config:', error.config);
            throw error;
        }
    },

    // Remove song from favorites
    remove: async (songId) => {
        try {
            console.log('➖ [FavouritesService] Removing song from favorites:', songId);
            console.log('➖ [FavouritesService] Full URL: /v1/favorites/' + songId);
            const response = await api.delete(`/v1/favorites/${songId}`);
            console.log('✅ [FavouritesService] Remove response:', response);
            return response;
        } catch (error) {
            console.error('❌ [FavouritesService] Error removing favorite:', error);
            console.error('❌ [FavouritesService] Error response:', error.response?.data);
            console.error('❌ [FavouritesService] Error status:', error.response?.status);
            throw error;
        }
    },

    // Check if song is in favorites by fetching all and checking
    isFavorite: async (songId) => {
        try {
            console.log('🔍 [FavouritesService] Checking if song is favorite:', songId);
            const response = await favouritesService.getAll();
            const items = response.items || [];
            const isFav = items.some(item => item.id === songId);
            console.log('✅ [FavouritesService] isFavorite result:', isFav);
            return isFav;
        } catch (error) {
            console.error('❌ [FavouritesService] Error checking favorite:', error);
            return false;
        }
    },

    // Toggle favorite status
    toggle: async (songId) => {
        try {
            console.log('🔄 [FavouritesService] Toggling favorite for song:', songId);
            const isFav = await favouritesService.isFavorite(songId);

            if (isFav) {
                await favouritesService.remove(songId);
                console.log('✅ [FavouritesService] Toggled OFF');
                return { isFavorite: false };
            } else {
                await favouritesService.add(songId);
                console.log('✅ [FavouritesService] Toggled ON');
                return { isFavorite: true };
            }
        } catch (error) {
            console.error('❌ [FavouritesService] Error toggling favorite:', error);
            throw error;
        }
    }
};

export default favouritesService;