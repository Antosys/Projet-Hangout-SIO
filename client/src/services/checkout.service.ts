import { apiRequest } from './api';

export const checkoutService = {
  verifySession: async (sessionId: string): Promise<Response> => {
    return apiRequest(`/checkout/verify-checkout?session_id=${sessionId}`, { method: 'GET' });
  },
};
