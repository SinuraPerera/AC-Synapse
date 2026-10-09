import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, MapPin, ArrowUpRight, Clock } from 'lucide-react';
import { LiveUpdate, LiveUpdateType, SchoolEvent, UserRole } from '../types';
import { useI18n } from '../lib/i18n';

interface LiveFeedPageProps {
  liveUpdates: LiveUpdate[];
  events: SchoolEvent[];
  role: UserRole;
  onSelectEvent: (eventId: string) => void;
  onOpenAdminLiveModal: () => void;
}

export const LiveFeedPage: React.FC<LiveFeedPageProps> = ({
  liveUpdates,
  events,
  role,
  onSelectEvent,
  onOpenAdminLiveModal,
}) => {
  const { t } = useI18n();
  const [typeFilter, setTypeFilter] = useState<'all' | LiveUpdateType>('all');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');

  const filteredUpdates = liveUpdates
    .filter((u) => {
      if (typeFilter !== 'all' && u.type !== typeFilter) return false;
      if (selectedEventId !== 'all' && u.eventId !== selectedEventId) return false;
      return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    const diffMin = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
    const rel =
      diffMin === 0
        ? 'Just now'
        : diffMin < 60
        ? `${diffMin}m ago`
        : diffMin < 1440
        ? `${Math.floor(diffMin / 60)}h ago`
        : `${Math.floor(diffMin / 1440)}d ago`;

    const exact = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${rel} · ${exact}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              LIVE
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
              {t.liveFeedTitle}
            </h1>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {t.liveFeedSubtitle}
          </p>
        </div>

        {role === 'admin' && (
          <button
            type="button"
            onClick={onOpenAdminLiveModal}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#7A1224] hover:bg-[#600E1C] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{t.postLiveUpdate}</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(
            [
              { id: 'all', label: t.allUpdates },
              { id: 'score', label: t.scores },
              { id: 'schedule', label: t.scheduleChanges },
              { id: 'highlight', label: t.highlights },
              { id: 'alert', label: t.alerts },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTypeFilter(tab.id)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer border ${
                typeFilter === tab.id
                  ? 'bg-[#7A1224] text-amber-200 border-[#7A1224] dark:bg-amber-400 dark:text-stone-950 dark:border-amber-400'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          aria-label="Filter updates by event"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-800 dark:text-stone-200"
        >
          <option value="all">All School Events ({liveUpdates.length})</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      {/* Feed Timeline */}
      {filteredUpdates.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-10 text-center space-y-3">
          <p className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
            No live updates for this filter
          </p>
          <button
            type="button"
            onClick={() => {
              setTypeFilter('all');
              setSelectedEventId('all');
            }}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold cursor-pointer"
          >
            Reset Feed Filter
          </button>
        </div>
      ) : (
        <div className="relative border-l-2 border-[#7A1224]/30 dark:border-amber-400/30 ml-3 sm:ml-5 space-y-5">
          {filteredUpdates.map((item) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-5 sm:ml-7 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 space-y-3 relative hover:border-[#7A1224]/40 transition-colors"
            >
              <span
                className={`-left-[29px] sm:-left-[37px] top-6 absolute w-3.5 h-3.5 rounded-full ring-4 ring-[#FAF8F5] dark:ring-[#0D0B0E] ${
                  item.isHappeningNow
                    ? 'bg-red-600 dark:bg-amber-400'
                    : 'bg-stone-400 dark:bg-stone-600'
                }`}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </span>
                  <span className="font-bold uppercase tracking-wider text-[#7A1224] dark:text-amber-400">
                    {item.type}
                  </span>
                  <span aria-hidden="true" className="text-stone-400">
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectEvent(item.eventId)}
                    className="font-semibold text-stone-700 dark:text-stone-300 hover:text-[#7A1224] dark:hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>{item.eventTitle}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="inline-flex items-center gap-1 font-mono tabular-nums text-stone-500 dark:text-stone-400">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>

              <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                {item.headline}
              </h2>

              {item.scoreSummary && (
                <div className="rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 px-4 py-2.5 font-mono tabular-nums text-xs sm:text-sm font-bold text-[#7A1224] dark:text-amber-300">
                  {item.scoreSummary}
                </div>
              )}

              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {item.detail}
              </p>

              <div className="pt-1 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                <MapPin className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400" />
                <span>{item.venue}</span>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
};
