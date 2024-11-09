export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  type: ToastType;
  message: string;
}
