import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Download,
  ExternalLink,
  MapPin,
  Clock,
} from 'lucide-react';
import { SchoolEvent } from '../types';
import { CATEGORY_META } from '../lib/seedData';
import { downloadEventICS, getGoogleCalendarUrl } from '../lib/calendarUtils';
import { useI18n } from '../lib/i18n';

interface CalendarPageProps {
  events: SchoolEvent[];
  onSelectEvent: (eventId: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ events, onSelectEvent }) => {
  const { t } = useI18n();
  const today = new Date();
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDayIso, setSelectedDayIso] = useState<string>(() => {
    // Default selected date to the earliest upcoming event date so the user immediately sees events
    const sorted = [...events].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    const first = sorted[0] ? new Date(sorted[0].startDate) : today;
    return `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}-${String(
      first.getDate()
    ).padStart(2, '0')}`;
  });

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const toDayKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;

  // Map day keys (YYYY-MM-DD) to events occurring on that day
  const eventsByDay: Record<string, SchoolEvent[]> = {};
  events.forEach((ev) => {
    const key = toDayKey(new Date(ev.startDate));
    if (!eventsByDay[key]) eventsByDay[key] = [];
    eventsByDay[key].push(ev);
  });

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleJumpToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDayIso(toDayKey(now));
  };

  const selectedDayEvents = eventsByDay[selectedDayIso] || [];
  const sortedAgendaEvents = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const monthTitle = currentMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            {t.calendarTitle}
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            {t.calendarSubtitle}
          </p>
        </div>

        <div className="inline-flex rounded-xl p-1 bg-stone-200/70 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'month'
                ? 'bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{t.monthGrid}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('agenda')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'agenda'
                ? 'bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>{t.agendaView}</span>
          </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Interactive Month Grid */}
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                {monthTitle}
              </h2>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleJumpToday}
                  className="min-h-[36px] px-3 py-1 rounded-lg border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  {t.today}
                </button>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="min-h-[36px] min-w-[36px] rounded-lg border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="min-h-[36px] min-w-[36px] rounded-lg border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-16 sm:h-24 rounded-xl bg-stone-50/50 dark:bg-stone-950/30" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNumber = idx + 1;
                const cellDate = new Date(year, month, dayNumber);
                const key = toDayKey(cellDate);
                const dayEvts = eventsByDay[key] || [];
                const isSelected = selectedDayIso === key;
                const isToday = toDayKey(today) === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDayIso(key)}
                    aria-label={`${cellDate.toDateString()}, ${dayEvts.length} events`}
                    className={`h-16 sm:h-24 p-2 rounded-xl border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#7A1224] dark:border-amber-400 bg-[#7A1224]/8 dark:bg-amber-400/10'
                        : 'border-stone-200/70 dark:border-stone-800 hover:border-[#7A1224]/40 bg-white dark:bg-stone-900'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`font-mono tabular-nums text-xs sm:text-sm font-bold ${
                          isToday
                            ? 'px-1.5 py-0.5 rounded-md bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950'
                            : 'text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        {dayNumber}
                      </span>
                      {dayEvts.length > 0 && (
                        <span className="font-mono tabular-nums text-[10px] font-semibold text-[#7A1224] dark:text-amber-300">
                          {dayEvts.length}
                        </span>
                      )}
                    </div>

                    {/* Colored Event Dots & Mini Title */}
                    <div className="space-y-1 w-full overflow-hidden">
                      <div className="flex items-center gap-1 flex-wrap">
                        {dayEvts.map((ev) => (
                          <span
                            key={ev.id}
                            title={`${ev.title} (${ev.category})`}
                            className={`w-2 h-2 rounded-full ${CATEGORY_META[ev.category].dotColor}`}
                          />
                        ))}
                      </div>
                      {dayEvts[0] && (
                        <p className="hidden sm:block text-[10px] font-medium text-stone-700 dark:text-stone-300 truncate">
                          {dayEvts[0].title}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Inspector Panel */}
          <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
              <p className="text-xs font-semibold text-[#7A1224] dark:text-amber-400">
                Selected Date Schedule
              </p>
              <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                {new Date(`${selectedDayIso}T12:00:00`).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                  No events scheduled on this date
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Select any date highlighted with colored category dots on the calendar grid, or
                  switch to Agenda View to see all 10 upcoming events.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayEvents.map((ev) => {
                  const catMeta = CATEGORY_META[ev.category];
                  return (
                    <div
                      key={ev.id}
                      className="rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-3 bg-stone-50/60 dark:bg-stone-950/50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${catMeta.badgeBg} ${catMeta.badgeText}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${catMeta.dotColor}`} />
                          {ev.category}
                        </span>
                        <span className="font-mono tabular-nums text-xs text-stone-500">
                          {new Date(ev.startDate).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <h4
                        onClick={() => onSelectEvent(ev.id)}
                        className="font-display text-base font-bold text-stone-900 dark:text-stone-100 hover:text-[#7A1224] dark:hover:text-amber-300 cursor-pointer"
                      >
                        {ev.title}
                      </h4>

                      <div className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400 shrink-0" />
                        <span>{ev.venue}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <a
                          href={getGoogleCalendarUrl(ev)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[38px] px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-[#7A1224]/40 flex items-center justify-center gap-1 whitespace-nowrap"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Add to Google</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => downloadEventICS(ev)}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-[#7A1224]/40 flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download .ics</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Agenda List View */
        <div className="space-y-3">
          {sortedAgendaEvents.map((ev) => {
            const catMeta = CATEGORY_META[ev.category];
            const start = new Date(ev.startDate);
            return (
              <article
                key={ev.id}
                className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#7A1224]/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 rounded-xl bg-stone-100 dark:bg-stone-800 p-2.5 text-center shrink-0">
                    <div className="text-[11px] font-bold uppercase text-[#7A1224] dark:text-amber-400">
                      {start.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div className="font-mono tabular-nums text-2xl font-bold text-stone-900 dark:text-stone-100">
                      {String(start.getDate()).padStart(2, '0')}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-semibold ${catMeta.badgeBg} ${catMeta.badgeText}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${catMeta.dotColor}`} />
                        {ev.category}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums text-xs text-stone-500 dark:text-stone-400">
                        <Clock className="w-3.5 h-3.5" />
                        {start.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectEvent(ev.id)}
                      className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 hover:text-[#7A1224] dark:hover:text-amber-300 cursor-pointer"
                    >
                      {ev.title}
                    </h3>

                    <p className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400" />
                      <span>{ev.venue}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <a
                    href={getGoogleCalendarUrl(ev)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[40px] px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Add to Google Calendar</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => downloadEventICS(ev)}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .ics</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
