import axiosInstance from './axiosInstance';

export const branchAPI = {
  getBranches: async (params = {}) => {
    const response = await axiosInstance.get('/branches', { params });
    return response.data;
  },
};
