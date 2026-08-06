export type ReimbursementStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled";

export type Reimbursement = {
  id: number;
  trip_id: number;
  from_user_id: number;
  to_user_id: number;
  amount: number | string;
  currency: string;
  payment_method:
    | "wero"
    | "bank_transfer"
    | "other"
    | null;
  status: ReimbursementStatus;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  rejected_at: string | null;
  from_firstname?: string;
  to_firstname?: string;
};