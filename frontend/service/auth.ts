import api from './axios';
import { AUTH_MESSAGES } from "@/app/libs/constants/auth";
import { AuthResponse } from "@/app/libs/types/auth";

export const authApi = {
    login: async (data: any) => {
        const response = await api.post('/auth/login', data);
        return response.data;
    },
    register: async (data: any) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },
    refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
        try {
            const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
            
            const responseData = response.data.data || response.data;
            
            if (!responseData.access_token) {
                console.warn(`[auth] ${AUTH_MESSAGES.INVALID_ACCESS_TOKEN}. Response:`, response.data);
                throw new Error(AUTH_MESSAGES.INVALID_ACCESS_TOKEN);
            }

            // Check if refresh token is expired
            if (responseData.refresh_token_expires_at) {
                const expiryTime = new Date(responseData.refresh_token_expires_at).getTime();
                const now = new Date().getTime();
                if (expiryTime < now) {
                    console.error(`[auth] ${AUTH_MESSAGES.REFRESH_TOKEN_EXPIRED}`);
                    throw new Error(AUTH_MESSAGES.REFRESH_TOKEN_EXPIRED);
                }
            }

            console.log("[auth] Token refreshed successfully");
            return responseData;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || "Unknown error";
            console.error(`[auth] ${AUTH_MESSAGES.TOKEN_REFRESH_FAIL}:`, errorMsg);
            throw error;
        }
    },
};