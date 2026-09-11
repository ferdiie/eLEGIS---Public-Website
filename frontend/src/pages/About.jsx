import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
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
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-forest-700" aria-hidden="true" />
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">About Us</h1>
      </div>

      {state.loading && <Loading label="Loading office information" />}
      {state.error && <ErrorState message={state.error} />}

      {state.data && (
        <div className="mt-8 space-y-5 leading-relaxed text-ink">
          <p>{state.data.description}</p>
          <p>{state.data.mission}</p>
          <p>{state.data.vision}</p>
          <p className="italic text-forest-700">&ldquo;{state.data.tagline}&rdquo;</p>
        </div>
      )}

      <div className="mt-8 space-y-5 leading-relaxed text-ink">
        <p>
          The name <strong>eLEGIS</strong> comes from <em>Legis</em>, the Latin root for "law," paired
          with "e" for electronic — reflecting what the platform does: bringing the Sangguniang
          Bayan's legislative work online, where it can be reached by anyone, anytime.
        </p>
        <p>
          eLEGIS is the official digital portal for the legislative records of Balilihan, Bohol. It
          gives residents direct access to published ordinances, resolutions, and session minutes,
          along with information on the councilors behind them — without needing to visit the
          municipal office in person just to check whether a law has been passed or a session has
          taken place.
        </p>
        <p>
          By making these records searchable and open to the public, eLEGIS supports transparency
          and accountability in local governance, and helps residents stay informed about the
          decisions that shape their community.
        </p>
      </div>
    </div>
  );
}
