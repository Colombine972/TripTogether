export type Trip = {
  id?: number;
  title: string;
  description: string;
  city: string;
  country: string;
  start_at: string;
  end_at: string;
  user_id: number;
  photo_reference?: string | null;
  owner_firstname?: string;
  owner_lastname?: string;
};
export type Step = {
  id: number;
  city: string;
  country: string;
  trip_id: number;
  photo_reference?: string | null;
  user_id: number;
};
export type TripStatus = "futur" | "past" | "current";
