import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Search, Menu, X } from "lucide-react";
import balilihanLogo from "../assets/balilihan-logo-Large-1.png";

const legislativeLinks = [
  { to: "/legislative/ordinances", label: "Ordinances" },
  { to: "/legislative/resolutions", label: "Resolutions" },
  { to: "/legislative/session-minutes", label: "Session Minutes" },
];

const councilLinks = [
  { to: "/council/current", label: "Current Council" },
  { to: "/council/previous", label: "Previous Councils" },
];

function NavDropdown({ label, links, isActive }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
          isActive ? "border-forest-600 text-forest-700" : "border-transparent text-gray-700 hover:text-forest-700"
        }`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-xl border border-forest-100 bg-white shadow-card">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive: active }) =>
                `block px-4 py-2.5 text-sm ${
                  active ? "bg-forest-50 text-forest-700 font-medium" : "text-gray-700 hover:bg-forest-50"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  function submitSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-forest-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-9 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={balilihanLogo} alt="Municipality of Balilihan seal" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-display text-lg font-bold text-forest-800">
            eLEGIS<span className="font-semibold text-muted"> - Balilihan</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-9 md:flex" aria-label="Primary">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                isActive ? "border-forest-600 text-forest-700" : "border-transparent text-gray-700 hover:text-forest-700"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              `border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                isActive ? "border-forest-600 text-forest-700" : "border-transparent text-gray-700 hover:text-forest-700"
              }`
            }
          >
            Feed
          </NavLink>
          <NavDropdown
            label="Legislative"
            links={legislativeLinks}
            isActive={location.pathname.startsWith("/legislative")}
          />
          <NavDropdown
            label="Council"
            links={councilLinks}
            isActive={location.pathname.startsWith("/council")}
          />
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                isActive ? "border-forest-600 text-forest-700" : "border-transparent text-gray-700 hover:text-forest-700"
              }`
            }
          >
            About
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            {searchOpen ? (
              <form onSubmit={submitSearch} className="flex items-center">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => !query && setSearchOpen(false)}
                  placeholder="Search ordinances, resolutions…"
                  className="input w-64"
                  aria-label="Search legislative records"
                />
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-forest-50 hover:text-forest-700"
                aria-label="Open search"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-forest-100 bg-white px-4 py-3 md:hidden" aria-label="Primary mobile">
          <form onSubmit={submitSearch} className="mb-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ordinances, resolutions…"
              className="input"
              aria-label="Search legislative records"
            />
          </form>
          <MobileLink to="/" label="Home" onClick={() => setMobileOpen(false)} end />
          <MobileLink to="/feed" label="Feed" onClick={() => setMobileOpen(false)} />
          <p className="mt-3 px-1 text-xs font-semibold uppercase tracking-wide text-muted">Legislative</p>
          {legislativeLinks.map((l) => (
            <MobileLink key={l.to} to={l.to} label={l.label} onClick={() => setMobileOpen(false)} />
          ))}
          <p className="mt-3 px-1 text-xs font-semibold uppercase tracking-wide text-muted">Council</p>
          {councilLinks.map((l) => (
            <MobileLink key={l.to} to={l.to} label={l.label} onClick={() => setMobileOpen(false)} />
          ))}
          <div className="mt-3 border-t border-forest-100 pt-3">
            <MobileLink to="/about" label="About" onClick={() => setMobileOpen(false)} />
          </div>
        </nav>
      )}
    </header>
  );
}

function MobileLink({ to, label, onClick, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `block rounded-md px-3 py-2 text-sm ${
          isActive ? "bg-forest-50 font-medium text-forest-700" : "text-gray-700"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
