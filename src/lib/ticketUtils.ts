import { SchoolEvent, Ticket } from '../types';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomBlock(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return result;
}

/**
 * Generates a unique ticket code matching RCP-XXXX-XXXX
 */
export function generateUniqueTicketCode(existingTickets: Ticket[]): string {
  const existingCodes = new Set(existingTickets.map((t) => t.ticketCode.toUpperCase()));
  let candidate = '';
  do {
    candidate = `RCP-${randomBlock(4)}-${randomBlock(4)}`;
  } while (existingCodes.has(candidate));
  return candidate;
}

/**
 * Checks whether two time intervals [startA, endA] and [startB, endB] overlap.
 */
export function doEventsOverlap(eventA: SchoolEvent, eventB: SchoolEvent): boolean {
  if (eventA.id === eventB.id) return false;
  const startA = new Date(eventA.startDate).getTime();
  const endA = new Date(eventA.endDate).getTime();
  const startB = new Date(eventB.startDate).getTime();
  const endB = new Date(eventB.endDate).getTime();
  return startA < endB && endA > startB;
}

/**
 * Finds all events the user is already registered for that overlap in time with targetEvent.
 * Checks tickets matching the entered email (or any active ticket if email matches).
 */
export function findClashingRegistrations(
  targetEvent: SchoolEvent,
  email: string,
  tickets: Ticket[],
  events: SchoolEvent[]
): { event: SchoolEvent; ticket: Ticket }[] {
  const normalizedEmail = email.trim().toLowerCase();
  const userTickets = tickets.filter((t) => {
    if (t.eventId === targetEvent.id) return false;
    if (!normalizedEmail) return true;
    return t.email.trim().toLowerCase() === normalizedEmail;
  });

  const clashes: { event: SchoolEvent; ticket: Ticket }[] = [];
  for (const t of userTickets) {
    const otherEvt = events.find((e) => e.id === t.eventId);
    if (otherEvt && doEventsOverlap(targetEvent, otherEvt)) {
      clashes.push({ event: otherEvt, ticket: t });
    }
  }
  return clashes;
}

/**
 * Helper to wrap text onto an HTML5 2D canvas context
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lineCount++;
      if (lineCount >= maxLines) {
        ctx.fillText(line.trim() + '…', x, currentY);
        return currentY + lineHeight;
      }
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

/**
 * Renders the ticket card (including its QR code SVG) onto a high-DPI canvas and saves it as a PNG.
 */
