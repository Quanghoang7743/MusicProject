import api from '../config/api';
import axios from 'axios';
import { getImageUrl, transformImageUrls } from '../utils/imageHelper';

const userService = {

  // --- PHẦN CỦA USER ---

  getProfile: async () => {
    try {
      return await api.get('/v1/users/me');
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      throw error;
    }
  },

  // Get user's subscription/plan
  getUserSubscription: async () => {
    try {
      const response = await api.get('/v1/users/me');
      const userData = response.data || response;

      // Extract plan information from user data
      if (userData.plan) {
        console.log('✅ User plan data:', userData.plan);

        // Return formatted subscription data
        return {
          plan: {
            id: userData.plan.id || null,
            name: userData.plan.name || 'Free',
            price: userData.plan.price || 0,
            duration: userData.plan.daysLeft || 0,
            features: userData.plan.features || []
          },
          isPremium: userData.plan.isPremium || false,
          daysLeft: userData.plan.daysLeft || 0,
          startDate: userData.plan.startDate || null,
          expiresAt: userData.plan.expiresAt || null
        };
      }

      // Return null if no plan found
      return null;
    } catch (error) {
      console.error('❌ Error fetching user subscription:', error);
      return null;
    }
  },

  updateProfile: async (userData) => {
    try {
      const updateData = {};
      if (userData.fullName) updateData.fullName = userData.fullName;
      if (userData.dob) updateData.dob = userData.dob;
      if (userData.phone) updateData.phone = userData.phone;
      if (userData.gender) updateData.gender = userData.gender;
      if (userData.address) updateData.address = userData.address;
      // Dùng PUT theo Swagger
      return await api.put('/v1/users/me', updateData);
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  },

  updatePassword: async (passwordData) => {
    try {

      const payload = {
        currentPassword: passwordData.oldPassword || passwordData.old_password || passwordData.currentPwd,

        // Map từ newPassword/new_password sang 'newPassword'
        newPassword: passwordData.newPassword || passwordData.new_password || passwordData.newPwd
      };

      console.log("📤 Sending Password Update Payload:", payload); // Log để kiểm tra

      return await api.put('/v1/users/password', payload);
    } catch (error) {
      console.error('❌ Error updating password:', error);
      throw error;
    }
  },

  getListenHistory: async (params = {}) => {
    try {
      // Use raw axios against the configured baseURL to preserve full response structure
      const base = api.defaults?.baseURL || '';
      const url = `${base}/v1/users/me/listen-history`;

      // Attach Authorization header when available so this raw axios call is authenticated
      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(url, { params, headers });

      // Expected server shape: { statusCode, timestamp, path, data: [ ... ] }
      const respData = response.data || {};
      const timestamp = respData.timestamp || null;
      let items = respData.data || respData || [];

      if (Array.isArray(items)) {
        items = transformImageUrls(items, 'thumbnailUrl', 'song');
      }

      return { items, timestamp };
    } catch (error) {
      console.error('❌ Error fetching history:', error);
      return { items: [], timestamp: null };
    }
  },

  // Hàm này không cần thiết nữa vì songService.recordPlay đã lo
  // Để trống hoặc xóa đi cũng được
  addToHistory: async () => { return; },

  // --- PHẦN CỦA ADMIN (MANAGE) ---

  getAll: async (params = {}) => {
    try {
      return await api.get('/v1/manage/users', { params });
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      return await api.get(`/v1/manage/users/${id}`);
    } catch (error) {
      console.error(`❌ Error fetching user ${id}:`, error);
      throw error;
    }
  },

  create: async (userData) => {
    try {
      const payload = {
        email: userData.email,
        fullName: userData.fullName || userData.name,
        password: userData.password || 'User@123456',
        dob: userData.dob || null,
        roleId: (userData.role || 'User').toUpperCase(),
        phone: userData.phone || null,
        gender: userData.gender || null,
        address: userData.address || null
      };
      return await api.post('/v1/manage/users', payload);
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  },

  // Delete a user (manage)
  delete: async (id) => {
    try {
      return await api.delete(`/v1/manage/users/${id}`);
    } catch (error) {
      console.error(`❌ Error deleting user ${id}:`, error);
      throw error;
    }
  },

  blockUser: async (id) => {
    try {
      return await api.patch(`/v1/manage/users/${id}/block`);
    } catch (error) {
      console.error(`❌ Error blocking user ${id}:`, error);
      throw error;
    }
  },

  activateUser: async (id) => {
    try {
      return await api.patch(`/v1/manage/users/${id}/activate`);
    } catch (error) {
      console.error(`❌ Error activating user ${id}:`, error);
      throw error;
    }
  },

  resetPassword: async (id) => {
    try {
      return await api.patch(`/v1/manage/users/${id}/reset-password`);
    } catch (error) {
      console.error(`❌ Error resetting password for user ${id}:`, error);
      throw error;
    }
  }
};

export default userService;