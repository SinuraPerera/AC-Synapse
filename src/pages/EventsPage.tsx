import React, { useEffect, useState } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Ticket as TicketIcon,
  Bookmark,
  ArrowUpDown,
} from 'lucide-react';
import { EventCategory, SchoolEvent, Ticket, UserRole } from '../types';
import { CATEGORY_META } from '../lib/seedData';
import { EventBannerImage } from '../components/EventBannerImage';
import { useI18n } from '../lib/i18n';

interface EventsPageProps {
  events: SchoolEvent[];
  tickets: Ticket[];
  role: UserRole;
  onSelectEvent: (eventId: string) => void;
  onRegisterEvent: (event: SchoolEvent) => void;
  onOpenAdminCreateEvent: () => void;
  onNavigateTickets: () => void;
}

const ALL_CATEGORIES: ('All' | EventCategory)[] = [
  'All',
  'Sports',
  'Debate',
  'Exhibition',
  'Academic',
  'Cultural',
  "Parents' Meeting",
];

export const EventsPage: React.FC<EventsPageProps> = ({
  events,
  tickets,
  role,
  onSelectEvent,
  onRegisterEvent,
  onOpenAdminCreateEvent,
  onNavigateTickets,
}) => {
  const { t, translateCategory } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | EventCategory>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'open' | 'saved'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'popular' | 'seats'>('date');
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('ac_synapse_saved_events_v1');
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [isSimulatingRefresh, setIsSimulatingRefresh] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('ac_synapse_saved_events_v1', JSON.stringify(savedIds));
    } catch {
      // Ignore storage error
    }
  }, [savedIds]);

  const toggleSaveEvent = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    setSavedIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  const handleSimulateRefresh = () => {
    setIsSimulatingRefresh(true);
    window.setTimeout(() => setIsSimulatingRefresh(false), 350);
  };

  const filteredEvents = events
    .filter((ev) => {
      const matchesCat = selectedCategory === 'All' || ev.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.organizer.toLowerCase().includes(q);
      const seatsLeft = ev.totalSeats - ev.registeredCount;
      const matchesSeats =
        availabilityFilter === 'all'
          ? true
          : availabilityFilter === 'open'
          ? seatsLeft > 0
          : savedIds.includes(ev.id);
      return matchesCat && matchesSearch && matchesSeats;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        const ratioB = b.registeredCount / Math.max(1, b.totalSeats);
        const ratioA = a.registeredCount / Math.max(1, a.totalSeats);
        return ratioB - ratioA;
      }
      if (sortBy === 'seats') {
        const leftB = b.totalSeats - b.registeredCount;
        const leftA = a.totalSeats - a.registeredCount;
        return leftB - leftA;
      }
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

  const formatDateShort = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            {t.eventsDirectoryTitle}
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            {t.eventsDirectorySubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSimulateRefresh}
            aria-label="Refresh event directory"
            className="min-h-[42px] px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-[#7A1224]/40 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSimulatingRefresh ? 'animate-spin' : ''}`} />
            <span>{t.syncButton}</span>
          </button>

          {role === 'admin' && (
            <button
              type="button"
              onClick={onOpenAdminCreateEvent}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-[#7A1224] hover:bg-[#600E1C] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{t.publishEvent}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search events by title, venue, or society"
              placeholder={t.searchEventsPlaceholder}
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-2 focus:outline-[#7A1224] dark:focus:outline-amber-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-stone-400 hidden sm:inline" />
            <div className="inline-flex rounded-xl p-1 bg-stone-200/70 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setAvailabilityFilter('all')}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  availabilityFilter === 'all'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                {t.allCapacities}
              </button>
              <button
                type="button"
                onClick={() => setAvailabilityFilter('open')}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  availabilityFilter === 'open'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                {t.seatsAvailable}
              </button>
              <button
                type="button"
                onClick={() => setAvailabilityFilter('saved')}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                  availabilityFilter === 'saved'
                    ? 'bg-white dark:bg-stone-800 text-[#7A1224] dark:text-amber-300 shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                <span>Saved ({savedIds.length})</span>
              </button>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <select
                aria-label="Sort events"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'popular' | 'seats')}
                className="bg-transparent font-semibold text-stone-700 dark:text-stone-200 focus:outline-none cursor-pointer"
              >
                <option value="date">Sort: Soonest First</option>
                <option value="popular">Sort: Most Popular</option>
                <option value="seats">Sort: Most Seats Left</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div
          role="tablist"
          aria-label="Filter events by category"
          className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar"
        >
          {ALL_CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            const count =
              category === 'All'
                ? events.length
                : events.filter((e) => e.category === category).length;

            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(category)}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer border ${
                  active
                    ? 'bg-[#7A1224] text-amber-200 border-[#7A1224] dark:bg-amber-400 dark:text-stone-950 dark:border-amber-400'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-[#7A1224]/40'
                }`}
              >
                <span>{translateCategory(category)}</span>
                <span className="font-mono tabular-nums text-[11px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isSimulatingRefresh ? (
        <div
          aria-busy="true"
          aria-label="Refreshing events list"
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-stone-200/70 dark:bg-stone-900/70 animate-pulse border border-stone-200 dark:border-stone-800"
            />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-10 text-center max-w-lg mx-auto my-8 space-y-3">
          <p className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
            No matching school events found
          </p>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            No events matched your search for "{searchQuery}" in {selectedCategory}. Try clearing
            your search or selecting another category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setAvailabilityFilter('all');
            }}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Events List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEvents.map((event) => {
            const catMeta = CATEGORY_META[event.category];
            const seatsLeft = Math.max(0, event.totalSeats - event.registeredCount);
            const isFull = seatsLeft === 0;
            const waitlistCount = tickets.filter(
              (t) => t.eventId === event.id && t.status === 'Waitlisted'
            ).length;
            const fillRatio = Math.min(
              100,
              Math.round((event.registeredCount / event.totalSeats) * 100)
            );
            const isRegistered = tickets.some((t) => t.eventId === event.id);

            return (
              <article
                key={event.id}
                className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 overflow-hidden flex flex-col justify-between hover:border-[#7A1224]/50 dark:hover:border-amber-400/50 transition-colors"
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
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                    <button
                      type="button"
                      onClick={(e) => toggleSaveEvent(e, event.id)}
                      aria-label={
                        savedIds.includes(event.id) ? 'Remove from saved events' : 'Save event'
                      }
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors cursor-pointer ${
                        savedIds.includes(event.id)
                          ? 'bg-amber-400 text-stone-950 border-amber-300'
                          : 'bg-black/45 text-white border-white/20 hover:bg-black/70'
                      }`}
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          savedIds.includes(event.id) ? 'fill-current' : ''
                        }`}
                      />
                    </button>
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                      <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        {formatDateShort(event.startDate)}
                      </span>
                      <span className="font-mono tabular-nums font-semibold text-amber-300">
                        {isFull
                          ? `Full · ${waitlistCount} waitlisted`
                          : `${seatsLeft} seats left`}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    {/* Category Badge & Capacity Indicator ("42/100 seats") */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${catMeta.badgeBg} ${catMeta.badgeText}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${catMeta.dotColor}`} />
                        {translateCategory(event.category)}
                      </span>

                      <span
                        aria-label={`${event.registeredCount} of ${event.totalSeats} seats registered`}
                        className="font-mono tabular-nums text-xs font-semibold text-stone-700 dark:text-stone-300"
                      >
                        {event.registeredCount}/{event.totalSeats} {t.seatsFilled}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h2
                        onClick={() => onSelectEvent(event.id)}
                        className="font-display text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 hover:text-[#7A1224] dark:hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        {event.title}
                      </h2>
                      <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
                        {event.subtitle}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 space-y-3">
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          fillRatio >= 100
                            ? 'bg-amber-500'
                            : 'bg-[#7A1224] dark:bg-amber-400'
                        }`}
                        style={{ width: `${fillRatio}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      {isRegistered && (
                        <button
                          type="button"
                          onClick={onNavigateTickets}
                          className="min-h-[40px] px-3 py-2 rounded-xl border border-emerald-600/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <TicketIcon className="w-3.5 h-3.5" />
                          <span>My Pass</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onRegisterEvent(event)}
                        className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          isFull
                            ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
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
      )}
    </div>
  );
};
