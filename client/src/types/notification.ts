export type NotificationType =
  | "reimbursement_pending"
  | "reimbursement_confirmed"
  | "reimbursement_rejected"
  | "expense_created"
  | "expense_updated"
  | "participant_joined"
  | "trip_invitation"
  | "trip_updated"
  | "vote_created"
  | "general";

export type Notification = {
  id: number;

  user_id: number;
  trip_id: number | null;

  type: NotificationType;

  title: string;
  message: string;

  emoji: string | null;

  context_label: string | null;

  reference_type: string | null;
  reference_id: number | null;

  is_read: boolean;

  created_at: string;
};