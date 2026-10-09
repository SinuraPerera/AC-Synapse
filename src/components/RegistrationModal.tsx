import React, { useEffect, useState } from 'react';
import {
  X,
  Ticket as TicketIcon,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { AttendeeRole, SchoolEvent, Ticket } from '../types';
import { findClashingRegistrations } from '../lib/ticketUtils';
import { useFocusTrap } from '../lib/useFocusTrap';

interface RegistrationModalProps {
  event: SchoolEvent | null;
  tickets: Ticket[];
  allEvents: SchoolEvent[];
  onClose: () => void;
  onConfirmRegistration: (
    ticketData: Omit<Ticket, 'id' | 'ticketCode' | 'registeredAt' | 'status'>
  ) => void;
}

interface FieldErrors {
  attendeeName?: string;
  gradeOrRoleDetail?: string;
  email?: string;
  phone?: string;
  duplicate?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_DIGITS_REGEX = /^\+?[\d\s()-]{9,16}$/;

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  event,
  tickets,
  allEvents,
  onClose,
  onConfirmRegistration,
}) => {
  const modalRef = useFocusTrap<HTMLDivElement>(Boolean(event), onClose);

  const [attendeeName, setAttendeeName] = useState('Kavindu Senanayake');
  const [attendeeRole, setAttendeeRole] = useState<AttendeeRole>('Student');
  const [gradeOrRoleDetail, setGradeOrRoleDetail] = useState('Grade 12-B (Physical Science)');
  const [email, setEmail] = useState('kavindu.s@anandacollege.edu.lk');
  const [phone, setPhone] = useState('0774582910');
  const [houseName, setHouseName] = useState<'Vijaya' | 'Gemunu' | 'Parakrama' | 'Ashoka'>(
    'Vijaya'
  );
  const [seatSection, setSeatSection] = useState('Main Pavilion · Maroon Enclosure');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [clashAcknowledged, setClashAcknowledged] = useState(false);

  useEffect(() => {
    setErrors({});
    setClashAcknowledged(false);
  }, [event]);

  if (!event) return null;

  const seatsLeft = Math.max(0, event.totalSeats - event.registeredCount);
  const isFull = seatsLeft === 0;
  const waitlistCount = tickets.filter(
    (t) => t.eventId === event.id && t.status === 'Waitlisted'
  ).length;

  // Detect schedule clashes in real time for the entered email (or active user tickets)
  const clashes = findClashingRegistrations(event, email, tickets, allEvents);

  // Check if duplicate email + event already exists
  const existingDuplicateTicket = tickets.find(
    (t) =>
      t.eventId === event.id &&
      t.email.trim().toLowerCase() === email.trim().toLowerCase()
  );

  const handleRoleChange = (newRole: AttendeeRole) => {
    setAttendeeRole(newRole);
    if (newRole === 'Student' && !gradeOrRoleDetail.toLowerCase().includes('grade')) {
      setGradeOrRoleDetail('Grade 12-B (Physical Science)');
    } else if (newRole === 'Parent' && !gradeOrRoleDetail.toLowerCase().includes('parent')) {
      setGradeOrRoleDetail('Parent of Grade 10-A Student');
    } else if (newRole === 'Teacher') {
      setGradeOrRoleDetail('Senior Academic Faculty · Science Section');
    }
  };

  const validateFields = (): boolean => {
    const nextErrors: FieldErrors = {};
    const trimmedName = attendeeName.trim();
    const trimmedGrade = gradeOrRoleDetail.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const digitCount = trimmedPhone.replace(/\D/g, '').length;

    if (trimmedName.length < 3) {
      nextErrors.attendeeName = 'Please enter your full name (at least 3 characters).';
    }

    if (trimmedGrade.length < 2) {
      nextErrors.gradeOrRoleDetail =
        attendeeRole === 'Teacher'
          ? 'Please enter your department or subject specialization.'
          : 'Please specify the student grade and class section (e.g. Grade 12-B).';
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = 'Please enter a valid email address (e.g. name@anandacollege.edu.lk).';
    }

    if (!PHONE_DIGITS_REGEX.test(trimmedPhone) || digitCount < 9 || digitCount > 15) {
      nextErrors.phone = 'Please enter a valid phone number (9–15 digits, e.g. 0774582910).';
    }

    if (existingDuplicateTicket) {
      nextErrors.duplicate = `This email (${trimmedEmail}) is already registered for "${event.title}" with pass code ${existingDuplicateTicket.ticketCode} (${existingDuplicateTicket.status}). Duplicate registrations for the same email and event are not permitted.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;

    // Require explicit acknowledgment if a schedule clash exists
    if (clashes.length > 0 && !clashAcknowledged) {
      setClashAcknowledged(true);
      return;
    }

    onConfirmRegistration({
      eventId: event.id,
      attendeeName: attendeeName.trim(),
      attendeeRole,
      gradeOrRoleDetail: gradeOrRoleDetail.trim(),
      email: email.trim(),
      phone: phone.trim(),
      houseName,
      seatSection,
    });
  };

  const formatTimeWindow = (startIso: string, endIso: string) => {
    const s = new Date(startIso);
    const e = new Date(endIso);
    return `${s.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} · ${s.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })} – ${e.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reg-modal-title"
      aria-describedby="reg-modal-subtitle"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-t-3xl sm:rounded-2xl bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl max-h-[92vh] overflow-y-auto focus:outline-none"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <p
              id="reg-modal-subtitle"
              className="text-xs font-semibold text-[#7A1224] dark:text-amber-400"
            >
              {isFull
                ? 'Event at Full Capacity · Official Waitlist Queue'
                : 'Ananda College Event Pass Registration'}
            </p>
            <h2
              id="reg-modal-title"
              className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5"
            >
              {event.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close registration modal"
            className="min-h-[40px] min-w-[40px] rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]"
          >
            <X className="w-5 h-5" aria-label="Close modal icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          {/* Live Capacity & Waitlist Banner */}
          <div
            className={`flex flex-wrap items-center justify-between gap-2 text-xs px-3.5 py-2.5 rounded-xl border ${
              isFull
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                : 'bg-stone-100 dark:bg-stone-800/70 border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            <span>Venue: {event.venue}</span>
            <span className="font-mono tabular-nums font-bold text-[#7A1224] dark:text-amber-300">
              {isFull
                ? `FULL (${event.registeredCount}/${event.totalSeats} seats) · ${waitlistCount} on waitlist`
                : `${event.registeredCount}/${event.totalSeats} seats (${seatsLeft} left)`}
            </span>
          </div>

          {isFull && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Clock
                className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                aria-label="Waitlist queue clock icon"
              />
              <div>
                <span className="font-semibold">Waitlist Auto-Promotion Active:</span> All{' '}
                {event.totalSeats} seats are currently reserved. Your pass will be issued as{' '}
                <strong>Waitlisted</strong> (#{waitlistCount + 1} in queue) and will automatically
                upgrade to <strong>Confirmed</strong> if a confirmed attendee cancels.
              </div>
            </div>
          )}

          {/* Duplicate Registration Error */}
          {errors.duplicate && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-xs text-red-800 dark:text-red-200 flex items-start gap-2.5"
            >
              <AlertTriangle
                className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
                aria-label="Duplicate registration warning icon"
              />
              <span>{errors.duplicate}</span>
            </div>
          )}

          {/* Schedule Clash Warning Banner */}
          {clashes.length > 0 && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-500/70 text-xs text-amber-950 dark:text-amber-100 space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle
                  className="w-4 h-4 shrink-0"
                  aria-label="Schedule clash warning icon"
                />
                <span>Schedule Clash Detected with Your Existing Registrations</span>
              </div>
              <p className="text-amber-900/90 dark:text-amber-200/90">
                This event ({formatTimeWindow(event.startDate, event.endDate)}) overlaps in time
                with:
              </p>
              <ul className="space-y-1 pl-4 list-disc font-medium">
                {clashes.map(({ event: cEvt, ticket: cTkt }) => (
                  <li key={cTkt.id}>
                    <strong>{cEvt.title}</strong> ({formatTimeWindow(cEvt.startDate, cEvt.endDate)}){' '}
                    — Pass <span className="font-mono">{cTkt.ticketCode}</span>
                  </li>
                ))}
              </ul>
              <label className="flex items-center gap-2 pt-1 font-semibold text-amber-900 dark:text-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={clashAcknowledged}
                  onChange={(e) => setClashAcknowledged(e.target.checked)}
                  className="w-4 h-4 accent-[#7A1224]"
                />
                <span>I acknowledge this time overlap and wish to proceed anyway.</span>
              </label>
            </div>
          )}

          {/* Role Selection: Student, Parent, Teacher */}
          <div role="group" aria-labelledby="reg-role-label">
            <span
              id="reg-role-label"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
            >
              Select Role
            </span>
            <div className="grid grid-cols-3 gap-2 p-1 bg-stone-200/70 dark:bg-stone-800 rounded-xl">
              {(['Student', 'Parent', 'Teacher'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={attendeeRole === r}
                  aria-label={`Select role: ${r}`}
                  onClick={() => handleRoleChange(r)}
                  className={`min-h-[40px] py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7A1224] ${
                    attendeeRole === r
                      ? 'bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name & Grade/Role Detail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="reg-full-name"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
              >
                Full Name *
              </label>
              <div className="relative">
                <User
                  className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-label="Full name user icon"
                />
                <input
                  id="reg-full-name"
                  data-autofocus="true"
                  type="text"
                  required
                  aria-invalid={Boolean(errors.attendeeName)}
                  aria-describedby={errors.attendeeName ? 'reg-full-name-error' : undefined}
                  value={attendeeName}
                  onChange={(e) => {
                    setAttendeeName(e.target.value);
                    if (errors.attendeeName) setErrors({ ...errors, attendeeName: undefined });
                  }}
                  placeholder="e.g. Kavindu Senanayake"
                  className={`w-full min-h-[42px] pl-9 pr-3 py-2 rounded-xl border bg-white dark:bg-stone-950 text-sm text-stone-900 dark:text-stone-100 focus:outline-2 focus:outline-[#7A1224] dark:focus:outline-amber-400 ${
                    errors.attendeeName
                      ? 'border-red-500'
                      : 'border-stone-300 dark:border-stone-700'
                  }`}
                />
              </div>
              {errors.attendeeName && (
                <p
                  id="reg-full-name-error"
                  role="alert"
                  className="text-[11px] text-red-600 dark:text-red-400 mt-1"
                >
                  {errors.attendeeName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-grade-role"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
              >
                {attendeeRole === 'Teacher'
                  ? 'Department / Designation *'
                  : attendeeRole === 'Parent'
                  ? 'Child’s Grade & Class *'
                  : 'Grade & Class Section *'}
              </label>
              <input
                id="reg-grade-role"
                type="text"
                required
                aria-invalid={Boolean(errors.gradeOrRoleDetail)}
                aria-describedby={errors.gradeOrRoleDetail ? 'reg-grade-role-error' : undefined}
                value={gradeOrRoleDetail}
                onChange={(e) => {
                  setGradeOrRoleDetail(e.target.value);
                  if (errors.gradeOrRoleDetail)
                    setErrors({ ...errors, gradeOrRoleDetail: undefined });
                }}
                placeholder={
                  attendeeRole === 'Teacher'
                    ? 'e.g. Senior Physics Faculty'
                    : 'e.g. Grade 12-B (Physical Science)'
                }
                className={`w-full min-h-[42px] px-3 py-2 rounded-xl border bg-white dark:bg-stone-950 text-sm text-stone-900 dark:text-stone-100 focus:outline-2 focus:outline-[#7A1224] dark:focus:outline-amber-400 ${
                  errors.gradeOrRoleDetail
                    ? 'border-red-500'
                    : 'border-stone-300 dark:border-stone-700'
                }`}
              />
              {errors.gradeOrRoleDetail && (
                <p
                  id="reg-grade-role-error"
                  role="alert"
                  className="text-[11px] text-red-600 dark:text-red-400 mt-1"
                >
                  {errors.gradeOrRoleDetail}
                </p>
              )}
            </div>
          </div>

          {/* Email & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
              >
                Email Address *
              </label>
              <div className="relative">
                <Mail
                  className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-label="Email address icon"
                />
                <input
                  id="reg-email"
                  type="email"
                  required
                  aria-invalid={Boolean(errors.email || errors.duplicate)}
                  aria-describedby={errors.email ? 'reg-email-error' : undefined}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email || errors.duplicate)
                      setErrors({ ...errors, email: undefined, duplicate: undefined });
                  }}
                  placeholder="student@anandacollege.edu.lk"
                  className={`w-full min-h-[42px] pl-9 pr-3 py-2 rounded-xl border bg-white dark:bg-stone-950 text-sm text-stone-900 dark:text-stone-100 focus:outline-2 focus:outline-[#7A1224] dark:focus:outline-amber-400 ${
                    errors.email || errors.duplicate
                      ? 'border-red-500'
                      : 'border-stone-300 dark:border-stone-700'
                  }`}
                />
              </div>
              {errors.email && (
                <p
                  id="reg-email-error"
                  role="alert"
                  className="text-[11px] text-red-600 dark:text-red-400 mt-1"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-phone"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
              >
                Phone Number *
              </label>
              <div className="relative">
                <Phone
                  className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-label="Phone number icon"
                />
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'reg-phone-error' : undefined}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors({ ...errors, phone: undefined });
                  }}
                  placeholder="0774582910"
                  className={`w-full min-h-[42px] pl-9 pr-3 py-2 rounded-xl border bg-white dark:bg-stone-950 text-sm font-mono text-stone-900 dark:text-stone-100 focus:outline-2 focus:outline-[#7A1224] dark:focus:outline-amber-400 ${
                    errors.phone ? 'border-red-500' : 'border-stone-300 dark:border-stone-700'
                  }`}
                />
              </div>
              {errors.phone && (
                <p
                  id="reg-phone-error"
                  role="alert"
                  className="text-[11px] text-red-600 dark:text-red-400 mt-1"
                >
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* College House & Seating Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="house-select"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
              >
                College House
              </label>
              <select
                id="house-select"
                value={houseName}
                onChange={(e) =>
                  setHouseName(e.target.value as 'Vijaya' | 'Gemunu' | 'Parakrama' | 'Ashoka')
                }
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm text-stone-900 dark:text-stone-100 focus:outline-2 focus:outline-[#7A1224]"
              >
                <option value="Vijaya">Vijaya House</option>
                <option value="Gemunu">Gemunu House</option>
                <option value="Parakrama">Parakrama House</option>
                <option value="Ashoka">Ashoka House</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="seat-section"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
              >
                Preferred Enclosure
              </label>
              <select
                id="seat-section"
                value={seatSection}
                onChange={(e) => setSeatSection(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm text-stone-900 dark:text-stone-100 focus:outline-2 focus:outline-[#7A1224]"
              >
                <option value="Main Pavilion · Maroon Enclosure">
                  Main Pavilion · Maroon Enclosure
                </option>
                <option value="Gold Balcony · Student & Parent Wing">
                  Gold Balcony · Student & Parent Wing
                </option>
                <option value="Ground Floor Front Tier">Ground Floor Front Tier</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              aria-label="Cancel registration and close modal"
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]"
            >
              Cancel
            </button>
            <button
              type="submit"
              aria-label={
                isFull ? 'Join Waitlist and Issue Pass' : 'Confirm Registration and Generate RCP Pass'
              }
              className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224] ${
                isFull
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                  : 'bg-[#7A1224] hover:bg-[#610E1C] text-amber-200 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-stone-950'
              }`}
            >
              <TicketIcon className="w-4 h-4" aria-label="Ticket pass icon" />
              <span>
                {clashes.length > 0 && !clashAcknowledged
                  ? isFull
                    ? 'Acknowledge Clash & Join Waitlist'
                    : 'Acknowledge Clash & Confirm'
                  : isFull
                  ? 'Join Waitlist & Issue Pass'
                  : 'Confirm & Generate RCP Pass'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
