import React, { useState } from 'react';
import { AlertTriangle, Pin, Plus, Search, ArrowRight } from 'lucide-react';
import { Announcement, UserRole } from '../types';
import { useI18n } from '../lib/i18n';

interface AnnouncementsPageProps {
  announcements: Announcement[];
  role: UserRole;
  onSelectEvent: (eventId: string) => void;
  onTogglePin: (announcementId: string) => void;
  onOpenAdminAnnouncement: () => void;
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({
  announcements,
  role,
  onSelectEvent,
  onTogglePin,
  onOpenAdminAnnouncement,
}) => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'urgent' | 'pinned'>('all');

  const filtered = announcements
    .filter((ann) => {
      if (filterMode === 'urgent' && !ann.isUrgent) return false;
      if (filterMode === 'pinned' && !ann.isPinned) return false;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        ann.title.toLowerCase().includes(q) ||
        ann.body.toLowerCase().includes(q) ||
        ann.author.toLowerCase().includes(q) ||
        ann.category.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const formatTimestamp = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            {t.announcementsTitle}
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            {t.announcementsSubtitle}
          </p>
        </div>

        {role === 'admin' && (
          <button
            type="button"
            onClick={onOpenAdminAnnouncement}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#7A1224] hover:bg-[#600E1C] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{t.broadcastNotice}</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search announcements"
            placeholder={t.searchNoticesPlaceholder}
            className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-2 focus:outline-[#7A1224] dark:focus:outline-amber-400"
          />
        </div>

        <div className="inline-flex rounded-xl p-1 bg-stone-200/70 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 self-start sm:self-auto">
          {(
            [
              { id: 'all', label: t.allNotices },
              { id: 'urgent', label: t.urgent },
              { id: 'pinned', label: t.pinned },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id)}
              className={`min-h-[36px] px-3.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === tab.id
                  ? 'bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-10 text-center space-y-3">
          <p className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
            No announcements match your search
          </p>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            Try clearing your search term or switching back to "All Notices".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterMode('all');
            }}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold cursor-pointer"
          >
            Show All Notices
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ann) => (
            <article
              key={ann.id}
              className={`rounded-2xl bg-white dark:bg-stone-900 border p-5 sm:p-6 space-y-3 transition-colors ${
                ann.isUrgent
                  ? 'border-red-300 dark:border-red-800/70'
                  : 'border-stone-200 dark:border-stone-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {ann.isUrgent && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-100 dark:bg-red-950/70 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Urgent</span>
                    </span>
                  )}

                  {ann.isPinned && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-semibold">
                      <Pin className="w-3 h-3" />
                      <span>Pinned</span>
                    </span>
                  )}

                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    {ann.category} · Issued by {ann.author}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono tabular-nums text-xs text-stone-500 dark:text-stone-400">
                    {formatTimestamp(ann.createdAt)}
                  </span>

                  {role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => onTogglePin(ann.id)}
                      className="text-xs font-semibold text-[#7A1224] dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      {ann.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                  )}
                </div>
              </div>

              <h2 className="font-display text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                {ann.title}
              </h2>

              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {ann.body}
              </p>

              {ann.relatedEventId && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onSelectEvent(ann.relatedEventId!)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A1224] dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    <span>View Associated Event Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
