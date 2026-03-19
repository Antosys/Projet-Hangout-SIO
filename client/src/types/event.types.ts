import type { Location } from './location.types';
import type { User } from './user.types';

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location_id?: number;
  max_people?: number;
  price: number;
  photos?: string[];
  localisation?: Location;
  organizer?: User;
  isOrganizer?: boolean;
  isParticipant?: boolean;
  participantsCount?: number;
  userRole?: string;
  participants?: number;
  maxParticipants?: number;
  location?: string;
}

export interface EventForm {
  title: string;
  description: string;
  location_id: string | number;
  max_people: string | number;
  date: string;
  price: string | number;
  photos: string[];
}

export interface CreateEventData {
  title: string;
  description: string;
  location_id: string;
  max_people: number;
  date: string;
  price: number;
  photos?: string[];
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  location_id?: string | number;
  max_people?: number | null;
  date?: string;
  price?: number;
  photos?: string[];
}

export interface EventsResponse {
  events: Event[];
  total: number;
}

export interface EventSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
