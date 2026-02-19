export type Vote = {
  id: number;
  created_at: string;
  user_id: number;
  step_id: number;
  vote: boolean;
  comment: string | null;
  user_name: string;
};

export type VotesStats = {
  step_id: number;
  allVotes: Vote[];
  summary: {
    yes: number;
    no: number;
    total: number;
  };
};

export type CreateVotePayload = {
  vote: boolean;
  comment?: string;
};
