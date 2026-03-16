import api from "./axios";

export const carsApi = {
  getCars: async (page = 1, limit = 10) => {
    const response = await api.get("/cars", { params: { page, limit } });
    return response.data;
  },

  getCarsByOwnerId: async () => {
    const response = await api.get(`/cars/owner`);
    return response.data;
  },
  getCarById: async (id: string) => {
    const response = await api.get(`/cars/${id}`);
    return response.data;
  },
  createCar: async (data: any) => {
    const response = await api.post("/cars", data);
    return response.data;
  },

  updateCar: async (id: string, data: any) => {
    const response = await api.put(`/cars/${id}`, data);
    return response.data;
  },

  deleteCar: async (id: string) => {
    const response = await api.delete(`/cars/${id}`);
    return response.data;
  },
};
