import axiosInstance from './axiosInstance';

export const leadAPI = {
  getScreeningQueue: async (params = {}) => {
    const response = await axiosInstance.get('/leads/screening-queue', { params });
    return response.data;
  },
  getAllLeads: async (params = {}) => {
    const response = await axiosInstance.get('/leads', { params });
    return response.data;
  },
  getLeadById: async (id) => {
    const response = await axiosInstance.get(`/leads/${id}`);
    return response.data;
  },
  suggestBranches: async (id, locationData) => {
    const response = await axiosInstance.post(`/leads/${id}/suggest-branch`, locationData);
    return response.data;
  },
  qualifyAndAssignBranch: async (id, handoverData) => {
    const response = await axiosInstance.post(`/leads/${id}/qualify-and-assign`, handoverData);
    return response.data;
  },
  logCall: async (id, callData) => {
    const response = await axiosInstance.post(`/leads/${id}/log-call`, callData);
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/dashboard/stats');
    return response.data;
  },
};
