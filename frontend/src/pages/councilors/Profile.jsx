import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, UserRound, ScrollText, Gavel } from "lucide-react";
import { api } from "../../api/client";
import Loading from "../../components/Loading";
import { EmptyState, ErrorState } from "../../components/EmptyState";

export default function CouncilorProfile() {
  const { id } = useParams();
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: null, data: null });
    api.councilors
      .profile(id)
      .then((res) => !cancelled && setState({ loading: false, error: null, data: res.data }))
      .catch((err) => !cancelled && setState({ loading: false, error: err.message, data: null }));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.loading) return <Loading label="Loading councilor profile" />;
  if (state.error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState message={state.error} />
      </div>
    );
  }

  const m = state.data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link to="/council/current" className="mb-5 inline-flex items-center gap-1 text-sm text-forest-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Council
      </Link>

      <div className="card flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left sm:p-8">
        <span className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest-100 text-forest-600 ring-2 ring-forest-100">
          {m.photo_url ? (
            <img src={m.photo_url} alt={m.full_name} className="h-full w-full object-cover" />
          ) : (
            <UserRound className="h-10 w-10" />
          )}
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{m.full_name}</h1>
          <p className="capitalize text-muted">{m.position}</p>
          {m.terms && m.terms.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {m.terms.map((t) => (
                <span key={t.id} className="badge bg-forest-50 text-forest-700">
                  {t.term_period} {t.status === "active" ? "· Active" : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-forest-700">
            <ScrollText className="h-4 w-4" />
            <h2 className="font-display font-semibold">Authored Ordinances</h2>
          </div>
          <div className="mt-3 space-y-2">
            {(!m.authored_ordinances || m.authored_ordinances.length === 0) && (
              <EmptyState title="No published ordinances on record" />
            )}
            {m.authored_ordinances?.map((o) => (
              <Link
                key={o.id}
                to={`/legislative/ordinances/${o.id}`}
                className="block rounded-lg border border-forest-100 p-3 text-sm hover:bg-forest-50"
              >
                <span className="record-number">{o.ordinance_number}</span>
                <p className="mt-1 font-medium text-ink">{o.title}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 text-harbor-700">
            <Gavel className="h-4 w-4" />
            <h2 className="font-display font-semibold">Authored Resolutions</h2>
          </div>
          <div className="mt-3 space-y-2">
            {(!m.authored_resolutions || m.authored_resolutions.length === 0) && (
              <EmptyState title="No published resolutions on record" />
            )}
            {m.authored_resolutions?.map((r) => (
              <Link
                key={r.id}
                to={`/legislative/resolutions/${r.id}`}
                className="block rounded-lg border border-forest-100 p-3 text-sm hover:bg-forest-50"
              >
                <span className="record-number">{r.resolution_number}</span>
                <p className="mt-1 font-medium text-ink">{r.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
