import { apiRequest } from './api';
import { SendMessageData } from '@/types';

export const chatService = {
  getGroupChats: async (): Promise<Response> => {
    return apiRequest('/groupchats', { method: 'GET' });
  },

  getMessages: async (groupchatId: number): Promise<Response> => {
    return apiRequest(`/messages/${groupchatId}`, { method: 'GET' });
  },

  sendMessage: async (messageData: SendMessageData): Promise<Response> => {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  deleteMessage: async (messageId: number): Promise<Response> => {
    return apiRequest(`/messages/${messageId}`, { method: 'DELETE' });
  },
};
