import React, { useState } from 'react';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Pin,
  Radio,
  Ticket as TicketIcon,
  Users,
  Sparkles,
  Building2,
  Trophy,
  Clock,
} from 'lucide-react';
import {
  Announcement,
  LiveUpdate,
  PageRoute,
  SchoolEvent,
  Ticket,
} from '../types';
import { CATEGORY_META } from '../lib/seedData';
import { CountdownTimer } from '../components/CountdownTimer';
import { EventBannerImage } from '../components/EventBannerImage';
import { useI18n } from '../lib/i18n';

interface HomePageProps {
  events: SchoolEvent[];
  announcements: Announcement[];
  liveUpdates: LiveUpdate[];
  tickets: Ticket[];
  onSelectEvent: (eventId: string) => void;
  onRegisterEvent: (event: SchoolEvent) => void;
  onNavigate: (page: PageRoute) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  events,
  announcements,
  liveUpdates,
  tickets,
  onSelectEvent,
  onRegisterEvent,
  onNavigate,
}) => {
  const { t, translateCategory } = useI18n();

  // Sort upcoming events chronologically so the NEXT upcoming event is always first
  const sortedUpcoming = [...events]
    .filter((ev) => new Date(ev.endDate).getTime() > Date.now())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const spotlightCandidates = sortedUpcoming.slice(0, 3);
  const [heroEventId, setHeroEventId] = useState<string | null>(null);

  const nextEvent =
    spotlightCandidates.find((e) => e.id === heroEventId) ||
    sortedUpcoming[0] ||
    events[0];

  const pinnedAnnouncements = announcements.filter((a) => a.isPinned).slice(0, 3);
  const happeningNowUpdates = liveUpdates.slice(0, 3);
  const gridEvents = sortedUpcoming.slice(0, 6);

  const totalOpenSeats = events.reduce(
    (acc, ev) => acc + Math.max(0, ev.totalSeats - ev.registeredCount),
    0
  );
  const uniqueVenues = new Set(events.map((e) => e.venue)).size;

  const houseStandings = [
    {
      name: 'Vijaya' as const,
      motto: 'Victory Through Valour',
      basePoints: 412,
      colorBar: 'bg-red-600 dark:bg-red-500',
      badge: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
    },
    {
      name: 'Parakrama' as const,
      motto: 'Wisdom & Sovereignty',
      basePoints: 398,
      colorBar: 'bg-amber-500 dark:bg-amber-400',
      badge: 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300',
    },
    {
      name: 'Gemunu' as const,
      motto: 'Courage & Unity',
      basePoints: 386,
      colorBar: 'bg-emerald-600 dark:bg-emerald-500',
      badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
    },
    {
      name: 'Ashoka' as const,
      motto: 'Perseverance & Honour',
      basePoints: 371,
      colorBar: 'bg-blue-600 dark:bg-blue-500',
      badge: 'border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-300',
    },
  ]
    .map((h) => {
      const registeredSupporters = tickets.filter((tk) => tk.houseName === h.name).length;
      return {
        ...h,
        registeredSupporters,
        totalPoints: h.basePoints + registeredSupporters * 5,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const maxHousePoints = houseStandings[0]?.totalPoints || 450;

  const formatEventDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeMinutes = (iso: string) => {
    const diffMin = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (diffMin < 60) return `${diffMin}m ago`;
    const hrs = Math.floor(diffMin / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-9 pb-12">
      {/* Pinned Announcements Strip */}
      {pinnedAnnouncements.length > 0 && (
        <section
          aria-label="Pinned school announcements"
          className="rounded-2xl bg-gradient-to-r from-[#7A1224]/10 via-[#7A1224]/6 to-amber-500/10 dark:from-[#7A1224]/25 dark:via-stone-900 dark:to-amber-500/10 border border-[#7A1224]/25 dark:border-amber-400/25 p-3.5 sm:px-5 sm:py-3.5 shadow-2xs"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-[11px] font-bold shrink-0 mt-0.5 sm:mt-0">
                <Pin className="w-3 h-3" />
                <span>{t.pinnedNotice}</span>
              </span>
              <div className="text-xs sm:text-sm text-stone-800 dark:text-stone-100 truncate">
                {pinnedAnnouncements[0].isUrgent && (
                  <span className="font-bold text-red-700 dark:text-red-400 mr-2">
                    [{t.urgent}]
                  </span>
                )}
                <span className="font-semibold">{pinnedAnnouncements[0].title}:</span>{' '}
                <span className="text-stone-600 dark:text-stone-300">
                  {pinnedAnnouncements[0].body}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('announcements')}
              className="text-xs font-semibold text-[#7A1224] dark:text-amber-300 hover:underline flex items-center gap-1 shrink-0 self-start lg:self-auto cursor-pointer"
            >
              <span>
                {t.allNotices} ({announcements.length})
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* Hero Section: NEXT Upcoming Event with Live Countdown & Spotlight Switcher */}
      {nextEvent && (
        <section
          aria-labelledby="hero-event-heading"
          className="relative rounded-3xl overflow-hidden bg-[#24050B] text-white border border-amber-400/25 shadow-2xl"
        >
          <div className="absolute inset-0">
            <EventBannerImage
              src={nextEvent.imageUrl}
              alt={nextEvent.title}
              category={nextEvent.category}
              priority={true}
              className="w-full h-full object-cover opacity-45 scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#160307] via-[#26060C]/85 to-[#2D070E]/35" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A0307]/90 via-[#26060C]/60 to-transparent" />
          </div>

          <div className="relative z-10 p-5 sm:p-10 lg:p-12 flex flex-col justify-between gap-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
              <div className="max-w-2xl space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400/15 border border-amber-400/40 text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.nextMajorEvent}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-white">
                    {translateCategory(nextEvent.category)}
                  </span>
                  <span className="text-amber-200/90 hidden sm:inline">
                    · {t.collegeLocation}
                  </span>
                </div>

                <h1
                  id="hero-event-heading"
                  className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]"
                >
                  {nextEvent.title}
                </h1>

                <p className="text-sm sm:text-base text-stone-200/95 max-w-xl leading-relaxed">
                  {nextEvent.description}
                </p>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-5 pt-1 text-xs sm:text-sm text-stone-200">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-mono tabular-nums">
                      {formatEventDate(nextEvent.startDate)}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{nextEvent.venue}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-amber-300 font-semibold">
                    <Users className="w-4 h-4 shrink-0" />
                    <span>
                      {nextEvent.registeredCount}/{nextEvent.totalSeats} {t.seatsFilled}
                    </span>
                  </span>
                </div>

                <div className="pt-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-300 mb-3">
                    <Clock
                      className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0"
                      aria-label="Live event countdown clock icon"
                    />
                    <span>{t.eventCountdown}</span>
                  </div>
                  <CountdownTimer targetDate={nextEvent.startDate} variant="hero" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => onRegisterEvent(nextEvent)}
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-amber-400/20 whitespace-nowrap cursor-pointer"
                >
                  <TicketIcon className="w-4 h-4" />
                  <span>
                    {nextEvent.registeredCount >= nextEvent.totalSeats
                      ? t.joinWaitlist
                      : t.registerForEvent}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectEvent(nextEvent.id)}
                  className="min-h-[48px] px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white border border-white/25 font-semibold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>{t.eventDetailsSchedule}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Spotlight Event Selector Strip */}
            {spotlightCandidates.length > 1 && (
              <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300/80 shrink-0">
                  Upcoming Spotlight Queue:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                  {spotlightCandidates.map((ev, idx) => {
                    const isSelected = ev.id === nextEvent.id;
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setHeroEventId(ev.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer border ${
                          isSelected
                            ? 'bg-amber-400 text-stone-950 border-amber-300'
                            : 'bg-black/40 hover:bg-black/60 text-stone-200 border-white/15'
                        }`}
                      >
                        <span className="font-mono text-[10px] opacity-75">0{idx + 1}</span>
                        <span className="max-w-[180px] truncate">{ev.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Campus Command Quick-Stats Bar */}
      <section
        aria-label="Campus overview metrics"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <button
          type="button"
          onClick={() => onNavigate('events')}
          className="text-left rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-4 hover:border-[#7A1224]/50 dark:hover:border-amber-400/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-medium">{t.navEvents}</span>
            <Calendar className="w-4 h-4 text-[#7A1224] dark:text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {events.length}
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
            {uniqueVenues} Ananda College venues
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('events')}
          className="text-left rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-4 hover:border-[#7A1224]/50 dark:hover:border-amber-400/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-medium">{t.seatsAvailable}</span>
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {totalOpenSeats.toLocaleString()}
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
            Real-time open capacity
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('live-feed')}
          className="text-left rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-4 hover:border-[#7A1224]/50 dark:hover:border-amber-400/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-medium">{t.navLiveFeed}</span>
            <Radio className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {liveUpdates.length}
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
            Live scores &amp; broadcasts
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('tickets')}
          className="text-left rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-4 hover:border-[#7A1224]/50 dark:hover:border-amber-400/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-medium">{t.navTickets}</span>
            <TicketIcon className="w-4 h-4 text-[#7A1224] dark:text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-[#7A1224] dark:text-amber-400 mt-1">
            {tickets.length}
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
            RCP QR passes issued
          </p>
        </button>
      </section>

      {/* Inter-House Shield Standings (Vijaya · Parakrama · Gemunu · Ashoka) */}
      <section
        aria-labelledby="house-standings-heading"
        className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-2xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7A1224]/10 dark:bg-amber-400/10 text-[#7A1224] dark:text-amber-400 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="house-standings-heading"
                className="font-display text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100"
              >
                Ananda College Inter-House Championship Shield
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Live combined tally across Athletics, Debate, and Cultural encounters (+5 pts per
                registered House pass)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectEvent('evt-interhouse-athletics')}
            className="text-xs font-semibold text-[#7A1224] dark:text-amber-400 hover:underline self-start sm:self-auto cursor-pointer whitespace-nowrap"
          >
            Athletics Meet Telemetry →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {houseStandings.map((house, index) => {
            const pct = Math.min(100, Math.round((house.totalPoints / maxHousePoints) * 100));
            return (
              <div
                key={house.name}
                className="rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-bold ${house.badge}`}
                  >
                    <span>#{index + 1}</span>
                    <span>{house.name} House</span>
                  </span>
                  <span className="font-mono tabular-nums text-sm font-bold text-stone-900 dark:text-stone-100">
                    {house.totalPoints} pts
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${house.colorBar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                  <span className="truncate">{house.motto}</span>
                  <span className="font-mono shrink-0 ml-2">
                    {house.registeredSupporters} passes
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Happening Now: Real-time Live Updates Preview */}
      <section aria-labelledby="happening-now-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              LIVE
            </span>
            <h2
              id="happening-now-heading"
              className="font-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100"
            >
              {t.happeningNow} · {t.liveCampusFeedTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('live-feed')}
            className="text-xs sm:text-sm font-semibold text-[#7A1224] dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>{t.openFullLiveFeed}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {happeningNowUpdates.map((item) => (
            <article
              key={item.id}
              onClick={() => onSelectEvent(item.eventId)}
              className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 border-l-4 border-l-[#7A1224] dark:border-l-amber-400 p-5 flex flex-col justify-between gap-3 hover:border-[#7A1224]/50 dark:hover:border-amber-400/50 hover:-translate-y-0.5 shadow-2xs hover:shadow-md transition-all cursor-pointer"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-[#7A1224] dark:text-amber-400">
                    {item.type}
                  </span>
                  <span className="font-mono tabular-nums text-[11px]">
                    {formatRelativeMinutes(item.timestamp)}
                  </span>
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-snug">
                  {item.headline}
                </h3>
                {item.scoreSummary && (
                  <p className="font-mono tabular-nums text-xs font-bold text-[#7A1224] dark:text-amber-300 bg-[#7A1224]/8 dark:bg-amber-400/10 border border-[#7A1224]/20 dark:border-amber-400/20 px-3 py-1.5 rounded-lg">
                    {item.scoreSummary}
                  </p>
                )}
                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                  {item.detail}
                </p>
              </div>
              <div className="pt-2.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <span className="inline-flex items-center gap-1 truncate">
                  <Building2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">{item.venue}</span>
                </span>
                <span className="font-semibold text-[#7A1224] dark:text-amber-400 shrink-0 ml-2">
                  {t.details} →
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Upcoming School Events Grid */}
      <section aria-labelledby="upcoming-events-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2
              id="upcoming-events-heading"
              className="font-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100"
            >
              {t.upcomingSchoolEvents}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
              {t.upcomingSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('events')}
            className="text-xs sm:text-sm font-semibold text-[#7A1224] dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>
              {t.browseAllEvents} ({events.length})
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gridEvents.map((event) => {
            const catMeta = CATEGORY_META[event.category];
            const fillPercent = Math.min(
              100,
              Math.round((event.registeredCount / event.totalSeats) * 100)
            );
            const isFull = event.registeredCount >= event.totalSeats;
            const isRegistered = tickets.some((t) => t.eventId === event.id);

            return (
              <article
                key={event.id}
                className="group rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 overflow-hidden flex flex-col justify-between hover:border-[#7A1224]/50 dark:hover:border-amber-400/50 hover:-translate-y-0.5 shadow-2xs hover:shadow-lg transition-all"
              >
                <div>
                  <div
                    onClick={() => onSelectEvent(event.id)}
                    className="relative h-44 overflow-hidden cursor-pointer"
                  >
                    <EventBannerImage
                      src={event.imageUrl}
                      alt={event.title}
                      category={event.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2 text-xs text-white">
                      <span className="font-mono tabular-nums font-medium truncate">
                        {formatEventDate(event.startDate)}
                      </span>
                      <CountdownTimer targetDate={event.startDate} variant="inline" />
                    </div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-semibold ${catMeta.badgeBg} ${catMeta.badgeText}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${catMeta.dotColor}`} />
                        {translateCategory(event.category)}
                      </span>

                      <span className="font-mono tabular-nums text-xs font-semibold text-stone-600 dark:text-stone-300">
                        {event.registeredCount}/{event.totalSeats} {t.seatsFilled}
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectEvent(event.id)}
                      className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#7A1224] dark:group-hover:text-amber-300 transition-colors cursor-pointer leading-snug"
                    >
                      {event.title}
                    </h3>

                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 space-y-3">
                  <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFull
                          ? 'bg-amber-500'
                          : fillPercent > 80
                          ? 'bg-amber-500'
                          : 'bg-[#7A1224] dark:bg-amber-400'
                      }`}
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectEvent(event.id)}
                        className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      >
                        {t.details}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRegisterEvent(event)}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          isFull
                            ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                            : isRegistered
                            ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                            : 'bg-[#7A1224] hover:bg-[#600E1C] text-amber-200 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-stone-950'
                        }`}
                      >
                        {isFull ? t.waitlist : t.register}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
