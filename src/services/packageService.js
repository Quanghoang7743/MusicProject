// src/services/packageService.js
import api from '../config/api';

const packageService = {
  // GET /api/v1/public/plans
  getAll: async () => {
    try {
      const response = await api.get('/v1/public/plans');
      console.log('✅ Fetched plans:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching plans:', error);
      throw error;
    }
  },

  // POST /api/v1/manage/plans
  create: async (planData) => {
    try {
      // ⚠️ Đã sửa: Chuẩn hóa dữ liệu theo yêu cầu Backend. description được đặt ở JSX.
      const payload = {
        name: planData.name,
        // Backend yêu cầu description (Bắt buộc)
        description: planData.description, // ✅ Lấy giá trị đã được thiết lập từ form (featuresMarkdown)
        // Backend yêu cầu type là PRO hoặc ENTERPRISE
        type: planData.type, 
        // Backend yêu cầu resetInterval
        resetInterval: planData.resetInterval || 'MONTHLY',
        
        price: parseFloat(planData.price) || 0,
        // OriginalPrice = Price
        originalPrice: parseFloat(planData.price) || 0, 
        duration: parseInt(planData.duration),
        status: planData.status || 'active',
        features: planData.features || [], // ✅ Dữ liệu Features được thêm vào Payload
        discount: 0 // Discount luôn là 0
      };
      
      console.log('📤 Creating plan Payload:', payload);
      
      const response = await api.post('/v1/manage/plans', payload);
      console.log('✅ Plan created:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creating plan:', error);
      throw error;
    }
  },

  // PUT /api/v1/manage/plans/{id}
  update: async (id, planData) => {
    try {
      const payload = {
        name: planData.name,
        description: planData.description, // ✅ Lấy giá trị đã được thiết lập từ form (featuresMarkdown)
        type: planData.type,
        resetInterval: planData.resetInterval,
        price: parseFloat(planData.price) || 0,
        // OriginalPrice = Price
        originalPrice: parseFloat(planData.price) || 0,
        duration: parseInt(planData.duration),
        status: planData.status,
        features: planData.features || [], // ✅ Dữ liệu Features được thêm vào Payload
        discount: 0 // Discount luôn là 0
      };
      
      console.log(`📤 Updating plan ${id}:`, payload);
      const response = await api.put(`/v1/manage/plans/${id}`, payload);
      console.log('✅ Plan updated:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error updating plan ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/v1/manage/plans/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default packageService;