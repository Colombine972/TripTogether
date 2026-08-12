import type { CurrencyCode } from "../constants/currencies";

export type Step = {
  id: number;
  city: string;
  country: string;
  trip_id: number;
  status?: "pending" | "validated" | "rejected";
  creator_name: string;
  is_initial: boolean;
  place_id?: string | null;
  voteStats?: {
    yes: number;
    no: number;
    total: number;
  };
  start_at?: string | null;
  end_at?: string | null;
};

export type StepCardProps = {
  step: Step;
  currentUserId: number;
  tripId: number;
  memberCount?: number;
  isMainDestination?: boolean;
  trip?: TheTrip | null;
  onVoteSuccess?: () => void;
};

export type StepsResponse =
  | {
      trip: {
        id: number;
        title: string;
        description: string;
        memberCount: number;
      };
      steps: Step[];
    }
  | { error?: string; message?: string };

export type TheTrip = {
  id: number;
  title: string;
  description: string;
  city: string;
  country: string;
  start_at: string;
  end_at: string;
  place_id?: string | null;
  user_id?: number;
  participants?: number;
  role?: "organizer" | "participant";
  local_currency?: CurrencyCode | null;
  base_currency?: CurrencyCode | null;
  country_code?: string;
};
