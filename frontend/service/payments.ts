import api from "./axios";

export const paymentsApi = {
  createPaymentMethod: async ({
    bookingId,
    paymentMethod,
    paidAmount,
  }: {
    bookingId: string;
    paymentMethod: string;
    paidAmount?: number;
  }) => {
    const response = await api.post("/payments", {
      bookingId,
      paymentMethod,
      paidAmount: paymentMethod === "CARD" ? Number(paidAmount ?? 0) : 0,
    });

    return response.data;
  },

  updateTransactionToSuccess: async ({
    paymentId,
    transactionId,
  }: {
    paymentId: string;
    transactionId: string;
  }) => {
    const response = await api.patch(`/payments/${paymentId}/success`, {
      transactionId,
    });
    return response.data;
  },
  getPaymentsById: async (id: string) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
  getPaymentsByOwnerId: async () => {
    const response = await api.get(`/payments/my`);
    return response.data;
  },
  getAllPayments: async () => {
    const response = await api.get(`/payments`);
    return response.data;
  },
};
