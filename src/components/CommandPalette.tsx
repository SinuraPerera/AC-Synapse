import React, { useEffect, useState } from 'react';
import {
  Search,
  Calendar,
  Compass,
  Megaphone,
  Radio,
  Ticket as TicketIcon,
  Moon,
  Sun,
  ArrowRight,
  X,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { Announcement, LiveUpdate, PageRoute, SchoolEvent } from '../types';
import { LANGUAGES, LanguageCode, useI18n } from '../lib/i18n';
import { useFocusTrap } from '../lib/useFocusTrap';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  events: SchoolEvent[];
  announcements: Announcement[];
  liveUpdates: LiveUpdate[];
  onSelectEvent: (eventId: string) => void;
  onNavigate: (page: PageRoute) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  events,
  announcements,
  liveUpdates,
  onSelectEvent,
  onNavigate,
  darkMode,
  onToggleDarkMode,
}) => {
  const { lang, setLang, t } = useI18n();
  const [query, setQuery] = useState('');
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedEvents = events
    .filter(
      (e) =>
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q)
    )
    .slice(0, 4);

  const matchedAnnouncements = announcements
    .filter(
      (a) =>
        q &&
        (a.title.toLowerCase().includes(q) ||
          a.body.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q))
    )
    .slice(0, 3);

  const matchedUpdates = liveUpdates
    .filter(
      (u) =>
        q &&
        (u.headline.toLowerCase().includes(q) ||
          u.eventTitle.toLowerCase().includes(q) ||
          u.venue.toLowerCase().includes(q))
    )
    .slice(0, 3);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AC Synapse Command Search"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs pt-14 sm:pt-24 px-3 pb-4"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden focus:outline-none"
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200 dark:border-stone-800">
          <Search
            className="w-4 h-4 text-[#7A1224] dark:text-amber-400 shrink-0"
            aria-label="Search command icon"
          />
          <input
            data-autofocus="true"
            type="search"
            aria-label="Search events, venues, notices, or commands"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, venues (Kularatne, Olcott Hall), notices, or jump to page..."
            className="w-full bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-mono text-stone-500">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]"
          >
            <X className="w-4 h-4" aria-label="Close icon" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4">
          {/* Matched Events */}
          {matchedEvents.length > 0 && (
            <div className="space-y-1.5">
              <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {t.navEvents}
              </p>
              {matchedEvents.map((ev) => {
                const seatsLeft = Math.max(0, ev.totalSeats - ev.registeredCount);
                return (
                  <button
                    key={ev.id}
                    type="button"
                    aria-label={`View event: ${ev.title}`}
                    onClick={() => {
                      onSelectEvent(ev.id);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/80 flex items-center justify-between gap-3 transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7A1224]"
                  >
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-[#7A1224] dark:group-hover:text-amber-300 truncate">
                        {ev.title}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" aria-label="Venue location icon" />
                          {ev.venue}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">
                          {seatsLeft === 0 ? 'Waitlist' : `${seatsLeft} seats left`}
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      className="w-4 h-4 text-stone-400 group-hover:text-[#7A1224] dark:group-hover:text-amber-400 shrink-0"
                      aria-label="Open event details icon"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Matched Announcements */}
          {matchedAnnouncements.length > 0 && (
            <div className="space-y-1.5">
              <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {t.navAnnouncements}
              </p>
              {matchedAnnouncements.map((ann) => (
                <button
                  key={ann.id}
                  type="button"
                  aria-label={`View announcement: ${ann.title}`}
                  onClick={() => {
                    onNavigate('announcements');
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/80 flex items-center justify-between gap-3 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7A1224]"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {ann.title}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      {ann.body}
                    </div>
                  </div>
                  <Megaphone
                    className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400 shrink-0"
                    aria-label="Announcement icon"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Matched Live Updates */}
          {matchedUpdates.length > 0 && (
            <div className="space-y-1.5">
              <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {t.navLiveFeed}
              </p>
              {matchedUpdates.map((lu) => (
                <button
                  key={lu.id}
                  type="button"
                  aria-label={`View live update: ${lu.headline}`}
                  onClick={() => {
                    onSelectEvent(lu.eventId);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/80 flex items-center justify-between gap-3 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7A1224]"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {lu.headline}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      {lu.venue} · {lu.scoreSummary || lu.type}
                    </div>
                  </div>
                  <Radio
                    className="w-3.5 h-3.5 text-red-600 shrink-0"
                    aria-label="Live broadcast icon"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Quick Navigation & System Actions */}
          <div className="space-y-1.5 pt-1 border-t border-stone-100 dark:border-stone-800">
            <p className="px-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Quick Command Actions
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <button
                type="button"
                aria-label={t.browseAllEvents}
                onClick={() => {
                  onNavigate('events');
                  onClose();
                }}
                className="px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7A1224]"
              >
                <Compass
                  className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400"
                  aria-label="Events compass icon"
                />
                <span>{t.browseAllEvents}</span>
              </button>

              <button
                type="button"
                aria-label={t.navCalendar}
                onClick={() => {
                  onNavigate('calendar');
                  onClose();
                }}
                className="px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7A1224]"
              >
                <Calendar
                  className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400"
                  aria-label="Calendar icon"
                />
                <span>{t.navCalendar}</span>
              </button>

              <button
                type="button"
                aria-label={t.navTickets}
                onClick={() => {
                  onNavigate('tickets');
                  onClose();
                }}
                className="px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7A1224]"
              >
                <TicketIcon
                  className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400"
                  aria-label="Tickets icon"
                />
                <span>{t.navTickets}</span>
              </button>

              <button
                type="button"
                aria-label={`${t.navSignIn} or Demo Admin`}
                onClick={() => {
                  onNavigate('login');
                  onClose();
                }}
                className="px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7A1224]"
              >
                <ShieldCheck
                  className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400"
                  aria-label="Admin shield icon"
                />
                <span>{t.navSignIn} / Demo Admin</span>
              </button>

              <button
                type="button"
                aria-label={`Toggle ${darkMode ? 'Light' : 'Dark'} Mode`}
                onClick={() => {
                  onToggleDarkMode();
                  onClose();
                }}
                className="px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7A1224]"
              >
                {darkMode ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" aria-label="Sun icon" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-[#7A1224]" aria-label="Moon icon" />
                )}
                <span>Toggle {darkMode ? 'Light' : 'Dark'} Mode</span>
              </button>

              <div className="px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-950 flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">Language:</span>
                <div className="flex items-center gap-1" role="group" aria-label="Language options">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      aria-label={`Switch language to ${l.nativeName}`}
                      aria-pressed={lang === l.code}
                      onClick={() => setLang(l.code as LanguageCode)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                        lang === l.code
                          ? 'bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950'
                          : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {l.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
