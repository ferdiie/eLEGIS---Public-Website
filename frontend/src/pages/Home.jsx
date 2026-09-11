import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lightbulb, CalendarClock, Megaphone, ScrollText, Gavel, BookOpen, ArrowRight } from "lucide-react";
import { api } from "../api/client";
import Loading from "../components/Loading";
import { EmptyState, ErrorState } from "../components/EmptyState";

function formatEventDate(ev) {
  if (!ev.event_date) return "";
  const date = new Date(`${ev.event_date}T00:00:00`);
  const label = date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return ev.event_time ? `${label} · ${ev.event_time.slice(0, 5)}` : label;
}

function formatPostDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function Avatar({ author }) {
  if (author?.photo) {
    return <img src={author.photo} alt="" className="h-6 w-6 flex-shrink-0 rounded-full object-cover" />;
  }
  const initial = author?.name?.trim()?.[0]?.toUpperCase() || "?";
  return (
    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-forest-100 text-[11px] font-semibold text-forest-700">
      {initial}
    </span>
  );
}

// Shared feed card for a content_posts row (used by both Announcements and
// Activities — same underlying table/shape, just filtered by category).
function ContentPostItem({ post }) {
  const images = post.images || [];
  const [cover, ...rest] = images;
  const extra = rest.slice(0, 3);
  const overflow = images.length - 1 - extra.length;

  return (
    <article className="card card-interactive overflow-hidden">
      {cover && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-forest-50">
          <img src={cover.url} alt="" className="h-full w-full object-cover" loading="lazy" />
          {post.pinned && (
            <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              Pinned
            </span>
          )}
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2">
          {!cover && post.pinned && <span className="badge bg-amber-50 text-amber-700">Pinned</span>}
          <h3 className="font-semibold text-ink">{post.title}</h3>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted">
          <Avatar author={post.author} />
          {post.author?.name && <span>{post.author.name}</span>}
          {post.author?.name && post.created_at && <span aria-hidden="true">·</span>}
          <span>{formatPostDate(post.created_at)}</span>
        </div>
        <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-muted">{post.body}</p>
        {extra.length > 0 && (
          <div className="mt-3 flex gap-2">
            {extra.map((img, i) => (
              <div key={img.path || i} className="relative h-14 w-14 overflow-hidden rounded-lg border border-forest-100">
                <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                {i === extra.length - 1 && overflow > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white">
                    +{overflow}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Home() {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [announcements, activities, trivia, schedules] = await Promise.all([
          api.home.announcements(),
          api.home.activities(),
          api.home.trivia(),
          api.home.schedules(),
        ]);
        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            data: {
              announcements: announcements.data || [],
              activities: activities.data || [],
              trivia: trivia.data,
              schedules: schedules.data || [],
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
      <section className="relative overflow-hidden bg-seal-hero text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-sm font-medium uppercase tracking-widest text-forest-100">
            Official Legislative Information Portal
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold sm:text-5xl">
            Sangguniang Bayan ng Balilihan
          </h1>
          <p className="mt-4 max-w-xl text-forest-50/90">
            Browse officially published ordinances, resolutions, session minutes, and councilor
            records for the Municipality of Balilihan, Bohol.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/legislative/ordinances" className="btn-primary bg-white text-forest-700 hover:bg-forest-50">
              <ScrollText className="h-4 w-4" /> Browse Ordinances
            </Link>
            <Link
              to="/legislative/resolutions"
              className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <Gavel className="h-4 w-4" /> Browse Resolutions
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {state.loading && <Loading label="Loading the latest updates" />}
        {state.error && <ErrorState message={state.error} />}

        {state.data && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {/* Trivia */}
              {state.data.trivia && (
                <div className="card overflow-hidden">
                  <div className="flex items-center gap-2 bg-forest-600 px-5 py-3 text-white">
                    <Lightbulb className="h-4 w-4" />
                    <span className="font-medium">Did you know?</span>
                  </div>
                  <p className="px-5 py-4 text-sm leading-relaxed text-ink">
                    {state.data.trivia.fact_text}
                  </p>
                </div>
              )}

              {/* Activities / Happenings */}
              <div className="overflow-hidden rounded-2xl border border-forest-100/70 shadow-card">
                <div className="flex items-center gap-2 bg-forest-600 px-5 py-3 text-white">
                  <CalendarClock className="h-4 w-4" />
                  <span className="font-medium">Events &amp; Activities</span>
                </div>
                <div className="bg-forest-50/50 p-3 sm:p-4">
                  {state.data.activities.length === 0 ? (
                    <EmptyState title="No activities posted right now" />
                  ) : (
                    <div className="space-y-3">
                      {state.data.activities.map((a) => <ContentPostItem key={a.id} post={a} />)}
                    </div>
                  )}
                </div>
              </div>

              {/* Announcements */}
              <div className="overflow-hidden rounded-2xl border border-forest-100/70 shadow-card">
                <div className="flex items-center gap-2 bg-harbor-700 px-5 py-3 text-white">
                  <Megaphone className="h-4 w-4" />
                  <span className="font-medium">Announcements</span>
                </div>
                <div className="bg-harbor-50/40 p-3 sm:p-4">
                  {state.data.announcements.length === 0 ? (
                    <EmptyState title="No announcements posted right now" />
                  ) : (
                    <div className="space-y-3">
                      {state.data.announcements.map((a) => <ContentPostItem key={a.id} post={a} />)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar: Schedules + quick links */}
            <div className="space-y-6">
              <div className="card overflow-hidden">
                <div className="flex items-center gap-2 bg-forest-900 px-5 py-3 text-white">
                  <CalendarClock className="h-4 w-4" />
                  <span className="font-medium">Public Schedule</span>
                </div>
                <div className="divide-y divide-forest-50">
                  {state.data.schedules.length === 0 ? (
                    <div className="p-5">
                      <EmptyState title="No upcoming public events" />
                    </div>
                  ) : (
                    state.data.schedules.map((ev) => (
                      <div key={ev.id} className="px-5 py-3">
                        <p className="text-sm font-medium text-ink">{ev.title}</p>
                        <p className="text-xs text-muted">{formatEventDate(ev)}</p>
                        {ev.location && <p className="text-xs text-muted">{ev.location}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-display font-semibold text-ink">Quick Access</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <Link to="/legislative/session-minutes" className="flex items-center gap-2 text-forest-700 hover:underline">
                    <BookOpen className="h-4 w-4" /> Session Minutes <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link to="/council/current" className="flex items-center gap-2 text-forest-700 hover:underline">
                    <ScrollText className="h-4 w-4" /> Current Council <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
