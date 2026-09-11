import { Link } from "react-router-dom";
import { Landmark, MapPin, Mail, Phone } from "lucide-react";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/council/current", label: "Current Council" },
];

const legislativeLinks = [
  { to: "/legislative/ordinances", label: "Ordinances" },
  { to: "/legislative/resolutions", label: "Resolutions" },
  { to: "/legislative/session-minutes", label: "Session Minutes" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-forest-100 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-700 text-white">
                <Landmark className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="font-display font-semibold text-forest-800">Sangguniang Bayan</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Official legislative information portal of the Sangguniang Bayan ng Balilihan, Bohol —
              publishing ordinances, resolutions, session minutes, and councilor records.
            </p>
            <p className="mt-4 font-display text-sm italic text-forest-700">
              &ldquo;Serbisyong tinuoray, alang sa malinawong Balilihan.&rdquo;
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-ink">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted transition-colors hover:text-forest-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-ink">Legislative</h3>
            <ul className="mt-4 space-y-2">
              {legislativeLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted transition-colors hover:text-forest-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-ink">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>Del Carmen Weste, Balilihan, Bohol</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted">
                <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <a href="mailto:sbbalilihan@gmail.com" className="break-all hover:text-forest-700">
                  sbbalilihan@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted">
                <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <a href="tel:+639858981439" className="hover:text-forest-700">
                  0985 898 1439
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-forest-100 pt-6 text-center text-sm text-muted sm:flex-row sm:text-left">
          <p>&copy; {new Date().getFullYear()} Sangguniang Bayan ng Balilihan. All rights reserved.</p>
          <p>
            This portal displays records officially reviewed and published by the Office of the
            Sangguniang Bayan.
          </p>
        </div>
      </div>
    </footer>
  );
}
