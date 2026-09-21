import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";

export default function SearchFilterBar({
  filters,
  onChange,
  onReset,
  years = [],
  categories = [],
}) {
  function set(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-forest-700">
        <Search className="h-4 w-4 flex-shrink-0" />
        <input
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="Search by title, number, author, or keyword…"
          className="input"
          aria-label="Search records"
        />
      </div>

      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-muted">
        <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categories.length > 0 && (
          <select
            value={filters.category}
            onChange={(e) => set("category", e.target.value)}
            className="input"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        {years.length > 0 && (
          <select
            value={filters.year}
            onChange={(e) => set("year", e.target.value)}
            className="input"
            aria-label="Filter by year"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}

        <input
          type="date"
          value={filters.date}
          onChange={(e) => set("date", e.target.value)}
          className="input"
          aria-label="Filter by date"
        />
      </div>

      <div className="mt-3 flex justify-end">
        <button onClick={onReset} className="btn-secondary">
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
    </div>
  );
}
