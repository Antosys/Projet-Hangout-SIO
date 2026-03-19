import { User } from './user.types';
import { Event } from './event.types';

export interface Message {
  id: number;
  content: string;
  user_id: number;
  groupchat_id: number;
  createdAt: Date | string;
  user?: User;
}

export interface GroupChat {
  id: number;
  event_id: number;
  event?: Event;
}

export interface GroupChatWithMessages extends GroupChat {
  messages?: Message[];
}

export interface SendMessageData {
  content: string;
  groupchat_id: number;
}
