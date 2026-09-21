import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "../api/client";
import RecordCard from "../components/RecordCard";
import Loading from "../components/Loading";
import { EmptyState, ErrorState } from "../components/EmptyState";

const PREVIEW_SIZE = 5;

const TYPES = [
  { type: "ordinances", label: "Ordinances" },
  { type: "resolutions", label: "Resolutions" },
  { type: "session-minutes", label: "Session Minutes" },
];

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [state, setState] = useState({ loading: true, error: null, results: {} });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: null, results: {} });
    Promise.all(TYPES.map((t) => api.legislative.list(t.type, { search: q, pageSize: PREVIEW_SIZE })))
      .then((responses) => {
        if (cancelled) return;
        const results = {};
        TYPES.forEach((t, i) => {
          results[t.type] = { items: responses[i].data || [], count: responses[i].count || 0 };
        });
        setState({ loading: false, error: null, results });
      })
      .catch((err) => !cancelled && setState({ loading: false, error: err.message, results: {} }));
    return () => {
      cancelled = true;
    };
  }, [q]);

  const totalResults = Object.values(state.results).reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-2 text-muted">
        <Search className="h-4 w-4" />
        <p className="text-sm">
          Search results for <span className="font-medium text-ink">&ldquo;{q}&rdquo;</span>
        </p>
      </div>

      {state.loading && <Loading label="Searching legislative records" />}
      {!state.loading && state.error && <ErrorState message={state.error} />}
      {!state.loading && !state.error && totalResults === 0 && (
        <EmptyState
          title="No published records matched your search"
          description="Try a different keyword, category, or record number."
        />
      )}

      {!state.loading &&
        !state.error &&
        TYPES.map((t) => {
          const result = state.results[t.type];
          if (!result || result.items.length === 0) return null;
          return (
            <div key={t.type} className="mt-8">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-ink">
                  {t.label} <span className="text-sm font-normal text-muted">({result.count})</span>
                </h2>
                {result.count > result.items.length && (
                  <Link
                    to={`/legislative/${t.type}?search=${encodeURIComponent(q)}`}
                    className="text-sm font-medium text-forest-700 hover:underline"
                  >
                    View all {result.count}
                  </Link>
                )}
              </div>
              <div className="space-y-3">
                {result.items.map((record) => (
                  <RecordCard key={record.id} type={t.type} record={record} />
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}
