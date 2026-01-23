import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const variant = (props as any)?.variant as
          | "default"
          | "success"
          | "warning"
          | "info"
          | "destructive"
          | undefined

        const Icon =
          variant === "success"
            ? CheckCircle2
            : variant === "warning"
              ? AlertTriangle
              : variant === "info"
                ? Info
                : variant === "destructive"
                  ? XCircle
                  : Info

        const iconClassName =
          variant === "success"
            ? "text-emerald-600"
            : variant === "warning"
              ? "text-amber-600"
              : variant === "info"
                ? "text-sky-600"
                : variant === "destructive"
                  ? "text-destructive-foreground"
                  : "text-primary"

        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60">
                <Icon className={"h-4 w-4 " + iconClassName} />
              </div>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
