import api from "./axios";

export const chatApi = {
  getMessages: async (receiverId: string) => {
    const response = await api.get(`/chat/messages/${receiverId}`);
    return response.data;
  },

  getConversations: async () => {
    const response = await api.get("/chat/conversations");
    return response.data;
  },
};
