import { useEffect, useState } from "react";
import { Landmark, Search } from "lucide-react";
import { api } from "../../api/client";
import CouncilorCard from "../../components/CouncilorCard";
import Loading from "../../components/Loading";
import { EmptyState, ErrorState } from "../../components/EmptyState";

export default function CurrentCouncil() {
  const [search, setSearch] = useState("");
  const [state, setState] = useState({ loading: true, error: null, data: [] });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    const timeout = setTimeout(() => {
      api.councilors
        .current({ search })
        .then((res) => !cancelled && setState({ loading: false, error: null, data: res.data || [] }))
        .catch((err) => !cancelled && setState({ loading: false, error: err.message, data: [] }));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search]);

  return (
    <div>
      <section className="bg-seal-hero text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <Landmark className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-semibold sm:text-3xl">Current Council</h1>
              <p className="text-sm text-white/80">{state.data.length} active member{state.data.length === 1 ? "" : "s"}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="card mb-6 flex items-center gap-2 p-3">
          <Search className="h-4 w-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or position…"
            className="input"
            aria-label="Search current councilors"
          />
        </div>

        {state.loading && <Loading label="Loading current council" />}
        {!state.loading && state.error && <ErrorState message={state.error} />}
        {!state.loading && !state.error && state.data.length === 0 && (
          <EmptyState title="No current council members found" />
        )}
        {!state.loading && !state.error && state.data.length > 0 && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {state.data.map((m) => (
              <CouncilorCard key={m.id} member={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
