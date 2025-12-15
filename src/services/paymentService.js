// src/services/paymentService.js
import api from '../config/api';

const extractData = (raw) => {
  // raw may be: axiosResponse, axiosResponse.data, or already the payload object
  if (!raw) return null;
  if (raw.data && raw.data.data) return raw.data.data; // { statusCode, data: { qr } } pattern
  if (raw.data) return raw.data; // axios response where data is the payload
  return raw; // already normalized
};

const paymentService = {
  // normalized name createPayment kept for your usage
  createPayment: async (planId, paymentMethod = 'ZALOPAY') => {
    try {
      const payload = {
        planId,
        paymentMethod: paymentMethod.toUpperCase()
      };

      const raw = await api.post('/v1/payments', payload);

      // Debug logs
      console.log('📤 createPayment raw response:', raw);
      const data = extractData(raw);

      console.log('📥 createPayment extracted payment object:', data);

      if (!data) {
        throw new Error('Empty payment response from server');
      }

      // if backend wrapped it as { data: { qr: ... } } then data might still be { data: { qr } }
      // handle that case:
      if (data.data && (data.data.qr || data.data.orderId)) {
        return data.data;
      }

      return data;
    } catch (error) {
      // Better error logging to diagnose why response may be undefined
      console.error('❌ Error creating payment:', error);
      if (error.response) {
        console.error('❌ Server response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('❌ No response received, request:', error.request);
      } else {
        console.error('❌ Request setup error:', error.message);
      }
      throw error;
    }
  },

  checkPaymentStatus: async (orderId) => {
    try {
      const raw = await api.get(`/v1/payments/${orderId}/status`);
      console.log('🔍 checkPaymentStatus raw:', raw);
      const data = extractData(raw);
      if (data && data.data) return data.data;
      return data;
    } catch (error) {
      console.error('❌ Error checking payment status:', error);
      if (error.response) console.error('❌ Server response:', error.response.status, error.response.data);
      throw error;
    }
  }
};

export default paymentService;
