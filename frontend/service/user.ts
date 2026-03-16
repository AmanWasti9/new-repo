import api from "./axios";

export const userApi = {
  getAllUsers: async (page = 1, limit = 10) => {
    const response = await api.get("/users", {
      params: { page, limit },
    });
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },
};
