import { useEffect } from "react";
import { useLocation } from "react-router";
import { toast } from "react-toastify";
import type { ToastLocationState } from "../types/toast";

export function useToast() {
  const location = useLocation();

  useEffect(() => {
    const state = location.state as ToastLocationState | null;

    if (state?.toast) {
      const { type, message } = state.toast;
      const show = toast[type] ?? toast.error;
      show(message);
    }
  }, [location]);
}
