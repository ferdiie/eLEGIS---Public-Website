import { Landmark } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-forest-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-700 text-white">
              <Landmark className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display font-semibold text-forest-800">Sangguniang Bayan ng Balilihan</p>
              <p className="text-sm text-muted">Official Legislative Information Portal · Balilihan, Bohol</p>
            </div>
          </div>
          <p className="max-w-sm text-sm italic text-muted">
            &ldquo;Serbisyong tinuoray, alang sa malinawong Balilihan.&rdquo;
          </p>
        </div>
        <p className="mt-8 text-xs text-muted">
          This portal displays legislative records that have been officially reviewed and published by the
          Office of the Sangguniang Bayan. For records not yet listed here, please contact the SB Office
          directly.
        </p>
      </div>
    </footer>
  );
}
