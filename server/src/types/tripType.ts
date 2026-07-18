export type Trip = {
  id?: number;
  title: string;
  description: string;
  city: string;
  country: string;
  start_at: string;
  end_at: string;
  user_id: number;
  place_id?: string | null;

  image_url?: string | null;

  owner_firstname?: string;
  owner_lastname?: string;
  owner_avatar_url?: string | null;

  country_code?: string | null;
  local_currency?: string | null;
  base_currency?: string | null;
};

export type Step = {
  id: number;
  city: string;
  country: string;
  trip_id: number;
  place_id?: string | null;
  user_id: number;
};

export type TripStatus = "futur" | "past" | "current";