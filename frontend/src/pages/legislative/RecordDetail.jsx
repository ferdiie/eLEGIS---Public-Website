import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, Maximize2, UserRound, FileWarning } from "lucide-react";
import { api } from "../../api/client";
import Loading from "../../components/Loading";
import { ErrorState } from "../../components/EmptyState";

const TYPE_LABEL = {
  ordinances: "Ordinance",
  resolutions: "Resolution",
  "session-minutes": "Session Minutes",
};

function isPreviewable(filetype) {
  if (!filetype) return false;
  const ft = filetype.toLowerCase();
  return ["pdf", "jpg", "jpeg", "png"].some((ext) => ft.includes(ext));
}

function isImage(filetype) {
  if (!filetype) return false;
  const ft = filetype.toLowerCase();
  return ["jpg", "jpeg", "png"].some((ext) => ft.includes(ext));
}

export default function RecordDetail() {
  const { type, id } = useParams();
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: null, data: null });
    api.legislative
      .detail(type, id)
      .then((res) => !cancelled && setState({ loading: false, error: null, data: res.data }))
      .catch((err) => !cancelled && setState({ loading: false, error: err.message, data: null }));
    return () => {
      cancelled = true;
    };
  }, [type, id]);

  if (state.loading) return <Loading label="Loading record" />;
  if (state.error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState message={state.error} />
      </div>
    );
  }

  const record = state.data;
  const number = record.ordinance_number || record.resolution_number || record.session_number;
  const downloadUrl = api.legislative.downloadUrl(type, id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to={`/legislative/${type}`} className="mb-5 inline-flex items-center gap-1 text-sm text-forest-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to {TYPE_LABEL[type] || "Records"}
      </Link>

      <div className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          {number && <span className="record-number">{number}</span>}
          {record.status === "published" && <span className="badge badge-published">Published</span>}
          {record.category && <span className="badge bg-gray-100 text-gray-600">{record.category}</span>}
        </div>

        <h1 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
          {record.title || record.agenda}
        </h1>

        <dl className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          {record.year && (
            <div>
              <dt className="text-muted">Year</dt>
              <dd className="font-medium text-ink">{record.year}</dd>
            </div>
          )}
          {record.session_date && (
            <div>
              <dt className="text-muted">Session Date</dt>
              <dd className="font-medium text-ink">{record.session_date}</dd>
            </div>
          )}
          {record.session_type && (
            <div>
              <dt className="text-muted">Session Type</dt>
              <dd className="font-medium capitalize text-ink">{record.session_type}</dd>
            </div>
          )}
          {record.venue && (
            <div>
              <dt className="text-muted">Venue</dt>
              <dd className="font-medium text-ink">{record.venue}</dd>
            </div>
          )}
          {record.uploaded_at && (
            <div>
              <dt className="text-muted">Uploaded</dt>
              <dd className="font-medium text-ink">{new Date(record.uploaded_at).toLocaleDateString()}</dd>
            </div>
          )}
        </dl>

        {record.agenda && record.title && (
          <div className="mt-5">
            <p className="text-sm font-medium text-muted">Agenda</p>
            <p className="mt-1 whitespace-pre-line text-sm text-ink">{record.agenda}</p>
          </div>
        )}

        {record.minutes_text && (
          <div className="mt-5">
            <p className="text-sm font-medium text-muted">Minutes</p>
            <p className="mt-1 whitespace-pre-line text-sm text-ink">{record.minutes_text}</p>
          </div>
        )}

        {record.officials && record.officials.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-muted">Associated Officials</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {record.officials.map((o) => (
                <Link
                  key={o.id}
                  to={`/council/member/${o.id}`}
                  className="flex items-center gap-1.5 rounded-full border border-forest-100 bg-forest-50 px-3 py-1.5 text-sm text-forest-700 hover:bg-forest-100"
                >
                  <UserRound className="h-3.5 w-3.5" /> {o.full_name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Document preview + download */}
        <div className="mt-8 border-t border-forest-100 pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">Document</p>
            {record.file_url && (
              <div className="flex gap-2">
                <a href={record.file_url} target="_blank" rel="noreferrer" className="btn-secondary">
                  <Maximize2 className="h-4 w-4" /> Full Screen
                </a>
                <a href={downloadUrl} className="btn-primary">
                  <Download className="h-4 w-4" /> Download
                </a>
              </div>
            )}
          </div>

          <div className="mt-4">
            {!record.file_url && (
              <p className="flex items-center gap-2 rounded-lg bg-gray-50 p-4 text-sm text-muted">
                <FileWarning className="h-4 w-4" /> No document has been attached to this record.
              </p>
            )}
            {record.file_url && isPreviewable(record.filetype) && !isImage(record.filetype) && (
              <iframe
                title={`Preview of ${record.title || number}`}
                src={record.file_url}
                className="h-[600px] w-full rounded-lg border border-forest-100"
              />
            )}
            {record.file_url && isImage(record.filetype) && (
              <img
                src={record.file_url}
                alt={`Scanned document for ${record.title || number}`}
                className="max-h-[600px] w-full rounded-lg border border-forest-100 object-contain"
              />
            )}
            {record.file_url && !isPreviewable(record.filetype) && (
              <p className="rounded-lg bg-gray-50 p-4 text-sm text-muted">
                This file type ({record.filetype}) can't be previewed in the browser. Please use the
                Download button above.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
