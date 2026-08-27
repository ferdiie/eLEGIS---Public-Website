import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { ScrollText, Gavel, BookOpen } from "lucide-react";
import { api } from "../../api/client";
import SearchFilterBar from "../../components/SearchFilterBar";
import RecordCard from "../../components/RecordCard";
import Pagination from "../../components/Pagination";
import Loading from "../../components/Loading";
import { EmptyState, ErrorState } from "../../components/EmptyState";

const TYPE_META = {
  ordinances: {
    label: "Ordinances",
    icon: ScrollText,
    theme: "bg-seal-hero",
    description: "Municipal laws enacted by the Sangguniang Bayan of Balilihan.",
  },
  resolutions: {
    label: "Resolutions",
    icon: Gavel,
    theme: "bg-harbor-700",
    description: "Formal expressions of the Council's opinion, will, or internal procedure.",
  },
  "session-minutes": {
    label: "Session Minutes",
    icon: BookOpen,
    theme: "bg-forest-900",
    description: "Official records of proceedings from Sangguniang Bayan sessions.",
  },
};

const PAGE_SIZE = 8;
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 12 }, (_, i) => currentYear - i);

const EMPTY_FILTERS = { search: "", year: "", category: "", date: "", author: "" };

export default function RecordList() {
  const { type } = useParams();
  const meta = TYPE_META[type] || TYPE_META.ordinances;
  const Icon = meta.icon;

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, error: null, data: [], count: 0 });

  // Reset to page 1 whenever the record type or filters change.
  useEffect(() => {
    setPage(1);
  }, [type, filters]);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    const timeout = setTimeout(async () => {
      try {
        const res = await api.legislative.list(type, { ...filters, page, pageSize: PAGE_SIZE });
        if (!cancelled) {
          setState({ loading: false, error: null, data: res.data || [], count: res.count || 0 });
        }
      } catch (err) {
        if (!cancelled) setState({ loading: false, error: err.message, data: [], count: 0 });
      }
    }, 300); // small debounce so typing doesn't fire a request per keystroke

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [type, filters, page]);

  const showingLabel = useMemo(() => {
    if (state.count === 0) return `Showing 0 of 0 ${meta.label.toLowerCase()}`;
    const from = (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, state.count);
    return `Showing ${from}\u2013${to} of ${state.count} ${meta.label.toLowerCase()}`;
  }, [state.count, page, meta.label]);

  return (
    <div>
      <section className={`${meta.theme} text-white`}>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-semibold sm:text-3xl">{meta.label}</h1>
              <p className="text-sm text-white/80">{meta.description}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6">
        <SearchFilterBar
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
          years={YEAR_OPTIONS}
          categories={[]}
          showAuthor={type !== "session-minutes"}
        />

        <p className="text-sm text-muted">{showingLabel}</p>

        {state.loading && <Loading label={`Loading ${meta.label.toLowerCase()}`} />}
        {!state.loading && state.error && <ErrorState message={state.error} />}
        {!state.loading && !state.error && state.data.length === 0 && (
          <EmptyState
            title={`No published ${meta.label.toLowerCase()} found`}
            description="Try adjusting your search or filters. Only officially published records are shown here."
          />
        )}

        {!state.loading && !state.error && state.data.length > 0 && (
          <div className="space-y-3">
            {state.data.map((record) => (
              <RecordCard key={record.id} type={type} record={record} />
            ))}
          </div>
        )}

        <Pagination page={page} pageSize={PAGE_SIZE} count={state.count} onPageChange={setPage} />
      </div>
    </div>
  );
}
