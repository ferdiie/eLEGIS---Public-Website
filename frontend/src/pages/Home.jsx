import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ScrollText, ArrowRight, Landmark, Newspaper, Pin } from "lucide-react";
import { api } from "../api/client";
import Loading from "../components/Loading";
import { EmptyState, ErrorState } from "../components/EmptyState";

const FEATURES = [
  {
    icon: ScrollText,
    title: "Published Ordinances",
    description: "Browse enacted municipal laws, searchable by keyword, year, category, and author.",
  },
  {
    icon: Newspaper,
    title: "Feed",
    description: "Stay updated with announcements, activities, and session schedules from the Sangguniang Bayan.",
  },
  {
    icon: Landmark,
    title: "Know Your Council",
    description: "See current and past councilors, their positions, and the records they've authored.",
  },
];

function formatPostDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const CATEGORY_STYLE = {
  announcement: "bg-harbor-100 text-harbor-700",
  activity: "bg-forest-100 text-forest-700",
};

// A single content_posts card for the "Featured Feed" bento grid — a full
// clickable tile (image + gradient + overlaid text) rather than the plain
// list-row card style used elsewhere, to match the bento layout's density.
function FeaturedCard({ post, large = false }) {
  const cover = post.images?.[0];

  return (
    <Link
      to="/feed"
      className={`group relative block h-full min-h-[170px] overflow-hidden rounded-2xl bg-forest-800 ${
        large ? "min-h-[280px]" : ""
      }`}
    >
      {cover ? (
        <img
          src={cover.url}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-forest-500">
          <Newspaper className={large ? "h-14 w-14" : "h-8 w-8"} />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      <span className={`badge absolute left-3 top-3 capitalize ${CATEGORY_STYLE[post.category] || CATEGORY_STYLE.activity}`}>
        {post.category}
      </span>
      {post.pinned && (
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <Pin className="h-3 w-3" /> Pinned
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-xs text-white/70">{formatPostDate(post.created_at)}</p>
        <h3 className={`mt-1 font-display font-semibold text-white ${large ? "text-xl" : "text-sm"}`}>{post.title}</h3>
        {large && post.body && <p className="mt-2 line-clamp-2 text-sm text-white/80">{post.body}</p>}
      </div>
    </Link>
  );
}

export default function Home() {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [feed, stats] = await Promise.all([
          api.home.feed({ page: 1, pageSize: 4, sort: "newest", category: "posts" }),
          api.home.stats(),
        ]);
        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            data: {
              feed: feed.data || [],
              stats: stats.data || null,
            },
          });
        }
      } catch (err) {
        if (!cancelled) setState({ loading: false, error: err.message, data: null });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-seal-hero text-center text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="whitespace-nowrap text-[11px] font-medium uppercase tracking-wide text-forest-100 sm:text-sm sm:tracking-widest">
            Sangguniang Bayan ng Balilihan, Bohol
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Know Your <span className="text-amber-300">Laws.</span>
            <br />
            Shape Your <span className="text-amber-300">Town.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-forest-50/90">
            Browse officially published ordinances, resolutions, session minutes, and councilor
            records for the Municipality of Balilihan, Bohol.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/legislative/ordinances" className="btn-primary bg-white text-forest-700 hover:bg-forest-50">
              <ScrollText className="h-4 w-4" /> Browse Legislative
            </Link>
            <Link
              to="/council/current"
              className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <Landmark className="h-4 w-4" /> Browse Council
            </Link>
          </div>

          <div className="mx-auto mt-10 flex max-w-md justify-center gap-8 sm:gap-14">
            <div>
              <p className="font-display text-3xl font-extrabold sm:text-4xl">
                {state.data?.stats ? state.data.stats.ordinances : "—"}
              </p>
              <p className="mt-1 text-xs text-forest-100 sm:text-sm">Ordinances</p>
            </div>
            <div>
              <p className="font-display text-3xl font-extrabold sm:text-4xl">
                {state.data?.stats ? state.data.stats.resolutions : "—"}
              </p>
              <p className="mt-1 text-xs text-forest-100 sm:text-sm">Resolutions</p>
            </div>
            <div>
              <p className="font-display text-3xl font-extrabold sm:text-4xl">
                {state.data?.stats ? state.data.stats.sessionMinutes : "—"}
              </p>
              <p className="mt-1 text-xs text-forest-100 sm:text-sm">Session Minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
          Everything You Need to Stay <span className="text-forest-600">Informed</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          We bring the Sangguniang Bayan's legislative records into one accessible portal.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card p-6">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Feed */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Latest from the <span className="text-forest-600">Feed</span>
            </h2>
            <p className="mt-2 text-muted">
              Recent announcements and activities from the Sangguniang Bayan office.
            </p>
          </div>
          <Link to="/feed" className="flex items-center gap-1 text-sm font-semibold text-forest-700 hover:underline">
            View All Feed <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {state.loading && <Loading label="Loading the feed" />}
        {state.error && <ErrorState message={state.error} />}

        {state.data && state.data.feed.length === 0 && (
          <div className="mt-8">
            <EmptyState title="No posts yet" description="Check back soon for announcements and activities." />
          </div>
        )}

        {state.data && state.data.feed.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <FeaturedCard post={state.data.feed[0]} large />
            {state.data.feed.length > 1 && (
              <div className="flex flex-col gap-5">
                <FeaturedCard post={state.data.feed[1]} />
                {(state.data.feed[2] || state.data.feed[3]) && (
                  <div className="grid grid-cols-2 gap-5">
                    {state.data.feed[2] && <FeaturedCard post={state.data.feed[2]} />}
                    {state.data.feed[3] && <FeaturedCard post={state.data.feed[3]} />}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
