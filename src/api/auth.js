import axiosInstance from './axiosInstance';

export const authAPI = {
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await axiosInstance.get('/profile');
    return response.data;
  },
};
