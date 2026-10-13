export interface Message {
  id: number;
  sender: number;
  sender_email: string;
  room: number;
  content: string;
  file: string | null;
  timestamp: string;
  updated_at: string;
  is_edited: boolean;
}