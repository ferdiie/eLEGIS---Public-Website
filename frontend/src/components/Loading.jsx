export default function Loading({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted" role="status" aria-live="polite">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-forest-200 border-t-forest-600" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}
