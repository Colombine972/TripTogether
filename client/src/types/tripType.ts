export type Step = {
  id: number;
  city: string;
  country: string;
  trip_id: number;
  status?: "pending" | "validated" | "rejected";
  creator_name: string;
  is_initial: boolean;
  image_url?: string;
  voteStats?: {
    yes: number;
    no: number;
    total: number;
  };
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
  image_url?: string;
  user_id?: number;
  participants?: number;
  role?: "organizer" | "participant";
};
