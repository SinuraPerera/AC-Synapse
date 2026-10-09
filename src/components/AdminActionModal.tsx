import React, { useState } from 'react';
import { X, PlusCircle, Radio, Megaphone } from 'lucide-react';
import {
  Announcement,
  EventCategory,
  LiveUpdate,
  LiveUpdateType,
  SchoolEvent,
} from '../types';
import { useFocusTrap } from '../lib/useFocusTrap';
import debateBanner from '../assets/images/kularatne_auditorium_debate_1791468797282.jpg';

interface AdminActionModalProps {
  mode: 'event' | 'announcement' | 'live' | null;
  events: SchoolEvent[];
  onClose: () => void;
  onCreateEvent: (evt: Omit<SchoolEvent, 'id' | 'registeredCount'>) => void;
  onCreateAnnouncement: (ann: Omit<Announcement, 'id' | 'createdAt'>) => void;
  onCreateLiveUpdate: (lu: Omit<LiveUpdate, 'id' | 'timestamp'>) => void;
}

export const AdminActionModal: React.FC<AdminActionModalProps> = ({
  mode,
  events,
  onClose,
  onCreateEvent,
  onCreateAnnouncement,
  onCreateLiveUpdate,
}) => {
  const modalRef = useFocusTrap<HTMLDivElement>(Boolean(mode), onClose);

  // Event state
  const [evtTitle, setEvtTitle] = useState('');
  const [evtSubtitle, setEvtSubtitle] = useState('');
  const [evtCategory, setEvtCategory] = useState<EventCategory>('Academic');
  const [evtVenue, setEvtVenue] = useState('Kularatne Auditorium');
  const [evtDaysFromNow, setEvtDaysFromNow] = useState(5);
  const [evtTotalSeats, setEvtTotalSeats] = useState(150);
  const [evtOrganizer, setEvtOrganizer] = useState('Ananda College Prefect Guild');
  const [evtDescription, setEvtDescription] = useState('');

  // Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annCategory, setAnnCategory] = useState<EventCategory | 'General'>('General');
  const [annAuthor, setAnnAuthor] = useState('Principal’s Office');
  const [annUrgent, setAnnUrgent] = useState(false);
  const [annPinned, setAnnPinned] = useState(true);

  // Live Update state
  const [luEventId, setLuEventId] = useState(events[0]?.id || '');
  const [luType, setLuType] = useState<LiveUpdateType>('score');
  const [luHeadline, setLuHeadline] = useState('');
  const [luDetail, setLuDetail] = useState('');
  const [luScore, setLuScore] = useState('');

  if (!mode) return null;

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim()) return;
    const start = new Date(Date.now() + evtDaysFromNow * 24 * 60 * 60 * 1000);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

    onCreateEvent({
      title: evtTitle.trim(),
      subtitle: evtSubtitle.trim() || `${evtCategory} Showcase at ${evtVenue}`,
      category: evtCategory,
      description:
        evtDescription.trim() ||
        'Official Ananda College event scheduled via AC Synapse Command Center.',
      venue: evtVenue,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalSeats: Number(evtTotalSeats) || 100,
      organizer: evtOrganizer.trim(),
      imageUrl: debateBanner,
      schedule: [
        {
          id: `sch-${Date.now()}-1`,
          time: '09:00 AM',
          title: 'Inauguration & Welcome Address',
          speakerOrLead: evtOrganizer.trim(),
          locationNote: evtVenue,
        },
        {
          id: `sch-${Date.now()}-2`,
          time: '10:30 AM',
          title: 'Main Session & Interactive Proceedings',
          speakerOrLead: 'Organizing Committee',
          locationNote: evtVenue,
        },
      ],
    });
    onClose();
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annBody.trim()) return;
    onCreateAnnouncement({
      title: annTitle.trim(),
      body: annBody.trim(),
      category: annCategory,
      author: annAuthor.trim(),
      isUrgent: annUrgent,
      isPinned: annPinned,
    });
    onClose();
  };

  const handleLiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!luHeadline.trim()) return;
    const targetEvt = events.find((ev) => ev.id === luEventId) || events[0];
    onCreateLiveUpdate({
      eventId: targetEvt.id,
      eventTitle: targetEvt.title,
      type: luType,
      headline: luHeadline.trim(),
      detail: luDetail.trim() || 'Live telemetry update broadcast from venue desk.',
      scoreSummary: luScore.trim() || undefined,
      venue: targetEvt.venue,
      isHappeningNow: true,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto focus:outline-none"
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            {mode === 'live' && (
              <Radio
                className="w-5 h-5 text-[#7A1224] dark:text-amber-400"
                aria-label="Live broadcast icon"
              />
            )}
            {mode === 'announcement' && (
              <Megaphone
                className="w-5 h-5 text-[#7A1224] dark:text-amber-400"
                aria-label="Official notice megaphone icon"
              />
            )}
            {mode === 'event' && (
              <PlusCircle
                className="w-5 h-5 text-[#7A1224] dark:text-amber-400"
                aria-label="Create new event icon"
              />
            )}
            <h2
              id="admin-modal-title"
              className="font-display text-lg font-bold text-stone-900 dark:text-stone-100"
            >
              {mode === 'event' && 'Publish New School Event'}
              {mode === 'announcement' && 'Broadcast Official Notice'}
              {mode === 'live' && 'Post Live Venue Update'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin action modal"
            className="min-h-[40px] min-w-[40px] rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]"
          >
            <X className="w-5 h-5" aria-label="Close modal icon" />
          </button>
        </div>

        {mode === 'event' && (
          <form onSubmit={handleEventSubmit} className="mt-4 space-y-3.5">
            <div>
              <label htmlFor="admin-evt-title" className="block text-xs font-semibold mb-1">
                Event Title *
              </label>
              <input
                id="admin-evt-title"
                data-autofocus="true"
                type="text"
                required
                value={evtTitle}
                onChange={(e) => setEvtTitle(e.target.value)}
                placeholder="e.g. Inter-School Chess Championship"
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm focus:outline-2 focus:outline-[#7A1224]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="admin-evt-category" className="block text-xs font-semibold mb-1">
                  Category
                </label>
                <select
                  id="admin-evt-category"
                  value={evtCategory}
                  onChange={(e) => setEvtCategory(e.target.value as EventCategory)}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm focus:outline-2 focus:outline-[#7A1224]"
                >
                  <option value="Sports">Sports</option>
                  <option value="Debate">Debate</option>
                  <option value="Exhibition">Exhibition</option>
                  <option value="Academic">Academic</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Parents' Meeting">Parents&apos; Meeting</option>
                </select>
              </div>
              <div>
                <label htmlFor="admin-evt-venue" className="block text-xs font-semibold mb-1">
                  Venue
                </label>
                <select
                  id="admin-evt-venue"
                  value={evtVenue}
                  onChange={(e) => setEvtVenue(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm focus:outline-2 focus:outline-[#7A1224]"
                >
                  <option value="Kularatne Auditorium">Kularatne Auditorium</option>
                  <option value="Olcott Hall">Olcott Hall</option>
                  <option value="Colonel G.W. Rajapaksa Stadium">
                    Colonel G.W. Rajapaksa Stadium
                  </option>
                  <option value="Fritz Kunz Memorial Hall">Fritz Kunz Memorial Hall</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="admin-evt-days" className="block text-xs font-semibold mb-1">
                  Days From Today
                </label>
                <input
                  id="admin-evt-days"
                  type="number"
                  min={1}
                  max={60}
                  value={evtDaysFromNow}
                  onChange={(e) => setEvtDaysFromNow(Number(e.target.value))}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm font-mono focus:outline-2 focus:outline-[#7A1224]"
                />
              </div>
              <div>
                <label htmlFor="admin-evt-seats" className="block text-xs font-semibold mb-1">
                  Total Seat Capacity
                </label>
                <input
                  id="admin-evt-seats"
                  type="number"
                  min={20}
                  max={2000}
                  value={evtTotalSeats}
                  onChange={(e) => setEvtTotalSeats(Number(e.target.value))}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm font-mono focus:outline-2 focus:outline-[#7A1224]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="admin-evt-desc" className="block text-xs font-semibold mb-1">
                Description *
              </label>
              <textarea
                id="admin-evt-desc"
                rows={3}
                required
                value={evtDescription}
                onChange={(e) => setEvtDescription(e.target.value)}
                placeholder="Describe schedule highlights, eligibility, and seating instructions..."
                className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm focus:outline-2 focus:outline-[#7A1224]"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                aria-label="Cancel event creation and close modal"
                className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]"
              >
                Cancel
              </button>
              <button
                type="submit"
                aria-label="Publish new school event"
                className="min-h-[42px] px-5 py-2 rounded-xl bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]"
              >
                Publish Event
              </button>
            </div>
          </form>
        )}

        {mode === 'announcement' && (
          <form onSubmit={handleAnnouncementSubmit} className="mt-4 space-y-3.5">
            <div>
              <label htmlFor="admin-ann-title" className="block text-xs font-semibold mb-1">
                Notice Headline *
              </label>
              <input
                id="admin-ann-title"
                data-autofocus="true"
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="e.g. Revised Gate Entry Timing for Olcott Hall"
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm focus:outline-2 focus:outline-[#7A1224]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="admin-ann-category" className="block text-xs font-semibold mb-1">
                  Category
                </label>
                <select
                  id="admin-ann-category"
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value as EventCategory | 'General')}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm focus:outline-2 focus:outline-[#7A1224]"
                >
                  <option value="General">General</option>
                  <option value="Sports">Sports</option>
                  <option value="Debate">Debate</option>
                  <option value="Exhibition">Exhibition</option>
                  <option value="Academic">Academic</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Parents' Meeting">Parents&apos; Meeting</option>
                </select>
              </div>
              <div>
                <label htmlFor="admin-ann-author" className="block text-xs font-semibold mb-1">
                  Issued By
                </label>
                <input
                  id="admin-ann-author"
                  type="text"
                  value={annAuthor}
                  onChange={(e) => setAnnAuthor(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm focus:outline-2 focus:outline-[#7A1224]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="admin-ann-body" className="block text-xs font-semibold mb-1">
                Announcement Details *
              </label>
              <textarea
                id="admin-ann-body"
                rows={3}
                required
                value={annBody}
                onChange={(e) => setAnnBody(e.target.value)}
                placeholder="Enter official instructions for students and parents..."
                className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm focus:outline-2 focus:outline-[#7A1224]"
              />
            </div>
            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={annUrgent}
                  onChange={(e) => setAnnUrgent(e.target.checked)}
                  className="w-4 h-4 accent-[#7A1224]"
                />
                <span>Mark as Urgent</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={annPinned}
                  onChange={(e) => setAnnPinned(e.target.checked)}
                  className="w-4 h-4 accent-[#7A1224]"
                />
                <span>Pin to Home Strip</span>
              </label>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                aria-label="Cancel announcement and close modal"
                className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]"
              >
                Cancel
              </button>
              <button
                type="submit"
                aria-label="Post official announcement"
                className="min-h-[42px] px-5 py-2 rounded-xl bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]"
              >
                Post Announcement
              </button>
            </div>
          </form>
        )}

        {mode === 'live' && (
          <form onSubmit={handleLiveSubmit} className="mt-4 space-y-3.5">
            <div>
              <label htmlFor="admin-lu-event" className="block text-xs font-semibold mb-1">
                Related Event
              </label>
              <select
                id="admin-lu-event"
                value={luEventId}
                onChange={(e) => setLuEventId(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm focus:outline-2 focus:outline-[#7A1224]"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>
            <div role="group" aria-labelledby="admin-lu-type-label">
              <span id="admin-lu-type-label" className="block text-xs font-semibold mb-1">
                Update Type
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(['score', 'schedule', 'highlight', 'alert'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={luType === t}
                    aria-label={`Select update type: ${t}`}
                    onClick={() => setLuType(t)}
                    className={`min-h-[38px] rounded-xl text-xs font-semibold capitalize border cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7A1224] ${
                      luType === t
                        ? 'bg-[#7A1224] text-amber-200 border-[#7A1224] dark:bg-amber-400 dark:text-stone-950'
                        : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="admin-lu-headline" className="block text-xs font-semibold mb-1">
                Live Headline *
              </label>
              <input
                id="admin-lu-headline"
                data-autofocus="true"
                type="text"
                required
                value={luHeadline}
                onChange={(e) => setLuHeadline(e.target.value)}
                placeholder="e.g. Gemunu House wins U-18 200m Sprint Final"
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm focus:outline-2 focus:outline-[#7A1224]"
              />
            </div>
            <div>
              <label htmlFor="admin-lu-score" className="block text-xs font-semibold mb-1">
                Scoreboard / Standings Line (Optional)
              </label>
              <input
                id="admin-lu-score"
                type="text"
                value={luScore}
                onChange={(e) => setLuScore(e.target.value)}
                placeholder="e.g. Vijaya 260 pts · Gemunu 254 pts"
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm font-mono focus:outline-2 focus:outline-[#7A1224]"
              />
            </div>
            <div>
              <label htmlFor="admin-lu-detail" className="block text-xs font-semibold mb-1">
                Commentary / Details *
              </label>
              <textarea
                id="admin-lu-detail"
                rows={2}
                required
                value={luDetail}
                onChange={(e) => setLuDetail(e.target.value)}
                placeholder="Provide context on the result, speaker, or timing adjustment..."
                className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm focus:outline-2 focus:outline-[#7A1224]"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                aria-label="Cancel live update and close modal"
                className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]"
              >
                Cancel
              </button>
              <button
                type="submit"
                aria-label="Broadcast live update now"
                className="min-h-[42px] px-5 py-2 rounded-xl bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]"
              >
                Broadcast Live Update
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
