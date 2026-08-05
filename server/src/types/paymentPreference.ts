export type PaymentMethod = "wero" | "bank_transfer";

export type UserPaymentPreference = {
  id: number;
  user_id: number;
  preferred_method: PaymentMethod | null;
  wero_phone: string | null;
  iban: string | null;
  iban_holder_name: string | null;
  created_at: string;
  updated_at: string;
};

export type UpdatePaymentPreferencePayload = {
  userId: number;
  preferredMethod: PaymentMethod | null;
  weroPhone: string | null;
  iban: string | null;
  ibanHolderName: string | null;
};