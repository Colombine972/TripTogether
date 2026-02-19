export type ToastType = "success" | "error" | "info" | "warning";

export type ToastLocationState = {
  toast?: {
    type: ToastType;
    message: string;
  };
};
