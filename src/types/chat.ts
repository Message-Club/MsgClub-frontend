export interface RoomMember {
  id: number;
  email: string;
  username: string;
  role: string;
  joined_at: string;
}

export interface Room {
  id: number;
  name: string;
  is_group: boolean;
  created_at: string;
  room_members: RoomMember[];
}       