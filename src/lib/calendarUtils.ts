import { SchoolEvent } from '../types';

/**
 * Formats a Date object into the compact UTC string required by Google Calendar and iCalendar (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(isoDateString: string): string {
  const date = new Date(isoDateString);
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Builds a direct Google Calendar template URL for an Ananda College event.
 */
export function getGoogleCalendarUrl(event: SchoolEvent): string {
  const start = formatICSDate(event.startDate);
  const end = formatICSDate(event.endDate);
  const details = `${event.description}\n\nOrganized by: ${event.organizer}\nVenue: ${event.venue}, Ananda College, Colombo 10`;
  const location = `${event.venue}, Ananda College, Maradana Rd, Colombo 10, Sri Lanka`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[AC Synapse] ${event.title}`,
    dates: `${start}/${end}`,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates and triggers a browser download of an RFC 5545 compliant .ics calendar file.
 */
export function downloadEventICS(event: SchoolEvent): void {
  const uid = `${event.id}@synapse.anandacollege.edu.lk`;
  const dtStamp = formatICSDate(new Date().toISOString());
  const dtStart = formatICSDate(event.startDate);
  const dtEnd = formatICSDate(event.endDate);
  const escapedDesc = event.description
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ananda College Colombo//AC Synapse Command Center//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.title} — Ananda College`,
    `DESCRIPTION:${escapedDesc}\\n\\nOrganizer: ${event.organizer}`,
    `LOCATION:${event.venue}\\, Ananda College\\, Colombo 10`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([icsLines.join('\r\n')], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeSlug = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  link.setAttribute('download', `ananda-college-${safeSlug}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
