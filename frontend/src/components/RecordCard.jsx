import { Link } from "react-router-dom";
import { ScrollText, Gavel, BookOpen, Eye } from "lucide-react";

const ICONS = {
  ordinances: ScrollText,
  resolutions: Gavel,
  "session-minutes": BookOpen,
};

export default function RecordCard({ type, record }) {
  const Icon = ICONS[type] || ScrollText;
  const number =
    record.ordinance_number || record.resolution_number || record.session_number || "—";
  const title = record.title || record.agenda || "Untitled record";
  const subtitle =
    type === "session-minutes"
      ? [record.session_type, record.venue].filter(Boolean).join(" · ")
      : record.year
      ? String(record.year)
      : null;

  return (
    <div className="card flex items-start gap-4 p-5">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="record-number">{number}</span>
          {record.status === "published" && <span className="badge badge-published">Published</span>}
        </div>
        <h3 className="mt-1.5 truncate text-base font-semibold text-ink" title={title}>
          {title}
        </h3>
        <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted">
          {record.session_date && <span>{record.session_date}</span>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      </div>
      <Link
        to={`/legislative/${type}/${record.id}`}
        className="btn-secondary flex-shrink-0 self-center"
      >
        <Eye className="h-4 w-4" /> View
      </Link>
    </div>
  );
}
