import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  QrCode,
  Camera,
  CameraOff,
  Radio,
  Megaphone,
  Calendar,
  Users,
  Pin,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import {
  Announcement,
  EventCategory,
  LiveUpdate,
  LiveUpdateType,
  SchoolEvent,
  Ticket,
} from '../types';
import { PRESET_BANNERS } from '../lib/seedData';
import { exportRegistrationsToCsv } from '../lib/ticketUtils';

interface AdminDashboardPageProps {
  events: SchoolEvent[];
  tickets: Ticket[];
  announcements: Announcement[];
  liveUpdates: LiveUpdate[];
  onCreateEvent: (evt: Omit<SchoolEvent, 'id' | 'registeredCount'>) => void;
  onUpdateEvent: (evt: SchoolEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onCreateAnnouncement: (ann: Omit<Announcement, 'id' | 'createdAt'>) => void;
  onTogglePinAnnouncement: (announcementId: string) => void;
  onDeleteAnnouncement: (announcementId: string) => void;
  onCreateLiveUpdate: (lu: Omit<LiveUpdate, 'id' | 'timestamp'>) => void;
  onCheckInTicket: (ticketCode: string) => {
    ok: boolean;
    message: string;
    ticket?: Ticket;
    event?: SchoolEvent;
  };
  onSelectEvent: (eventId: string) => void;
}

type AdminTab = 'events' | 'checkin' | 'registrations' | 'live' | 'announcements';

function toLocalDatetimeInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  events,
  tickets,
  announcements,
  liveUpdates,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onCreateAnnouncement,
  onTogglePinAnnouncement,
  onDeleteAnnouncement,
  onCreateLiveUpdate,
  onCheckInTicket,
  onSelectEvent,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('events');

  // --- Stats Calculations (Requirement 6) ---
  const totalEvents = events.length;
  const totalRegistrations = tickets.length;
  const confirmedTickets = tickets.filter((t) => t.status === 'Confirmed');
  const checkedInCount = tickets.filter((t) => t.checkedIn).length;
  const checkInRate =
    confirmedTickets.length > 0
      ? Math.round((checkedInCount / confirmedTickets.length) * 100)
      : 0;
  const totalSeatsRemaining = events.reduce(
    (acc, ev) => acc + Math.max(0, ev.totalSeats - ev.registeredCount),
    0
  );

  // --- 1. Event Create / Edit / Delete State ---
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [evtTitle, setEvtTitle] = useState('');
  const [evtCategory, setEvtCategory] = useState<EventCategory>('Sports');
  const [evtVenue, setEvtVenue] = useState('Kularatne Auditorium');
  const [evtStart, setEvtStart] = useState(() =>
    toLocalDatetimeInput(new Date(Date.now() + 4 * 86400000).toISOString())
  );
  const [evtEnd, setEvtEnd] = useState(() =>
    toLocalDatetimeInput(new Date(Date.now() + 4 * 86400000 + 4 * 3600000).toISOString())
  );
  const [evtCapacity, setEvtCapacity] = useState(150);
  const [evtDescription, setEvtDescription] = useState('');
  const [evtImageUrl, setEvtImageUrl] = useState(PRESET_BANNERS[0].url);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const startEditingEvent = (ev: SchoolEvent) => {
    setEditingEventId(ev.id);
    setEvtTitle(ev.title);
    setEvtCategory(ev.category);
    setEvtVenue(ev.venue);
    setEvtStart(toLocalDatetimeInput(ev.startDate));
    setEvtEnd(toLocalDatetimeInput(ev.endDate));
    setEvtCapacity(ev.totalSeats);
    setEvtDescription(ev.description);
    setEvtImageUrl(ev.imageUrl);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    setEvtTitle('');
    setEvtCategory('Sports');
    setEvtVenue('Kularatne Auditorium');
    setEvtStart(toLocalDatetimeInput(new Date(Date.now() + 4 * 86400000).toISOString()));
    setEvtEnd(
      toLocalDatetimeInput(new Date(Date.now() + 4 * 86400000 + 4 * 3600000).toISOString())
    );
    setEvtCapacity(150);
    setEvtDescription('');
    setEvtImageUrl(PRESET_BANNERS[0].url);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim() || !evtVenue.trim()) return;

