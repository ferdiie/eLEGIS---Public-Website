import { NavLink } from "react-router-dom";

// A secondary row of pill tabs shown only on mobile, right below the header
// + MobileTabBar — the "tab inside a tab" for sections (Legislative, Council)
// whose sub-pages are reachable via a dropdown in the desktop nav, which has
// no mobile equivalent since MobileTabBar only covers the 5 top-level tabs.
export default function MobileSubTabs({ tabs }) {
  return (
    <div className="sticky top-[118px] z-20 flex gap-2 overflow-x-auto border-b border-forest-100 bg-white px-4 py-3 md:hidden">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            `flex-shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              isActive ? "bg-forest-600 text-white" : "bg-gray-100 text-gray-600"
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}
