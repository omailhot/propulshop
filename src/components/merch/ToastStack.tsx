import { CheckCircle2 } from 'lucide-react'

type Toast = {
  id: string
  message: string
}

type ToastStackProps = {
  toasts: Toast[]
}

export function ToastStack({ toasts }: ToastStackProps) {
  return (
    <div className="pointer-events-none fixed right-4 bottom-20 z-[60] flex w-[min(26rem,92vw)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-2 rounded-lg border bg-background px-3 py-2 shadow-md"
        >
          <CheckCircle2 className="size-4 text-primary" />
          <p className="text-sm">{toast.message}</p>
        </div>
      ))}
    </div>
  )
}

