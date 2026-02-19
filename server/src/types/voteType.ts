export type Vote = {
  id: number;
  created_at: string;
  user_id: number;
  step_id: number;
  vote: boolean;
  comment: string | null;
};

export type VoteWithUser = Vote & {
  user_name: string;
};

export type VotesStats = {
  step_id: number;
  allVotes: VoteWithUser[];
  summary: {
    yes: number;
    no: number;
    total: number;
  };
};

export type StepWithStatus = {
  id: number;
  city: string;
  country: string;
  trip_id: number;
  creator_name: string;
  status: "pending" | "validated" | "rejected";
  voteStats: {
    yes: number;
    no: number;
    total: number;
  };
};