    const startDateIso = new Date(evtStart).toISOString();
    const endDateIso = new Date(evtEnd).toISOString();

    if (editingEventId) {
      const existing = events.find((ev) => ev.id === editingEventId);
      if (existing) {
        onUpdateEvent({
          ...existing,
          title: evtTitle.trim(),
          subtitle: `${evtCategory} · ${evtVenue.trim()}`,
          category: evtCategory,
          venue: evtVenue.trim(),
          startDate: startDateIso,
          endDate: endDateIso,
          totalSeats: Math.max(1, Number(evtCapacity)),
          description: evtDescription.trim(),
          imageUrl: evtImageUrl.trim() || PRESET_BANNERS[0].url,
        });
      }
    } else {
      onCreateEvent({
        title: evtTitle.trim(),
        subtitle: `${evtCategory} · ${evtVenue.trim()}`,
        category: evtCategory,
        venue: evtVenue.trim(),
        startDate: startDateIso,
        endDate: endDateIso,
        totalSeats: Math.max(1, Number(evtCapacity)),
        description:
          evtDescription.trim() ||
          'Official Ananda College event scheduled via AC Synapse Admin Command Center.',
        organizer: 'Ananda College Administration',
        imageUrl: evtImageUrl.trim() || PRESET_BANNERS[0].url,
        schedule: [
          {
            id: `sch-${Date.now()}-1`,
            time: new Date(startDateIso).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            title: 'Commencement & Registration Check-In',
            speakerOrLead: 'Event Stewards',
            locationNote: evtVenue.trim(),
          },
          {
            id: `sch-${Date.now()}-2`,
            time: new Date(new Date(startDateIso).getTime() + 3600000).toLocaleTimeString(
              'en-US',
              {
                hour: '2-digit',
                minute: '2-digit',
              }
            ),
            title: 'Main Proceedings & Programme',
            speakerOrLead: 'Organizing Committee',
            locationNote: evtVenue.trim(),
          },
        ],
      });
    }
    resetEventForm();
  };

  // --- 2. Announcements Form State ---
  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState<EventCategory | 'General'>('General');
  const [annAuthor, setAnnAuthor] = useState('Principal’s Office');
  const [annRelatedEventId, setAnnRelatedEventId] = useState<string>('');
  const [annBody, setAnnBody] = useState('');
  const [annPinned, setAnnPinned] = useState(true);
  const [annUrgent, setAnnUrgent] = useState(false);

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annBody.trim()) return;
    onCreateAnnouncement({
      title: annTitle.trim(),
      body: annBody.trim(),
      category: annCategory,
      author: annAuthor.trim() || 'Administration',
      isPinned: annPinned,
      isUrgent: annUrgent,
      relatedEventId: annRelatedEventId || undefined,
    });
    setAnnTitle('');
    setAnnBody('');
  };

  // --- 3. Live Update Form State ---
  const [luEventId, setLuEventId] = useState(events[0]?.id || '');
  const [luType, setLuType] = useState<LiveUpdateType>('score');
  const [luHeadline, setLuHeadline] = useState('');
  const [luScore, setLuScore] = useState('');
  const [luMessage, setLuMessage] = useState('');

  const handlePostLiveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!luHeadline.trim() && !luMessage.trim()) return;
    const targetEvt = events.find((ev) => ev.id === luEventId) || events[0];
    if (!targetEvt) return;

    onCreateLiveUpdate({
      eventId: targetEvt.id,
      eventTitle: targetEvt.title,
      type: luType,
      headline: luHeadline.trim() || luMessage.trim(),
      detail: luMessage.trim() || luHeadline.trim(),
      scoreSummary: luScore.trim() || undefined,
      venue: targetEvt.venue,
      isHappeningNow: true,
    });
    setLuHeadline('');
    setLuScore('');
    setLuMessage('');
  };

  // --- 4. Registrations Table Filter & Search State ---
  const [regEventFilter, setRegEventFilter] = useState<string>('all');
  const [regSearch, setRegSearch] = useState('');

  const filteredRegistrations = tickets.filter((t) => {
    if (regEventFilter !== 'all' && t.eventId !== regEventFilter) return false;
    const q = regSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      t.ticketCode.toLowerCase().includes(q) ||
      t.attendeeName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.phone.toLowerCase().includes(q) ||
      t.gradeOrRoleDetail.toLowerCase().includes(q)
    );
  });

  // --- 5. Check-In Scanner & Manual Input State ---
  const [ticketCodeInput, setTicketCodeInput] = useState('');
  const [checkInResult, setCheckInResult] = useState<{
    ok: boolean;
    message: string;
    ticket?: Ticket;
    event?: SchoolEvent;
  } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const performCheckIn = (rawCode: string) => {
    const cleaned = rawCode.trim().toUpperCase();
    if (!cleaned) return;
    const res = onCheckInTicket(cleaned);
    setCheckInResult(res);
  };

  const handleManualCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performCheckIn(ticketCodeInput);
  };

  const stopCameraScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        // Ignore stop errors if already stopped
      }
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  const startCameraScanner = async () => {
    setCameraError(null);
    setCameraActive(true);
    window.setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode('ac-synapse-qr-reader');
        scannerRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            // Try to extract RCP-XXXX-XXXX or JSON payload
            let extracted = decodedText.trim();
            try {
              const parsed = JSON.parse(decodedText);
              if (parsed.code) extracted = parsed.code;
            } catch {
              // Plain string RCP-XXXX-XXXX
            }
            setTicketCodeInput(extracted);
            performCheckIn(extracted);
            stopCameraScanner();
          },
          () => {
            // Frame scan error — ignore while scanning
          }
        );
      } catch {
        setCameraError(
          'Camera hardware unavailable or permission denied in this browser environment. Please use the manual Ticket Code input above.'
        );
        setCameraActive(false);
      }
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-8 pb-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#7A1224] dark:text-amber-400">
            Ananda College · Executive Command Console
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
            Admin Operations Dashboard
          </h1>
        </div>

        {/* Navigation Tabs */}
        <div
          role="tablist"
          aria-label="Admin dashboard sections"
          className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-stone-200/70 dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
        >
          {(
            [
              { id: 'events', label: '1. Events CRUD' },
              { id: 'announcements', label: '2. Notices' },
              { id: 'live', label: '3. Post Live Update' },
              { id: 'registrations', label: '4. Registrations & CSV' },
              { id: 'checkin', label: '5. Gate Check-In' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requirement 6: Small Stats Row */}
      <section
        aria-label="Key Event Metrics"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 sm:p-5">
          <div className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            Total Events
          </div>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {totalEvents}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            Active across 6 school categories
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 sm:p-5">
          <div className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            Total Registrations
          </div>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-[#7A1224] dark:text-amber-400 mt-1">
            {totalRegistrations}
          </div>
          <div className="font-mono tabular-nums text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            {confirmedTickets.length} confirmed ·{' '}
            {tickets.length - confirmedTickets.length} waitlisted
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 sm:p-5">
          <div className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            Check-In Rate
          </div>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {checkInRate}%
          </div>
          <div className="font-mono tabular-nums text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            {checkedInCount} of {confirmedTickets.length} confirmed checked in
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 sm:p-5">
          <div className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            Seats Remaining
          </div>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {totalSeatsRemaining}
          </div>
          <div className="font-mono tabular-nums text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            Available across all campus venues
          </div>
        </div>
      </section>

      {/* TAB 1: Create / Edit / Delete Events */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Create / Edit Event Form */}
          <form
            onSubmit={handleSaveEvent}
            className="lg:col-span-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                {editingEventId ? 'Edit School Event' : 'Create New School Event'}
              </h2>
              {editingEventId && (
                <button
                  type="button"
                  onClick={resetEventForm}
                  className="text-xs font-semibold text-[#7A1224] dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={evtTitle}
                onChange={(e) => setEvtTitle(e.target.value)}
                placeholder="e.g. Senior Sinhala Oratory Finals"
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Category *</label>
                <select
                  value={evtCategory}
                  onChange={(e) => setEvtCategory(e.target.value as EventCategory)}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm"
                >
                  <option value="Sports">Sports</option>
                  <option value="Debate">Debate</option>
                  <option value="Exhibition">Exhibition</option>
                  <option value="Academic">Academic</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Parents' Meeting">Parents' Meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Seat Capacity *</label>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  required
                  value={evtCapacity}
                  onChange={(e) => setEvtCapacity(Number(e.target.value))}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm font-mono tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Campus Venue *</label>
              <input
                type="text"
                required
                value={evtVenue}
                onChange={(e) => setEvtVenue(e.target.value)}
                placeholder="e.g. Kularatne Auditorium, Olcott Hall, Rajapaksa Stadium"
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={evtStart}
                  onChange={(e) => setEvtStart(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">End Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={evtEnd}
                  onChange={(e) => setEvtEnd(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Banner Image URL</label>
              <input
                type="text"
                value={evtImageUrl}
                onChange={(e) => setEvtImageUrl(e.target.value)}
                placeholder="Paste image URL or select a campus preset below..."
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-xs font-mono"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {PRESET_BANNERS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setEvtImageUrl(p.url)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                      evtImageUrl === p.url
                        ? 'bg-[#7A1224] text-amber-200 border-[#7A1224] dark:bg-amber-400 dark:text-stone-950'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Description *</label>
              <textarea
                rows={3}
                required
                value={evtDescription}
                onChange={(e) => setEvtDescription(e.target.value)}
                placeholder="Enter full event description, eligibility, and programme summary..."
                className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] py-2.5 px-5 rounded-xl bg-[#7A1224] hover:bg-[#600E1C] text-amber-200 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-stone-950 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{editingEventId ? 'Save Event Changes' : 'Create & Publish Event'}</span>
            </button>
          </form>

          {/* Existing Events List with Edit & Delete */}
          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                Manage Scheduled Events ({events.length})
              </h2>
              <span className="text-xs text-stone-500">Click Edit to modify in-place</span>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {events.map((ev) => {
                const seatsLeft = Math.max(0, ev.totalSeats - ev.registeredCount);
                return (
                  <div
                    key={ev.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-[#7A1224] dark:text-amber-400">
                          {ev.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-stone-500 dark:text-stone-400">{ev.venue}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums font-semibold text-stone-700 dark:text-stone-300">
                          {ev.registeredCount}/{ev.totalSeats} seats ({seatsLeft} left)
                        </span>
                      </div>
                      <h3
                        onClick={() => onSelectEvent(ev.id)}
                        className="font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100 hover:text-[#7A1224] dark:hover:text-amber-300 cursor-pointer truncate"
                      >
                        {ev.title}
                      </h3>
                      <p className="font-mono tabular-nums text-[11px] text-stone-500">
                        {new Date(ev.startDate).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        –{' '}
                        {new Date(ev.endDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditingEvent(ev)}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {deletingEventId === ev.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteEvent(ev.id);
                              setDeletingEventId(null);
                            }}
                            className="min-h-[36px] px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingEventId(null)}
                            className="min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-500 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingEventId(ev.id)}
                          aria-label={`Delete ${ev.title}`}
                          className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Post Announcements (with Pinned / Urgent toggles) */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handlePostAnnouncement}
            className="lg:col-span-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 space-y-4"
          >
            <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-3">
              Post Official School Announcement
            </h2>

            <div>
              <label className="block text-xs font-semibold mb-1">Announcement Headline *</label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="e.g. Special Bus Arrangement for Athletics Meet"
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Category</label>
                <select
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value as EventCategory | 'General')}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm"
                >
                  <option value="General">General</option>
                  <option value="Sports">Sports</option>
                  <option value="Debate">Debate</option>
                  <option value="Exhibition">Exhibition</option>
                  <option value="Academic">Academic</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Parents' Meeting">Parents' Meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Issuing Authority</label>
                <input
                  type="text"
                  value={annAuthor}
                  onChange={(e) => setAnnAuthor(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Link to Event (Optional)</label>
              <select
                value={annRelatedEventId}
                onChange={(e) => setAnnRelatedEventId(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm"
              >
                <option value="">None (General Notice)</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Message Body *</label>
              <textarea
                rows={4}
                required
                value={annBody}
                onChange={(e) => setAnnBody(e.target.value)}
                placeholder="Write the full circular or directive for students, parents, and staff..."
                className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm"
              />
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={annPinned}
                  onChange={(e) => setAnnPinned(e.target.checked)}
                  className="w-4 h-4 accent-[#7A1224]"
                />
                <span>Pin to Home Strip</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={annUrgent}
                  onChange={(e) => setAnnUrgent(e.target.checked)}
                  className="w-4 h-4 accent-[#7A1224]"
                />
                <span>Mark as Urgent</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] py-2.5 px-5 rounded-xl bg-[#7A1224] hover:bg-[#600E1C] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>Publish Announcement</span>
            </button>
          </form>

          {/* Existing Announcements List */}
          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
              Active Announcements ({announcements.length})
            </h2>
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {a.isUrgent && (
                        <span className="font-bold text-red-700 dark:text-red-400">[URGENT]</span>
                      )}
                      {a.isPinned && (
                        <span className="font-bold text-[#7A1224] dark:text-amber-400">
                          [PINNED]
                        </span>
                      )}
                      <span className="text-stone-500">{a.author}</span>
                    </div>
                    <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                      {a.title}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400">{a.body}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onTogglePinAnnouncement(a.id)}
                      className="min-h-[34px] px-3 py-1 rounded-lg border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer"
                    >
                      {a.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteAnnouncement(a.id)}
                      className="min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Post Live Update Form */}
      {activeTab === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handlePostLiveUpdate}
            className="lg:col-span-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 space-y-4"
          >
            <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
              <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                Post Live Venue Update
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Appears immediately in the Live Feed and on the target Event page with a LIVE badge
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Choose Event *</label>
              <select
                value={luEventId}
                onChange={(e) => setLuEventId(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">Update Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'score', label: 'Score' },
                    { id: 'schedule', label: 'Schedule change' },
                    { id: 'highlight', label: 'Highlight' },
                    { id: 'alert', label: 'Alert' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLuType(item.id)}
                    className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      luType === item.id
                        ? 'bg-[#7A1224] text-amber-200 border-[#7A1224] dark:bg-amber-400 dark:text-stone-950 dark:border-amber-400'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Headline *</label>
              <input
                type="text"
                required
                value={luHeadline}
                onChange={(e) => setLuHeadline(e.target.value)}
                placeholder="e.g. Parakrama House breaks U-18 4x400m Relay Record!"
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Score / Standings Summary (Optional)
              </label>
              <input
                type="text"
                value={luScore}
                onChange={(e) => setLuScore(e.target.value)}
                placeholder="e.g. Vijaya 264 pts · Parakrama 258 pts · Gemunu 249 pts"
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Live Update Message *</label>
              <textarea
                rows={3}
                required
                value={luMessage}
                onChange={(e) => setLuMessage(e.target.value)}
                placeholder="Enter detailed live commentary, schedule adjustment, or venue alert..."
                className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] py-2.5 px-5 rounded-xl bg-[#7A1224] hover:bg-[#600E1C] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Broadcast Live Update Now</span>
            </button>
          </form>

          {/* Instant Live Preview Stream */}
          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[11px] font-bold tracking-wider uppercase animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  LIVE
                </span>
                <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                  Real-Time Broadcast Stream ({liveUpdates.length})
                </h2>
              </div>
              <span className="text-xs text-stone-500">Click any event to inspect on page</span>
            </div>

            <div className="space-y-3">
              {liveUpdates.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-2 transition-all duration-300 bg-stone-50/50 dark:bg-stone-950/40"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-600/15 text-red-700 dark:text-red-300 font-bold text-[10px] uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                        LIVE · {item.type}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectEvent(item.eventId)}
                        className="font-semibold text-[#7A1224] dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{item.eventTitle}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-mono tabular-nums text-stone-500">
                      {new Date(item.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                    {item.headline}
                  </h3>
                  {item.scoreSummary && (
                    <div className="font-mono tabular-nums text-xs font-bold text-[#7A1224] dark:text-amber-300 bg-white dark:bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-200/70 dark:border-stone-800">
                      {item.scoreSummary}
                    </div>
                  )}
                  <p className="text-xs text-stone-600 dark:text-stone-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Registrations Table per Event with Search & Export CSV */}
      {activeTab === 'registrations' && (
        <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                Event Registrations Roster
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Filter by event, search attendees, verify check-in status, or export to CSV
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                aria-label="Select event for registrations table"
                value={regEventFilter}
                onChange={(e) => setRegEventFilter(e.target.value)}
                className="min-h-[40px] px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs font-semibold"
              >
                <option value="all">All School Events ({tickets.length})</option>
                {events.map((ev) => {
                  const cnt = tickets.filter((t) => t.eventId === ev.id).length;
                  return (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({cnt})
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={() =>
                  exportRegistrationsToCsv(filteredRegistrations, events, regEventFilter)
                }
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#7A1224] hover:bg-[#600E1C] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV ({filteredRegistrations.length})</span>
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={regSearch}
              onChange={(e) => setRegSearch(e.target.value)}
              placeholder="Search registrations by Ticket Code (RCP-XXXX-XXXX), Name, Email, Phone, or Grade..."
              className="w-full min-h-[42px] pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-sm"
            />
          </div>

          {/* High-Density Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-semibold">
                  <th className="py-3 px-3">Ticket Code</th>
                  <th className="py-3 px-3">Attendee</th>
                  <th className="py-3 px-3">Role & Grade</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Event</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Check-In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-500">
                      No registrations match the current event filter and search query.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((t) => {
                    const ev = events.find((e) => e.id === t.eventId);
                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-stone-50/80 dark:hover:bg-stone-950/50 transition-colors"
                      >
                        <td className="py-3 px-3 font-mono tabular-nums font-bold text-[#7A1224] dark:text-amber-300 whitespace-nowrap">
                          {t.ticketCode}
                        </td>
                        <td className="py-3 px-3 font-semibold text-stone-900 dark:text-stone-100">
                          {t.attendeeName}
                        </td>
                        <td className="py-3 px-3 text-stone-600 dark:text-stone-400">
                          {t.attendeeRole} · {t.gradeOrRoleDetail}
                        </td>
                        <td className="py-3 px-3 text-stone-600 dark:text-stone-400">
                          <div>{t.email}</div>
                          <div className="font-mono tabular-nums text-[11px] text-stone-500">
                            {t.phone}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-stone-700 dark:text-stone-300 max-w-[200px] truncate">
                          {ev ? ev.title : t.eventId}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-semibold ${
                              t.status === 'Confirmed'
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          {t.checkedIn ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Checked In</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={t.status === 'Waitlisted'}
                              onClick={() => performCheckIn(t.ticketCode)}
                              className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-[#7A1224] hover:text-amber-200 disabled:opacity-40 text-stone-700 dark:text-stone-300 font-semibold transition-colors cursor-pointer"
                            >
                              Check In
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Gate Check-In Page (Manual RCP Input + html5-qrcode Camera Scanner) */}
      {activeTab === 'checkin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                Gate Pass Verification & Check-In
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Enter or paste a ticket code (RCP-XXXX-XXXX) or scan the attendee’s QR pass via
                camera
              </p>
            </div>

            <form onSubmit={handleManualCheckInSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <QrCode className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={ticketCodeInput}
                  onChange={(e) => setTicketCodeInput(e.target.value)}
                  placeholder="Enter Ticket Code (e.g. RCP-8492-VJ12)"
                  aria-label="Enter or paste ticket code"
                  className="w-full min-h-[46px] pl-10 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 font-mono text-sm uppercase text-stone-900 dark:text-stone-100 focus:outline-2 focus:outline-[#7A1224]"
                />
              </div>
              <button
                type="submit"
                className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#7A1224] hover:bg-[#600E1C] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold whitespace-nowrap cursor-pointer"
              >
                Verify & Check In
              </button>
            </form>

            {/* Quick-Fill Test Codes for Immediate Testing */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                Quick-Fill Active Ticket Codes (Click to test):
              </p>
              {tickets.length === 0 ? (
                <p className="text-xs text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 rounded-xl px-3 py-2">
                  0 passes issued so far. Register for any event to generate a live{' '}
                  <span className="font-mono font-semibold text-[#7A1224] dark:text-amber-400">
                    RCP-XXXX-XXXX
                  </span>{' '}
                  pass chip here for one-click gate verification.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {tickets.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTicketCodeInput(t.ticketCode);
                        performCheckIn(t.ticketCode);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs font-mono hover:border-[#7A1224] cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="font-bold text-[#7A1224] dark:text-amber-300">
                        {t.ticketCode}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        ({t.attendeeName.split(' ')[0]} ·{' '}
                        {t.checkedIn ? 'Checked In' : t.status})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Camera QR Scanner Toggle (html5-qrcode) */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Optical Camera QR Scanner
                </span>
                {cameraActive ? (
                  <button
                    type="button"
                    onClick={stopCameraScanner}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Stop Camera</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startCameraScanner}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Launch Camera QR Scan</span>
                  </button>
                )}
              </div>

              {cameraActive && (
                <div
                  id="ac-synapse-qr-reader"
                  className="w-full rounded-xl overflow-hidden border border-stone-300 dark:border-stone-700 bg-black min-h-[240px]"
                />
              )}

              {cameraError && (
                <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 p-3 rounded-xl">
                  {cameraError}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Green Success / Red Invalid Result Card */}
          <div className="lg:col-span-6 space-y-5">
            {checkInResult ? (
              <div
                role="status"
                aria-live="polite"
                className={`rounded-2xl border-2 p-6 space-y-4 transition-all ${
                  checkInResult.ok
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-950 dark:text-emerald-100'
                    : 'bg-red-50 dark:bg-red-950/50 border-red-500 text-red-950 dark:text-red-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  {checkInResult.ok ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 shrink-0" />
                  )}
                  <div>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        checkInResult.ok
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}
                    >
                      {checkInResult.ok ? 'Check-In Verified · Access Granted' : 'Check-In Failed'}
                    </span>
                    <h3 className="font-display text-xl font-bold mt-0.5">
                      {checkInResult.ticket
                        ? checkInResult.ticket.attendeeName
                        : 'Invalid Ticket Code'}
                    </h3>
                    <p className="text-xs sm:text-sm mt-1 opacity-90">{checkInResult.message}</p>
                  </div>
                </div>

                {checkInResult.ticket && (
                  <div className="pt-3 border-t border-black/10 dark:border-white/10 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="opacity-70 block">Ticket Code</span>
                      <span className="font-mono font-bold">
                        {checkInResult.ticket.ticketCode}
                      </span>
                    </div>
                    <div>
                      <span className="opacity-70 block">Role & Grade</span>
                      <span className="font-semibold">
                        {checkInResult.ticket.attendeeRole} ·{' '}
                        {checkInResult.ticket.gradeOrRoleDetail}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="opacity-70 block">Event & Enclosure</span>
                      <span className="font-semibold">
                        {checkInResult.event?.title} ({checkInResult.ticket.seatSection})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 text-center space-y-2">
                <QrCode className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                  Ready for Gate Check-In
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Enter a ticket code on the left or click one of the quick-fill chips to verify
                  an attendee’s pass.
                </p>
              </div>
            )}

            {/* Recently Checked-In Attendees */}
            <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 space-y-3">
              <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                Checked-In Attendees ({checkedInCount})
              </h3>
              {checkedInCount === 0 ? (
                <p className="text-xs text-stone-500">No attendees checked in yet.</p>
              ) : (
                <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                  {tickets
                    .filter((t) => t.checkedIn)
                    .map((t) => (
                      <div key={t.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            {t.attendeeName}
                          </span>{' '}
                          <span className="text-stone-500">({t.gradeOrRoleDetail})</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {t.ticketCode}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
