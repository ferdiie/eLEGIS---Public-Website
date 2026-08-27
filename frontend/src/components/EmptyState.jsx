import { Inbox, AlertTriangle } from "lucide-react";

export function EmptyState({ title = "Nothing here yet", description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-forest-200 bg-forest-50/40 py-16 text-center">
      <Inbox className="h-8 w-8 text-forest-400" aria-hidden="true" />
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="max-w-md text-sm text-muted">{description}</p>}
    </div>
  );
}

export function ErrorState({ message = "Something went wrong. Please try again." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50 py-16 text-center">
      <AlertTriangle className="h-8 w-8 text-red-400" aria-hidden="true" />
      <p className="max-w-md text-sm text-red-700">{message}</p>
    </div>
  );
}
