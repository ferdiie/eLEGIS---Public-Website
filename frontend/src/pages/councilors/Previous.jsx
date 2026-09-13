import { useEffect, useState } from "react";
import { ChevronDown, History, Search } from "lucide-react";
import { api } from "../../api/client";
import CouncilorCard from "../../components/CouncilorCard";
import MobileSubTabs from "../../components/MobileSubTabs";
import Loading from "../../components/Loading";
import { EmptyState, ErrorState } from "../../components/EmptyState";

function TermGroup({ group, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between bg-forest-50 px-5 py-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-display font-semibold text-forest-800">
          {group.term_period}
          <span className="badge bg-white text-forest-700">
            {group.members.length} member{group.members.length === 1 ? "" : "s"}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-forest-600 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-5 p-5 sm:grid-cols-3 lg:grid-cols-4">
          {group.members.map((m) => (
            <CouncilorCard key={m.id} member={m} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PreviousCouncils() {
  const [search, setSearch] = useState("");
  const [state, setState] = useState({ loading: true, error: null, data: [] });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    const timeout = setTimeout(() => {
      api.councilors
        .previous({ search })
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
      <MobileSubTabs
        tabs={[
          { to: "/council/current", label: "Current Council" },
          { to: "/council/previous", label: "Previous Councils" },
        ]}
      />

      <section className="border-b border-forest-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-12">
          <div className="flex items-center gap-3">
            <span className="hidden h-11 w-11 items-center justify-center rounded-xl bg-harbor-50 text-harbor-700 md:flex">
              <History className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Previous Councils</h1>
              <p className="text-sm text-muted">Browsable history by term period</p>
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
            aria-label="Search previous councilors"
          />
        </div>

        {state.loading && <Loading label="Loading previous councils" />}
        {!state.loading && state.error && <ErrorState message={state.error} />}
        {!state.loading && !state.error && state.data.length === 0 && (
          <EmptyState title="No previous council records found" />
        )}
        {!state.loading && !state.error && state.data.length > 0 && (
          <div className="space-y-4">
            {state.data.map((group, i) => (
              <TermGroup key={group.term_period} group={group} defaultOpen={i === 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
