import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  MapPin,
  Ticket as TicketIcon,
  Users,
  Building2,
  Radio,
  Share2,
  Check,
} from 'lucide-react';
import { LiveUpdate, SchoolEvent, Ticket } from '../types';
import { CATEGORY_META } from '../lib/seedData';
import { CountdownTimer } from '../components/CountdownTimer';
import { EventBannerImage } from '../components/EventBannerImage';
import { downloadEventICS, getGoogleCalendarUrl } from '../lib/calendarUtils';
import { useI18n } from '../lib/i18n';

interface EventDetailPageProps {
  event: SchoolEvent;
  tickets: Ticket[];
  liveUpdates: LiveUpdate[];
  onBack: () => void;
  onRegister: (event: SchoolEvent) => void;
  onNavigateTickets: () => void;
  onShareToast?: (msg: string) => void;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  event,
  tickets,
  liveUpdates,
  onBack,
  onRegister,
  onNavigateTickets,
  onShareToast,
}) => {
  const { t, translateCategory } = useI18n();
  const [copiedFallback, setCopiedFallback] = useState(false);
  const catMeta = CATEGORY_META[event.category];
  const seatsLeft = Math.max(0, event.totalSeats - event.registeredCount);
  const isFull = seatsLeft === 0;
  const waitlistCount = tickets.filter(
    (t) => t.eventId === event.id && t.status === 'Waitlisted'
  ).length;
  const fillPercent = Math.min(
    100,
    Math.round((event.registeredCount / event.totalSeats) * 100)
  );
  const existingTicket = tickets.find((t) => t.eventId === event.id);
  const eventLiveUpdates = liveUpdates
    .filter((u) => u.eventId === event.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const formatFullDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatTimeRange = (startIso: string, endIso: string) => {
    const s = new Date(startIso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const e = new Date(endIso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${s} – ${e}`;
  };

  const handleShareEvent = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#event-detail?event=${encodeURIComponent(
      event.id
    )}`;
    const shareData: ShareData = {
      title: `${event.title} — AC Synapse`,
      text: `${event.title} (${event.subtitle}) at ${event.venue}, Ananda College`,
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        if (onShareToast) {
          onShareToast(`Shared "${event.title}"`);
        }
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        // Fall through to clipboard fallback if blocked by iframe permissions
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareData.title}\n${shareUrl}`);
      setCopiedFallback(true);
      window.setTimeout(() => setCopiedFallback(false), 2500);
      if (onShareToast) {
        onShareToast('Event title & link copied to clipboard for sharing!');
      }
    } catch {
      if (onShareToast) {
        onShareToast(`Share link: ${shareUrl}`);
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Bar: Back Navigation & Native Share Button */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[40px] inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-[#7A1224] dark:hover:text-amber-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToEvents}</span>
        </button>

        <button
          type="button"
          onClick={handleShareEvent}
          aria-label={`Share ${event.title}`}
          className="min-h-[40px] px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-[#7A1224]/40 dark:hover:border-amber-400/40 text-xs font-semibold text-stone-800 dark:text-stone-200 inline-flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          {copiedFallback ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Copied Link</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400" />
              <span>{t.shareEvent}</span>
            </>
          )}
        </button>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#2D070E] border border-stone-200 dark:border-stone-800">
        <div className="h-64 sm:h-80 lg:h-96 relative">
          <EventBannerImage
            src={event.imageUrl}
            alt={event.title}
            category={event.category}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-semibold bg-black/50 backdrop-blur-xs text-amber-300 border-amber-400/40`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${catMeta.dotColor}`} />
                {translateCategory(event.category)}
              </span>
              <span className="text-xs text-stone-200 font-mono tabular-nums">
                {event.registeredCount}/{event.totalSeats} {t.seatsFilled} ({seatsLeft} {t.seatsLeft})
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-bold text-white leading-tight">
              {event.title}
            </h1>
            <p className="text-sm sm:text-base text-amber-200/90 font-medium">
              {event.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Live Updates, Description & Schedule Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {eventLiveUpdates.length > 0 && (
            <section
              aria-label="Live event updates"
              className="rounded-2xl bg-white dark:bg-stone-900 border border-[#7A1224]/30 dark:border-amber-400/30 p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </span>
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                    {t.liveVenueUpdates}
                  </h2>
                </div>
                <span className="font-mono tabular-nums text-xs text-stone-500">
                  {eventLiveUpdates.length} broadcast{eventLiveUpdates.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="space-y-3">
                {eventLiveUpdates.map((lu) => (
                  <motion.div
                    key={lu.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-600/15 text-red-700 dark:text-red-300 font-bold text-[10px] uppercase">
                          <Radio className="w-3 h-3" />
                          <span>LIVE · {lu.type}</span>
                        </span>
                      </div>
                      <span className="font-mono tabular-nums text-stone-500">
                        {new Date(lu.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                      {lu.headline}
                    </h3>
                    {lu.scoreSummary && (
                      <div className="font-mono tabular-nums text-xs font-bold text-[#7A1224] dark:text-amber-300 bg-white dark:bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-200/70 dark:border-stone-800">
                        {lu.scoreSummary}
                      </div>
                    )}
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                      {lu.detail}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
              About This Event
            </h2>
            <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed">
              {event.description}
            </p>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-[#7A1224] dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100">
                    Organizing Body
                  </div>
                  <div className="text-stone-600 dark:text-stone-400">{event.organizer}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#7A1224] dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100">
                    Campus Venue
                  </div>
                  <div className="text-stone-600 dark:text-stone-400">
                    {event.venue}, Ananda College
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Schedule Timeline */}
          <section className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                Official Programme & Timeline
              </h2>
              <span className="font-mono tabular-nums text-xs text-stone-500 dark:text-stone-400">
                {event.schedule.length} Sessions
              </span>
            </div>

            <ol className="relative border-l-2 border-[#7A1224]/30 dark:border-amber-400/30 ml-3 space-y-6">
              {event.schedule.map((item, idx) => (
                <li key={item.id} className="ml-6">
                  <span className="absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full bg-[#7A1224] dark:bg-amber-400 ring-4 ring-white dark:ring-stone-900" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-mono tabular-nums text-xs font-bold text-[#7A1224] dark:text-amber-400">
                      {item.time}
                    </span>
                    {item.locationNote && (
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        {item.locationNote}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                    0{idx + 1}. {item.title}
                  </h3>
                  {item.speakerOrLead && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                      Led by: {item.speakerOrLead}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Right Column: Countdown, Capacity & Registration Card */}
        <aside className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 space-y-6 lg:sticky lg:top-20">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#7A1224] dark:text-amber-400 mb-2.5">
              <Clock
                className="w-4 h-4 sm:w-5 sm:h-5 text-[#7A1224] dark:text-amber-400 shrink-0"
                aria-label="Time remaining countdown clock icon"
              />
              <span>Time Remaining Until Start</span>
            </div>
            <CountdownTimer targetDate={event.startDate} variant="detail" />
          </div>

          <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-800 text-xs sm:text-sm">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-[#7A1224] dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-stone-900 dark:text-stone-100">Date</div>
                <div className="text-stone-600 dark:text-stone-400">
                  {formatFullDate(event.startDate)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock
                className="w-5 h-5 text-[#7A1224] dark:text-amber-400 shrink-0 mt-0.5"
                aria-label="Event hours clock icon"
              />
              <div>
                <div className="font-semibold text-stone-900 dark:text-stone-100">Hours</div>
                <div className="font-mono tabular-nums text-sm sm:text-base font-bold text-stone-700 dark:text-stone-200">
                  {formatTimeRange(event.startDate, event.endDate)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-[#7A1224] dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900 dark:text-stone-100">
                    Seating Capacity
                  </span>
                  <span className="font-mono tabular-nums font-bold text-[#7A1224] dark:text-amber-400">
                    {isFull ? `Full (${waitlistCount} waitlisted)` : `${seatsLeft} seats left`}
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${
                      isFull ? 'bg-amber-500' : 'bg-[#7A1224] dark:bg-amber-400'
                    }`}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
                <div className="font-mono tabular-nums text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  {event.registeredCount}/{event.totalSeats} seats reserved ({fillPercent}%)
                </div>
              </div>
            </div>
          </div>

          {/* Primary Registration / Waitlist CTA */}
          <div className="space-y-2.5 pt-2">
            {existingTicket && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2">
                <span>
                  Pass <strong>{existingTicket.ticketCode}</strong> ({existingTicket.status})
                </span>
                <button
                  type="button"
                  onClick={onNavigateTickets}
                  className="font-bold underline cursor-pointer shrink-0"
                >
                  View QR
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => onRegister(event)}
              className={`w-full min-h-[48px] py-3 px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isFull
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                  : 'bg-[#7A1224] hover:bg-[#600E1C] text-amber-200 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-stone-950'
              }`}
            >
              <TicketIcon className="w-4 h-4" />
              <span>{isFull ? 'Join Waitlist' : 'Register for Event Pass'}</span>
            </button>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <a
                href={getGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[40px] px-2.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span>Google Cal</span>
              </a>
              <button
                type="button"
                onClick={() => downloadEventICS(event)}
                className="min-h-[40px] px-2.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>.ics File</span>
              </button>
              <button
                type="button"
                onClick={handleShareEvent}
                className="min-h-[40px] px-2.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
              >
                {copiedFallback ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400 shrink-0" />
                )}
                <span className="truncate">{copiedFallback ? 'Copied' : t.shareEvent}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
