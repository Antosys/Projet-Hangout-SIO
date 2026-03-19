import { apiRequest } from './api';
import { CreateEventData, UpdateEventData } from '@/types';

export const eventService = {
  getEvents: async (params: URLSearchParams): Promise<Response> => {
    return apiRequest(`/events?${params.toString()}`, { method: 'GET' });
  },

  getEvent: async (id: string): Promise<Response> => {
    return apiRequest(`/events/${id}`, { method: 'GET' });
  },

  createEvent: async (eventData: CreateEventData): Promise<Response> => {
    return apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  updateEvent: async (id: string, eventData: UpdateEventData): Promise<Response> => {
    return apiRequest(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  },

  deleteEvent: async (id: string): Promise<Response> => {
    return apiRequest(`/events/${id}`, { method: 'DELETE' });
  },

  joinEvent: async (id: string): Promise<Response> => {
    return apiRequest(`/events/${id}/join`, { method: 'POST' });
  },

  getRandomEvents: async (): Promise<Response> => {
    return apiRequest('/events/random/three', { method: 'GET' });
  },
};
