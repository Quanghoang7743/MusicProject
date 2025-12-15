// src/services/playlistService.js
import api from '../config/api';
import { getImageUrl } from '../utils/imageHelper';

const playlistService = {
  // 1. Tạo phòng Jam
  startSession: async () => {
    try {
      // POST /v1/live-playlists
      const response = await api.post('/v1/live-playlists', {});
      return response; 
    } catch (error) {
      console.error('❌ Error starting jam session:', error);
      throw error;
    }
  },
  

  // 3. [CẬP NHẬT] Lấy danh sách thành viên từ API thật
  getParticipants: async (sessionId) => {
    try {
      // Gọi vào đường dẫn /v1/live-playlists/participants
      // Lưu ý: Nếu backend yêu cầu sessionId trên URL thì sửa thành `/v1/live-playlists/${sessionId}/participants`
      const response = await api.get('/v1/live-playlists/participants', {
          params: { sessionId } // Gửi kèm sessionId nếu API cần
      });
      
      // Xử lý dữ liệu trả về (Map avatar nếu cần)
      let participants = response.data || response || [];
      
      if (Array.isArray(participants)) {
          participants = participants.map(user => ({
              ...user,
              // Xử lý ảnh avatar nếu có hàm helper, hoặc lấy trực tiếp
              avatar: user.avatarUrl ? getImageUrl(user.avatarUrl, 'user') : null
          }));
      }
      
      return participants;
    } catch (error) {
      console.error('❌ Error fetching participants:', error);
      return [];
    }
  }
};

export default playlistService;