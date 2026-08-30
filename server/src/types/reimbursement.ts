export type ReimbursementStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled";

export type ReimbursementPaymentMethod =
  | "wero"
  | "bank_transfer"
  | "other";

export type ReimbursementAllocationType =
  | "debt"
  | "offset";

export type CreateReimbursementPayload = {
  tripId: number;
  fromUserId: number;
  toUserId: number;
  amount: number;
  currency: string;
  paymentMethod: ReimbursementPaymentMethod | null;
};

export type Reimbursement = {
  id: number;

  trip_id: number;

  from_user_id: number;

  to_user_id: number;

  amount: number;

  currency: string;

  payment_method: ReimbursementPaymentMethod | null;

  status: ReimbursementStatus;

  created_at: string;

  updated_at: string;

  confirmed_at: string | null;

  rejected_at: string | null;

  from_firstname?: string;

  to_firstname?: string;
};

export type ReimbursementExpenseAllocation = {
  expenseId: number;

  amount: number;

  type: ReimbursementAllocationType;
};