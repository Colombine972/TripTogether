export interface invitationType {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;

  trip_id: number;
  user_id: number | null;

  trip_title?: string;
  trip_start: string;

  creator_firstname?: string;
  creator_lastname?: string;
  creator_avatar_url?: string | null;

  invited_firstname?: string;
  invited_lastname?: string;
  invited_avatar_url?: string | null;

  email?: string | null;
  lastReminderAt?: string | null;
  message?: string | null;
}

export type Guest = {
  id: number;
  name: string;
  avatarUrl?: string | null;
  addedAt: string | null;
  role?: "organisateur" | "membre" | "non confirmé";
  inviteState?: "refuse" | "en-attente";
  lastReminderAt?: string | null;
};