import api from "./axios";

export const bookingsApi = {
  getBookingsWithoutPagination: async () => {
    const response = await api.get("/bookings/all");
    return response.data;
  },
  getMyBookingsWithoutPagination: async () => {
    const response = await api.get("/bookings/my-bookings/all");
    return response.data;
  },
  getOwnerBookingsWithoutPagination: async () => {
    const response = await api.get("/bookings/owner/all");
    return response.data;
  },
  getbookings: async (page = 1, limit = 10) => {
    const response = await api.get("/bookings", {
      params: { page, limit },
    });
    return response.data;
  },
  getbookingsByOwnerId: async (page = 1, limit = 10) => {
    const response = await api.get(`/bookings/owner`, {
      params: { page, limit },
    });
    return response.data;
  },
  getbookingsByCustomerId: async (page = 1, limit = 10) => {
    const response = await api.get(`/bookings/my-bookings`, {
      params: { page, limit },
    });
    return response.data;
  },
  getBookingById: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  createBooking: async (data: any) => {
    const response = await api.post("/bookings", data);
    return response.data;
  },

  updateBooking: async (id: string, data: any) => {
    const response = await api.patch(`/bookings/${id}`, data);
    return response.data;
  },

  deleteBooking: async (id: string) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },
  cancelBooking: async (id: string) => {
    const response = await api.patch(`/bookings/${id}/cancel`);
    return response.data;
  },
};
