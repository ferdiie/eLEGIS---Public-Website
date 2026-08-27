import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lightbulb, CalendarClock, Megaphone, ScrollText, Gavel, BookOpen, ArrowRight } from "lucide-react";
import { api } from "../api/client";
import Loading from "../components/Loading";
import { EmptyState, ErrorState } from "../components/EmptyState";

const PRIORITY_STYLE = {
  urgent: "bg-red-50 text-red-700",
  high: "bg-amber-50 text-amber-700",
  normal: "bg-forest-50 text-forest-700",
  low: "bg-gray-100 text-gray-600",
};

function formatEventDate(ev) {
  if (!ev.start_date) return "";
  const date = new Date(`${ev.start_date}T00:00:00`);
  const label = date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  if (ev.all_day) return label;
  return ev.start_time ? `${label} · ${ev.start_time.slice(0, 5)}` : label;
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
              <div className="card overflow-hidden">
                <div className="flex items-center gap-2 bg-forest-600 px-5 py-3 text-white">
                  <CalendarClock className="h-4 w-4" />
                  <span className="font-medium">Upcoming Events &amp; Activities</span>
                </div>
                <div className="divide-y divide-forest-50">
                  {state.data.activities.length === 0 ? (
                    <div className="p-5">
                      <EmptyState title="No activities posted right now" />
                    </div>
                  ) : (
                    state.data.activities.map((a) => (
                      <div key={a.id} className="px-5 py-4">
                        <h3 className="font-semibold text-ink">{a.title}</h3>
                        <p className="mt-1 whitespace-pre-line text-sm text-muted">{a.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Announcements */}
              <div className="card overflow-hidden">
                <div className="flex items-center gap-2 bg-harbor-700 px-5 py-3 text-white">
                  <Megaphone className="h-4 w-4" />
                  <span className="font-medium">Announcements</span>
                </div>
                <div className="divide-y divide-forest-50">
                  {state.data.announcements.length === 0 ? (
                    <div className="p-5">
                      <EmptyState title="No announcements posted right now" />
                    </div>
                  ) : (
                    state.data.announcements.map((a) => (
                      <div key={a.id} className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`badge ${PRIORITY_STYLE[a.priority] || PRIORITY_STYLE.normal}`}>
                            {a.priority}
                          </span>
                          <h3 className="font-semibold text-ink">{a.title}</h3>
                        </div>
                        <p className="mt-1 whitespace-pre-line text-sm text-muted">{a.body}</p>
                      </div>
                    ))
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
