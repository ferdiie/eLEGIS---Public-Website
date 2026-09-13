import { NavLink, useLocation } from "react-router-dom";
import { Home, Newspaper, ScrollText, Landmark, Info } from "lucide-react";

const TABS = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/feed", label: "Feed", icon: Newspaper },
  { to: "/legislative/ordinances", label: "Legislative", icon: ScrollText, activeMatch: "/legislative" },
  { to: "/council/current", label: "Council", icon: Landmark, activeMatch: "/council" },
  { to: "/about", label: "About", icon: Info },
];

export default function MobileTabBar() {
  const location = useLocation();

  return (
    <nav
      className="sticky top-[65px] z-20 flex border-b border-forest-100 bg-white md:hidden"
      aria-label="Primary mobile"
    >
      {TABS.map(({ to, label, icon: Icon, exact, activeMatch }) => {
        const isActive = activeMatch
          ? location.pathname.startsWith(activeMatch)
          : exact
          ? location.pathname === to
          : location.pathname.startsWith(to);

        return (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className="flex flex-1 flex-col items-center gap-1.5 py-3"
          >
            <Icon className={`h-5 w-5 ${isActive ? "text-forest-600" : "text-gray-400"}`} aria-hidden="true" />
            <span className={`h-0.5 w-6 rounded-full ${isActive ? "bg-forest-600" : "bg-transparent"}`} />
          </NavLink>
        );
      })}
    </nav>
  );
}
