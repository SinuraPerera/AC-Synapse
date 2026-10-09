import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  MapPin,
  Trash2,
  Download,
  Compass,
  ShieldCheck,
  User,
  Clock,
  Mail,
  Phone,
  ImageDown,
  Maximize2,
  X,
  Copy,
  Check,
  QrCode,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { SchoolEvent, Ticket } from '../types';
import { downloadEventICS } from '../lib/calendarUtils';
import { downloadTicketCardAsPng } from '../lib/ticketUtils';
import { useI18n } from '../lib/i18n';
import { useFocusTrap } from '../lib/useFocusTrap';

interface MyTicketsPageProps {
  tickets: Ticket[];
  events: SchoolEvent[];
  onCancelTicket: (ticketId: string) => void;
  onSelectEvent: (eventId: string) => void;
  onBrowseEvents: () => void;
}

export const MyTicketsPage: React.FC<MyTicketsPageProps> = ({
  tickets,
  events,
  onCancelTicket,
  onSelectEvent,
  onBrowseEvents,
}) => {
  const { t } = useI18n();
  const [confirmingCancelId, setConfirmingCancelId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [fullscreenTicketId, setFullscreenTicketId] = useState<string | null>(null);
  const [copiedTicketId, setCopiedTicketId] = useState<string | null>(null);
  const qrContainerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fullscreenModalRef = useFocusTrap<HTMLDivElement>(Boolean(fullscreenTicketId), () =>
    setFullscreenTicketId(null)
  );

  const handleCopyTicketCode = async (ticket: Ticket) => {
    try {
      await navigator.clipboard.writeText(ticket.ticketCode);
      setCopiedTicketId(ticket.id);
      window.setTimeout(() => {
        setCopiedTicketId((prev) => (prev === ticket.id ? null : prev));
      }, 2000);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  const fullscreenTicket = tickets.find((tk) => tk.id === fullscreenTicketId) || null;
  const fullscreenEvent = fullscreenTicket
    ? events.find((e) => e.id === fullscreenTicket.eventId) || null
    : null;

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleDownloadPng = async (ticket: Ticket, event: SchoolEvent) => {
    setDownloadingId(ticket.id);
    try {
      const container = qrContainerRefs.current[ticket.id];
      const svgEl = container ? container.querySelector('svg') : null;
      await downloadTicketCardAsPng(ticket, event, svgEl);
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmedCount = tickets.filter((t) => t.status === 'Confirmed').length;
  const waitlistedCount = tickets.filter((t) => t.status === 'Waitlisted').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            {t.ticketsTitle}
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            {t.ticketsSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums font-semibold">
          <span className="text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl">
            {confirmedCount} {t.confirmed}
          </span>
          {waitlistedCount > 0 && (
            <span className="text-amber-800 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 rounded-xl">
              {waitlistedCount} {t.waitlisted}
            </span>
          )}
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-xs max-w-3xl mx-auto my-6">
          <div className="bg-gradient-to-r from-[#5A0D1B] via-[#7A1224] to-[#3B0811] px-6 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-400/30">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                <QrCode className="w-6 h-6" aria-label="QR Gate Pass icon" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/90 block">
                  Ananda College · Digital Pass Wallet
                </span>
                <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                  {t.noTicketsYet} (0 Passes Issued)
                </h2>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/30 border border-amber-400/30 text-amber-200 text-xs font-mono shrink-0 self-start sm:self-auto">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-label="Instant QR generation" />
              <span>Instant RCP-XXXX-XXXX Pass</span>
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl">
              Your digital pass wallet starts at <strong>0 tickets</strong>. Register for any upcoming Ananda College sporting encounter, parliamentary debate final, science exhibition, or parents’ consultation to receive an instant QR entry pass with PNG &amp; iCalendar export.
            </p>

            {/* Quick-jump featured events so judges/users can claim their first pass in 1 click */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Recommended Upcoming Events for Immediate Registration:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {events.slice(0, 2).map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => onSelectEvent(ev.id)}
                    className="text-left p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/60 hover:border-[#7A1224] dark:hover:border-amber-400 transition-all group cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A1224] dark:text-amber-400 font-semibold block">
                        {ev.category} · {ev.venue}
                      </span>
                      <p className="font-display text-sm font-bold text-stone-900 dark:text-stone-100 truncate mt-0.5 group-hover:text-[#7A1224] dark:group-hover:text-amber-300">
                        {ev.title}
                      </p>
                    </div>
                    <ArrowRight
                      className="w-4 h-4 text-stone-400 group-hover:text-[#7A1224] dark:group-hover:text-amber-300 shrink-0 group-hover:translate-x-0.5 transition-transform"
                      aria-label="Open event details"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onBrowseEvents}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#7A1224] hover:bg-[#600E1C] text-amber-200 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-stone-950 text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <Compass className="w-4 h-4" aria-label="Browse events icon" />
                <span>{t.browseAllEvents}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tickets.map((ticket) => {
            const event = events.find((e) => e.id === ticket.eventId);
            if (!event) return null;

            const isWaitlisted = ticket.status === 'Waitlisted';

            // Compute waitlist queue position if waitlisted
            const eventWaitlist = tickets
              .filter((t) => t.eventId === event.id && t.status === 'Waitlisted')
              .sort(
                (a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime()
              );
            const waitlistPosition =
              eventWaitlist.findIndex((t) => t.id === ticket.id) + 1;

            return (
              <article
                key={ticket.id}
                className={`relative rounded-2xl bg-white dark:bg-stone-900 border overflow-hidden flex flex-col sm:flex-row shadow-xs hover:shadow-md transition-all ${
                  isWaitlisted
                    ? 'border-amber-400/70 dark:border-amber-500/50'
                    : 'border-stone-200 dark:border-stone-800'
                }`}
              >
                {/* Left QR Stub — QR Code encodes the unique RCP-XXXX-XXXX code */}
                <div className="relative bg-gradient-to-b from-[#5A0D1B] via-[#4A0A16] to-[#2D070E] text-white p-6 flex flex-col items-center justify-center gap-3 sm:w-52 shrink-0 border-b sm:border-b-0 sm:border-r border-dashed border-amber-400/40">
                  {/* Perforation Punch-out Notches */}
                  <span
                    aria-hidden="true"
                    className="hidden sm:block absolute -top-3 -right-3 w-6 h-6 rounded-full bg-[#FAF8F5] dark:bg-[#0D0B0E] border border-stone-200 dark:border-stone-800"
                  />
                  <span
                    aria-hidden="true"
                    className="hidden sm:block absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-[#FAF8F5] dark:bg-[#0D0B0E] border border-stone-200 dark:border-stone-800"
                  />
                  <div
                    ref={(el) => {
                      qrContainerRefs.current[ticket.id] = el;
                    }}
                    className="p-3 rounded-2xl bg-white shadow-lg ring-2 ring-amber-400/40"
                  >
                    <QRCodeSVG
                      value={ticket.ticketCode}
                      size={128}
                      bgColor="#FFFFFF"
                      fgColor="#2D070E"
                      level="M"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-amber-300/80">
                      {t.uniqueTicketCode}
                    </p>
                    <p className="font-mono tabular-nums text-xs font-bold text-amber-300 mt-0.5">
                      {ticket.ticketCode}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopyTicketCode(ticket)}
                        title="Copy pass code"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-amber-200 transition-colors cursor-pointer"
                      >
                        {copiedTicketId === ticket.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFullscreenTicketId(ticket.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-amber-200 transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Gate Scan</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Ticket Details */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        {isWaitlisted ? (
                          <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                            <Clock className="w-3.5 h-3.5" aria-label="Waitlisted status icon" />
                            <span>Waitlisted · Queue #{waitlistPosition}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" aria-label="Confirmed pass icon" />
                            <span>Confirmed Seat Pass</span>
                          </span>
                        )}
                        {ticket.checkedIn && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                            <Check className="w-3 h-3" aria-label="Checked in icon" />
                            <span>Checked In at Gate</span>
                          </span>
                        )}
                      </div>
                      <span className="text-stone-500 dark:text-stone-400 font-medium">
                        {event.category}
                      </span>
                    </div>

                    <h2
                      onClick={() => onSelectEvent(event.id)}
                      className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 hover:text-[#7A1224] dark:hover:text-amber-300 cursor-pointer leading-snug"
                    >
                      {event.title}
                    </h2>

                    <div className="space-y-1.5 pt-1 text-xs text-stone-600 dark:text-stone-400">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400 shrink-0" />
                        <span>
                          <strong className="text-stone-900 dark:text-stone-200">
                            {ticket.attendeeName}
                          </strong>{' '}
                          ({ticket.attendeeRole}) · {ticket.gradeOrRoleDetail}
                          {ticket.houseName ? ` · ${ticket.houseName} House` : ''}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400 shrink-0" />
                          <span>{ticket.email}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                          <Phone className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400 shrink-0" />
                          <span>{ticket.phone}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400 shrink-0" />
                        <span className="font-mono tabular-nums">
                          {formatDateTime(event.startDate)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400 shrink-0" />
                        <span>
                          {event.venue} · {ticket.seatSection}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Actions: Download Ticket PNG, .ics, and Cancel */}
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={downloadingId === ticket.id}
                        onClick={() => handleDownloadPng(ticket, event)}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#7A1224] hover:bg-[#600E1C] text-amber-200 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-stone-950 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <ImageDown className="w-3.5 h-3.5" />
                        <span>
                          {downloadingId === ticket.id ? 'Saving PNG...' : 'Download Ticket'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadEventICS(event)}
                        title="Download iCalendar (.ics) file"
                        className="min-h-[38px] px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>.ics</span>
                      </button>
                    </div>

                    {confirmingCancelId === ticket.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmingCancelId(null)}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 cursor-pointer"
                        >
                          Keep
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onCancelTicket(ticket.id);
                            setConfirmingCancelId(null);
                          }}
                          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                        >
                          Confirm Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingCancelId(ticket.id)}
                        className="min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Fullscreen High-Brightness Gate Scanner Modal */}
      {fullscreenTicket && fullscreenEvent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen Gate Pass Scanner View"
          onClick={() => setFullscreenTicketId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
        >
          <div
            ref={fullscreenModalRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#5A0D1B] via-[#3B0811] to-[#1D0408] border border-amber-400/40 p-6 text-white text-center space-y-5 shadow-2xl focus:outline-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-300">
                Ananda College · Gate Pass
              </span>
              <button
                type="button"
                data-autofocus="true"
                onClick={() => setFullscreenTicketId(null)}
                aria-label="Close fullscreen pass"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
              >
                <X className="w-4 h-4" aria-label="Close fullscreen modal icon" />
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-white inline-block mx-auto shadow-2xl ring-4 ring-amber-400/50">
              <QRCodeSVG
                value={fullscreenTicket.ticketCode}
                size={220}
                bgColor="#FFFFFF"
                fgColor="#2D070E"
                level="H"
              />
            </div>

            <div className="space-y-1">
              <p className="font-mono text-lg font-bold tracking-wider text-amber-300">
                {fullscreenTicket.ticketCode}
              </p>
              <h3 className="font-display text-base font-bold text-white leading-snug">
                {fullscreenEvent.title}
              </h3>
              <p className="text-xs text-amber-100/80">{fullscreenEvent.venue}</p>
            </div>

            <div className="rounded-2xl bg-black/35 border border-white/10 p-3 text-xs space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-stone-400">Attendee:</span>
                <span className="font-semibold text-white">{fullscreenTicket.attendeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Role / Section:</span>
                <span className="font-semibold text-amber-200">
                  {fullscreenTicket.attendeeRole} · {fullscreenTicket.gradeOrRoleDetail}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Pass Status:</span>
                <span className="font-bold text-emerald-400">
                  {fullscreenTicket.checkedIn ? 'Checked In at Gate' : fullscreenTicket.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
