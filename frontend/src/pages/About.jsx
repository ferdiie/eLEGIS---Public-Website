import { useEffect, useState } from "react";
import { ShieldCheck, Star, Landmark } from "lucide-react";
import { api } from "../api/client";
import Loading from "../components/Loading";
import { ErrorState } from "../components/EmptyState";

export default function About() {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let cancelled = false;
    api
      .about()
      .then((res) => !cancelled && setState({ loading: false, error: null, data: res.data }))
      .catch((err) => !cancelled && setState({ loading: false, error: err.message, data: null }));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <section className="bg-seal-hero text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-semibold sm:text-3xl">About the Office</h1>
              <p className="text-sm text-white/80">Sangguniang Bayan ng Balilihan, Bohol</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {state.loading && <Loading label="Loading office information" />}
        {state.error && <ErrorState message={state.error} />}
        {state.data && (
          <div className="space-y-6">
            <div className="card p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-700 text-white">
                  <Landmark className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-semibold text-ink">{state.data.office_name}</h2>
              </div>
              <p className="mt-4 leading-relaxed text-ink">{state.data.description}</p>
              <p className="mt-4 font-display italic text-forest-700">&ldquo;{state.data.tagline}&rdquo;</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="card border-forest-100 bg-forest-50/60 p-6">
                <div className="flex items-center gap-2 text-forest-700">
                  <Star className="h-4 w-4" />
                  <h3 className="font-display font-semibold">Mission</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink">{state.data.mission}</p>
              </div>
              <div className="card border-harbor-700/20 bg-harbor-700/5 p-6">
                <div className="flex items-center gap-2 text-harbor-700">
                  <Landmark className="h-4 w-4" />
                  <h3 className="font-display font-semibold">Vision</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink">{state.data.vision}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
