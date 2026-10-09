export type EventCategory =
  | 'Sports'
  | 'Debate'
  | 'Exhibition'
  | 'Academic'
  | 'Cultural'
  | "Parents' Meeting";

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  speakerOrLead?: string;
  locationNote?: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  subtitle: string;
  category: EventCategory;
  description: string;
  venue: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  totalSeats: number;
  registeredCount: number;
  organizer: string;
  imageUrl: string;
  featured?: boolean;
  schedule: ScheduleItem[];
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: EventCategory | 'General';
  createdAt: string; // ISO string
  author: string;
  isUrgent: boolean;
  isPinned: boolean;
  relatedEventId?: string;
}

export type LiveUpdateType = 'score' | 'schedule' | 'highlight' | 'alert' | 'notice';

export interface LiveUpdate {
  id: string;
  eventId: string;
  eventTitle: string;
  type: LiveUpdateType;
  headline: string;
  detail: string;
  scoreSummary?: string;
  timestamp: string; // ISO string
  venue: string;
  isHappeningNow?: boolean;
}

export type AttendeeRole = 'Student' | 'Parent' | 'Teacher';

export type TicketStatus = 'Confirmed' | 'Waitlisted';

export interface Ticket {
  id: string;
  userId?: string;
  ticketCode: string; // Format: RCP-XXXX-XXXX
  eventId: string;
  attendeeName: string;
  attendeeRole: AttendeeRole;
  gradeOrRoleDetail: string;
  email: string;
  phone: string;
  houseName?: 'Vijaya' | 'Gemunu' | 'Parakrama' | 'Ashoka';
  registeredAt: string; // ISO string
  seatSection: string;
  status: TicketStatus;
  checkedIn?: boolean;
  checkedInAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'parent' | 'teacher' | 'admin';
  isAdmin: boolean;
  gradeOrDepartment?: string;
  createdAt: string;
}

export type UserRole = 'student_parent' | 'admin';

export type PageRoute =
  | 'home'
  | 'events'
  | 'event-detail'
  | 'calendar'
  | 'announcements'
  | 'tickets'
  | 'live-feed'
  | 'admin'
  | 'login'
  | 'not-found';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastNotification {
  id: string;
  message: string;
  type: ToastType;
}
