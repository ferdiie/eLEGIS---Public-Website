import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "../api/client";
import RecordCard from "../components/RecordCard";
import Loading from "../components/Loading";
import { EmptyState, ErrorState } from "../components/EmptyState";

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
    Promise.all(TYPES.map((t) => api.legislative.list(t.type, { search: q, pageSize: 5 })))
      .then((responses) => {
        if (cancelled) return;
        const results = {};
        TYPES.forEach((t, i) => {
          results[t.type] = responses[i].data || [];
        });
        setState({ loading: false, error: null, results });
      })
      .catch((err) => !cancelled && setState({ loading: false, error: err.message, results: {} }));
    return () => {
      cancelled = true;
    };
  }, [q]);

  const totalResults = Object.values(state.results).reduce((sum, arr) => sum + arr.length, 0);

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
          description="Try a different keyword, ordinance/resolution number, or author name."
        />
      )}

      {!state.loading &&
        !state.error &&
        TYPES.map(
          (t) =>
            state.results[t.type]?.length > 0 && (
              <div key={t.type} className="mt-8">
                <h2 className="mb-3 font-display text-lg font-semibold text-ink">{t.label}</h2>
                <div className="space-y-3">
                  {state.results[t.type].map((record) => (
                    <RecordCard key={record.id} type={t.type} record={record} />
                  ))}
                </div>
              </div>
            )
        )}
    </div>
  );
}
