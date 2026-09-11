import { useEffect, useState } from "react";
import { Search, Newspaper, Pin } from "lucide-react";
import { api } from "../api/client";
import Pagination from "../components/Pagination";
import Loading from "../components/Loading";
import { EmptyState, ErrorState } from "../components/EmptyState";
import balilihanLogo from "../assets/balilihan-logo-Large-1.png";

const CATEGORY_LABEL = {
  announcement: "Announcement",
  activity: "Activity",
  trivia: "Trivia",
};

const PAGE_SIZE = 8;
const EMPTY_FILTERS = { search: "", category: "all", sort: "newest" };
const SEE_MORE_THRESHOLD = 220;

function formatRelativeTime(iso) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// Facebook-style multi-photo layout: 1 photo full width, 2 side-by-side,
// 3 as one large + two stacked, 4+ as a 2x2 grid with a "+N" overflow tile.
function PhotoGrid({ images }) {
  if (!images || images.length === 0) return null;
  const count = images.length;

  if (count === 1) {
    return (
      <div className="mt-3 overflow-hidden rounded-xl bg-forest-50">
        <img src={images[0].url} alt="" loading="lazy" className="max-h-[480px] w-full object-cover" />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="mt-3 grid h-80 grid-cols-2 gap-1 overflow-hidden rounded-xl">
        {images.map((img, i) => (
          <img key={img.path || i} src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="mt-3 grid h-80 grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-xl">
        <img src={images[0].url} alt="" loading="lazy" className="row-span-2 h-full w-full object-cover" />
        <img src={images[1].url} alt="" loading="lazy" className="h-full w-full object-cover" />
        <img src={images[2].url} alt="" loading="lazy" className="h-full w-full object-cover" />
      </div>
    );
  }

  const extra = count - 4;
  return (
    <div className="mt-3 grid h-80 grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-xl">
      {images.slice(0, 4).map((img, i) => (
        <div key={img.path || i} className="relative h-full w-full">
          <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
          {i === 3 && extra > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-xl font-semibold text-white">
              +{extra}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ExpandableText({ title, body }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = (body || "").length > SEE_MORE_THRESHOLD;

  return (
    <div className="mt-3 text-sm leading-relaxed text-ink">
      {title && <p className="font-semibold">{title}</p>}
      <p className={`whitespace-pre-line ${!expanded && isLong ? "line-clamp-4" : ""}`}>{body}</p>
      {!expanded && isLong && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-1 font-medium text-forest-700 hover:underline"
        >
          See more
        </button>
      )}
    </div>
  );
}

function FeedPost({ post }) {
  return (
    <article className="card p-5">
      <div className="flex items-center gap-3">
        <img
          src={balilihanLogo}
          alt="Municipality of Balilihan seal"
          className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">Sangguniang Bayan ng Balilihan</p>
          <p className="text-xs text-muted">
            {formatRelativeTime(post.created_at)} · {CATEGORY_LABEL[post.category] || post.category}
          </p>
        </div>
        {post.pinned && (
          <span className="badge flex-shrink-0 bg-amber-50 text-amber-700">
            <Pin className="h-3 w-3" /> Pinned
          </span>
        )}
      </div>

      <ExpandableText title={post.title} body={post.body} />
      <PhotoGrid images={post.images} />
    </article>
  );
}

export default function Feed() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, error: null, data: [], count: 0 });

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    const timeout = setTimeout(async () => {
      try {
        const res = await api.home.feed({ ...filters, page, pageSize: PAGE_SIZE });
        if (!cancelled) {
          setState({ loading: false, error: null, data: res.data || [], count: res.count || 0 });
        }
      } catch (err) {
        if (!cancelled) setState({ loading: false, error: err.message, data: [], count: 0 });
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [filters, page]);

  function set(field, value) {
    setFilters((f) => ({ ...f, [field]: value }));
  }

  return (
    <div>
      <section className="bg-seal-hero text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <Newspaper className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-semibold sm:text-3xl">Feed</h1>
              <p className="text-sm text-white/80">
                Announcements and activities from the Sangguniang Bayan office.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-2xl space-y-5 px-4 py-8 sm:px-6">
        <div className="card grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-5">
          <div>
            <label className="text-xs font-medium text-muted">Search</label>
            <div className="mt-1 flex items-center gap-2">
              <Search className="h-4 w-4 flex-shrink-0 text-muted" />
              <input
                value={filters.search}
                onChange={(e) => set("search", e.target.value)}
                placeholder="Find a post…"
                className="input"
                aria-label="Search the feed"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Category</label>
            <select
              value={filters.category}
              onChange={(e) => set("category", e.target.value)}
              className="input mt-1"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="announcement">Announcements</option>
              <option value="activity">Activities</option>
              <option value="trivia">Trivia</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => set("sort", e.target.value)}
              className="input mt-1"
              aria-label="Sort the feed"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {state.loading && <Loading label="Loading the feed" />}
        {!state.loading && state.error && <ErrorState message={state.error} />}
        {!state.loading && !state.error && state.data.length === 0 && (
          <EmptyState
            title="No posts found"
            description="Try a different keyword or category."
          />
        )}

        {!state.loading && !state.error && state.data.length > 0 && (
          <div className="space-y-5">
            {state.data.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
          </div>
        )}

        <Pagination page={page} pageSize={PAGE_SIZE} count={state.count} onPageChange={setPage} />
      </div>
    </div>
  );
}