export async function downloadTicketCardAsPng(
  ticket: Ticket,
  event: SchoolEvent,
  qrSvgElement: SVGSVGElement | null
): Promise<void> {
  const width = 1080;
  const height = 460;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Background Card Fill
  ctx.fillStyle = '#FAF8F5';
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 28);
  ctx.fill();

  // 2. Left QR Stub Panel (Deep Maroon Gradient)
  const stubWidth = 340;
  const stubGrad = ctx.createLinearGradient(0, 0, 0, height);
  stubGrad.addColorStop(0, '#6B1020');
  stubGrad.addColorStop(1, '#2D070E');
  ctx.fillStyle = stubGrad;
  ctx.beginPath();
  ctx.roundRect(0, 0, stubWidth, height, [28, 0, 0, 28]);
  ctx.fill();

  // Gold dashed perforation line
  ctx.save();
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(stubWidth, 24);
  ctx.lineTo(stubWidth, height - 24);
  ctx.stroke();
  ctx.restore();

  // Draw QR Code white box on stub
  const qrBoxSize = 220;
  const qrBoxX = (stubWidth - qrBoxSize) / 2;
  const qrBoxY = 58;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20);
  ctx.fill();

  // Render SVG QR Code into the white box
  if (qrSvgElement) {
    const svgData = new XMLSerializer().serializeToString(qrSvgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, qrBoxX + 18, qrBoxY + 18, qrBoxSize - 36, qrBoxSize - 36);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      img.src = url;
    });
  }

  // Ticket Code below QR box
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(253, 230, 138, 0.85)';
  ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('UNIQUE PASS CODE', stubWidth / 2, qrBoxY + qrBoxSize + 38);

  ctx.fillStyle = '#FCD34D';
  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.fillText(ticket.ticketCode, stubWidth / 2, qrBoxY + qrBoxSize + 68);

  // Status Indicator on Stub
  const isWaitlisted = ticket.status === 'Waitlisted';
  ctx.fillStyle = isWaitlisted ? '#F59E0B' : '#10B981';
  ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    isWaitlisted ? 'STATUS: WAITLISTED' : 'STATUS: CONFIRMED PASS',
    stubWidth / 2,
    qrBoxY + qrBoxSize + 102
  );

  // 3. Right Side Event & Attendee Information
  const contentX = stubWidth + 44;
  const maxContentW = width - contentX - 44;
  ctx.textAlign = 'left';

  // Header Kicker
  ctx.fillStyle = '#7A1224';
  ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('ANANDA COLLEGE · AC SYNAPSE DIGITAL COMMAND CENTER', contentX, 54);

  // Category & Status Line
  ctx.fillStyle = '#57534E';
  ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${event.category.toUpperCase()}  ·  ${ticket.status.toUpperCase()}`, contentX, 80);

  // Event Title
  ctx.fillStyle = '#1C1917';
  ctx.font = '700 28px Georgia, serif';
  const nextY = drawWrappedText(ctx, event.title, contentX, 122, maxContentW, 36, 2);

  // Divider line
  ctx.strokeStyle = '#E7E5E4';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(contentX, nextY + 6);
  ctx.lineTo(width - 44, nextY + 6);
  ctx.stroke();

  // Details Grid
  const detailStartY = nextY + 38;
  const col2X = contentX + 330;

  // Attendee Name & Role
  ctx.fillStyle = '#78716C';
  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('ATTENDEE & ROLE', contentX, detailStartY);
  ctx.fillStyle = '#1C1917';
  ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${ticket.attendeeName} (${ticket.attendeeRole})`, contentX, detailStartY + 24);
  ctx.fillStyle = '#57534E';
  ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(ticket.gradeOrRoleDetail, contentX, detailStartY + 44);

  // Contact Details
  ctx.fillStyle = '#78716C';
  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('CONTACT INFORMATION', col2X, detailStartY);
  ctx.fillStyle = '#1C1917';
  ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(ticket.email, col2X, detailStartY + 24);
  ctx.fillStyle = '#57534E';
  ctx.font = '500 13px "JetBrains Mono", monospace';
  ctx.fillText(ticket.phone, col2X, detailStartY + 44);

  // Date & Venue Row
  const row2Y = detailStartY + 86;
  const formattedDate = new Date(event.startDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  ctx.fillStyle = '#78716C';
  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('DATE & COMMENCEMENT', contentX, row2Y);
  ctx.fillStyle = '#1C1917';
  ctx.font = '600 15px "JetBrains Mono", monospace';
  ctx.fillText(formattedDate, contentX, row2Y + 24);

  ctx.fillStyle = '#78716C';
  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('CAMPUS VENUE & ENCLOSURE', col2X, row2Y);
  ctx.fillStyle = '#1C1917';
  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(event.venue, col2X, row2Y + 24);
  ctx.fillStyle = '#7A1224';
  ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(ticket.seatSection, col2X, row2Y + 44);

  // Outer Border
  ctx.strokeStyle = '#7A1224';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(2, 2, width - 4, height - 4, 26);
  ctx.stroke();

  // Trigger PNG download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${ticket.ticketCode}-ananda-college-pass.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports a list of ticket registrations to a downloadable CSV file.
 */
export function exportRegistrationsToCsv(
  tickets: Ticket[],
  events: SchoolEvent[],
  selectedEventId: string
): void {
  const eventMap = new Map(events.map((e) => [e.id, e]));
  const escapeCsvCell = (val: string | number | boolean | undefined) => {
    const str = val === undefined || val === null ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = [
    'Ticket Code',
    'Attendee Name',
    'Role',
    'Grade / Department',
    'Email',
    'Phone',
    'House',
    'Event Title',
    'Venue',
    'Seat Section',
    'Status',
    'Checked In',
    'Checked In At',
    'Registered At',
  ];

  const rows = tickets.map((t) => {
    const ev = eventMap.get(t.eventId);
    return [
      t.ticketCode,
      t.attendeeName,
      t.attendeeRole,
      t.gradeOrRoleDetail,
      t.email,
      t.phone,
      t.houseName || '',
      ev ? ev.title : t.eventId,
      ev ? ev.venue : '',
      t.seatSection,
      t.status,
      t.checkedIn ? 'Yes' : 'No',
      t.checkedInAt ? new Date(t.checkedInAt).toLocaleString() : '',
      new Date(t.registeredAt).toLocaleString(),
    ].map(escapeCsvCell);
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const targetEvent = eventMap.get(selectedEventId);
  const slug = targetEvent
    ? targetEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : 'all-events';
  link.href = url;
  link.setAttribute('download', `ac-synapse-registrations-${slug}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

