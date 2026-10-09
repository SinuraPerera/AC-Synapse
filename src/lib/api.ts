import {
  Announcement,
  LiveUpdate,
  SchoolEvent,
  Ticket,
  UserProfile,
} from '../types';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_EVENTS,
  INITIAL_LIVE_UPDATES,
  INITIAL_TICKETS,
} from './seedData';
import { generateUniqueTicketCode } from './ticketUtils';

const STORAGE_KEYS = {
  EVENTS: 'ac_synapse_api_events_v1',
  ANNOUNCEMENTS: 'ac_synapse_api_announcements_v1',
  LIVE_UPDATES: 'ac_synapse_api_live_updates_v1',
  REGISTRATIONS: 'ac_synapse_api_registrations_v2',
  USERS: 'ac_synapse_api_users_v1',
  SESSION: 'ac_synapse_api_session_v1',
} as const;

const CHANNEL_NAME = 'ac_synapse_realtime_channel_v1';

export interface StoredUserAccount extends UserProfile {
  passwordHash: string;
}

export const DEMO_ACCOUNTS = {
  admin: {
    uid: 'usr-admin-01',
    email: 'admin@anandacollege.edu.lk',
    password: 'AnandaAdmin#2026',
    displayName: 'Col. H.S. Olcott Admin Desk',
    role: 'admin' as const,
    isAdmin: true,
    gradeOrDepartment: 'College Executive Administration',
  },
  student: {
    uid: 'usr-student-01',
    email: 'student@anandacollege.edu.lk',
    password: 'AnandaStudent#2026',
    displayName: 'Kavindu Senanayake',
    role: 'student' as const,
    isAdmin: false,
    gradeOrDepartment: 'Grade 12-B (Physical Science)',
  },
};

const INITIAL_USERS: StoredUserAccount[] = [
  {
    uid: DEMO_ACCOUNTS.admin.uid,
    email: DEMO_ACCOUNTS.admin.email,
    passwordHash: DEMO_ACCOUNTS.admin.password,
    displayName: DEMO_ACCOUNTS.admin.displayName,
    role: DEMO_ACCOUNTS.admin.role,
    isAdmin: true,
    gradeOrDepartment: DEMO_ACCOUNTS.admin.gradeOrDepartment,
    createdAt: new Date().toISOString(),
  },
  {
    uid: DEMO_ACCOUNTS.student.uid,
    email: DEMO_ACCOUNTS.student.email,
    passwordHash: DEMO_ACCOUNTS.student.password,
    displayName: DEMO_ACCOUNTS.student.displayName,
    role: DEMO_ACCOUNTS.student.role,
    isAdmin: false,
    gradeOrDepartment: DEMO_ACCOUNTS.student.gradeOrDepartment,
    createdAt: new Date().toISOString(),
  },
];

export interface SynapseDataStoreSnapshot {
  events: SchoolEvent[];
  announcements: Announcement[];
  liveUpdates: LiveUpdate[];
  registrations: Ticket[];
  currentUser: UserProfile | null;
}

type StoreListener = (snapshot: SynapseDataStoreSnapshot) => void;

class SynapseApiClient {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<StoreListener> = new Set();

  constructor() {
    this.seedIfEmpty();
    this.initRealtimeSync();
  }

  /**
   * Initializes BroadcastChannel and window storage listeners for instant cross-tab sync.
   */
  private initRealtimeSync(): void {
    if (typeof window === 'undefined') return;

    if ('BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = () => {
          this.notifyListeners();
        };
      } catch {
        this.channel = null;
      }
    }

    window.addEventListener('storage', (e) => {
      if (
        e.key &&
        Object.values(STORAGE_KEYS).includes(e.key as (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS])
      ) {
        this.notifyListeners();
      }
    });
  }

  private readJson<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const normalized = raw
        .replace(/Thissa/g, 'Ashoka')
        .replace(/Appamado Amathapadam/g, 'අප්පමාදෝ අමතපදං');
      return JSON.parse(normalized) as T;
    } catch {
      return fallback;
    }
  }

  private writeJson<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota errors in restricted sandboxes
    }
  }

  private broadcastChange(type: string): void {
    this.notifyListeners();
    if (this.channel) {
      try {
        this.channel.postMessage({ type, timestamp: Date.now() });
      } catch {
        // Ignore postMessage errors if channel closed
      }
    }
  }

  private notifyListeners(): void {
    const snap = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snap));
  }

  /**
   * Seeds localStorage with realistic Ananda College sample data on first load if empty.
   */
  public seedIfEmpty(): void {
    try {
      localStorage.removeItem('ac_synapse_api_registrations_v1');
    } catch {
      // Ignore storage access errors
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      this.writeJson(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
      this.writeJson(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LIVE_UPDATES)) {
      this.writeJson(STORAGE_KEYS.LIVE_UPDATES, INITIAL_LIVE_UPDATES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
      this.writeJson(STORAGE_KEYS.REGISTRATIONS, INITIAL_TICKETS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.writeJson(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
  }

  /**
   * Subscribe to real-time updates (both in-tab mutations and cross-tab BroadcastChannel events).
   */
  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getSnapshot(): SynapseDataStoreSnapshot {
    return {
      events: this.getEvents(),
      announcements: this.getAnnouncements(),
      liveUpdates: this.getLiveUpdates(),
      registrations: this.getRegistrations(),
      currentUser: this.getCurrentUser(),
    };
  }

  // --- READ OPERATIONS ---
  public getEvents(): SchoolEvent[] {
    return this.readJson<SchoolEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  }

  public getAnnouncements(): Announcement[] {
    return this.readJson<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  }

  public getLiveUpdates(): LiveUpdate[] {
    return this.readJson<LiveUpdate[]>(STORAGE_KEYS.LIVE_UPDATES, INITIAL_LIVE_UPDATES);
  }

  public getRegistrations(): Ticket[] {
    return this.readJson<Ticket[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_TICKETS);
  }

  public getCurrentUser(): UserProfile | null {
    return this.readJson<UserProfile | null>(STORAGE_KEYS.SESSION, null);
  }

  // --- AUTHENTICATION OPERATIONS ---
  public async signIn(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.readJson<StoredUserAccount[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found || found.passwordHash !== password) {
      throw new Error('Invalid email or password. Use the Demo Account credentials on the right or register a new account.');
    }

    const { passwordHash: _, ...profile } = found;
    this.writeJson(STORAGE_KEYS.SESSION, profile);
    this.broadcastChange('AUTH_CHANGED');
    return profile;
  }

  public async signUp(params: {
    email: string;
    password: string;
    displayName: string;
    gradeOrDepartment: string;
  }): Promise<UserProfile> {
    const cleanEmail = params.email.trim().toLowerCase();
    const users = this.readJson<StoredUserAccount[]>(STORAGE_KEYS.USERS, INITIAL_USERS);

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const isAdminEmail = cleanEmail === DEMO_ACCOUNTS.admin.email.toLowerCase();
    const newAccount: StoredUserAccount = {
      uid: `usr-${Date.now()}`,
      email: cleanEmail,
      passwordHash: params.password,
      displayName: params.displayName.trim() || cleanEmail.split('@')[0],
      role: isAdminEmail ? 'admin' : 'student',
      isAdmin: isAdminEmail,
      gradeOrDepartment: params.gradeOrDepartment.trim() || 'Grade 12-B',
      createdAt: new Date().toISOString(),
    };

    this.writeJson(STORAGE_KEYS.USERS, [...users, newAccount]);
    const { passwordHash: _, ...profile } = newAccount;
    this.writeJson(STORAGE_KEYS.SESSION, profile);
    this.broadcastChange('AUTH_CHANGED');
    return profile;
  }

  public async signOut(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    this.broadcastChange('AUTH_CHANGED');
  }

  // --- ATOMIC REGISTRATION & WAITLIST OPERATIONS ---
  /**
   * Executes an atomic read-modify-write against the latest localStorage state
   * so two tabs cannot claim the last seat simultaneously.
   */
  public async registerForEvent(
    ticketData: Omit<Ticket, 'id' | 'ticketCode' | 'registeredAt' | 'status'>
  ): Promise<{ ticket: Ticket; status: 'Confirmed' | 'Waitlisted' }> {
    const latestEvents = this.getEvents();
    const latestRegistrations = this.getRegistrations();
    const targetEvent = latestEvents.find((e) => e.id === ticketData.eventId);

    if (!targetEvent) {
      throw new Error('Selected event was not found.');
    }

    // Re-verify duplicate registration for same email + event against latest store
    const duplicate = latestRegistrations.find(
      (t) =>
        t.eventId === ticketData.eventId &&
        t.email.trim().toLowerCase() === ticketData.email.trim().toLowerCase()
    );
    if (duplicate) {
      throw new Error(
        `Duplicate registration: ${ticketData.email} already holds pass ${duplicate.ticketCode} (${duplicate.status}).`
      );
    }

    const isCurrentlyFull = targetEvent.registeredCount >= targetEvent.totalSeats;
    const assignedStatus: 'Confirmed' | 'Waitlisted' = isCurrentlyFull
      ? 'Waitlisted'
      : 'Confirmed';

    const ticketCode = generateUniqueTicketCode(latestRegistrations);
    const currentUser = this.getCurrentUser();

    const newTicket: Ticket = {
      ...ticketData,
      id: `tkt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: currentUser?.uid || 'guest',
      ticketCode,
      registeredAt: new Date().toISOString(),
      status: assignedStatus,
      checkedIn: false,
    };

    if (!isCurrentlyFull) {
      const updatedEvents = latestEvents.map((ev) =>
        ev.id === targetEvent.id
          ? { ...ev, registeredCount: Math.min(ev.totalSeats, ev.registeredCount + 1) }
          : ev
      );
      this.writeJson(STORAGE_KEYS.EVENTS, updatedEvents);
    }

    this.writeJson(STORAGE_KEYS.REGISTRATIONS, [newTicket, ...latestRegistrations]);
    this.broadcastChange('REGISTRATION_CREATED');

    return { ticket: newTicket, status: assignedStatus };
  }

  /**
   * Cancels a registration and automatically promotes the oldest Waitlisted ticket if one exists.
   */
  public async cancelRegistration(ticketId: string): Promise<{
    cancelledTicket: Ticket;
    promotedTicket?: Ticket;
  }> {
    const latestRegistrations = this.getRegistrations();
    const latestEvents = this.getEvents();
    const target = latestRegistrations.find((t) => t.id === ticketId);

    if (!target) {
      throw new Error('Registration not found.');
    }

    const remaining = latestRegistrations.filter((t) => t.id !== ticketId);

    if (target.status === 'Confirmed') {
      const waitlistedForEvent = remaining
        .filter((t) => t.eventId === target.eventId && t.status === 'Waitlisted')
        .sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime());

      const oldestWaitlisted = waitlistedForEvent[0];

      if (oldestWaitlisted) {
        const promoted: Ticket = { ...oldestWaitlisted, status: 'Confirmed' };
        const updatedRegs = remaining.map((t) => (t.id === promoted.id ? promoted : t));
        this.writeJson(STORAGE_KEYS.REGISTRATIONS, updatedRegs);
        this.broadcastChange('REGISTRATION_CANCELLED_PROMOTED');
        return { cancelledTicket: target, promotedTicket: promoted };
      } else {
        this.writeJson(STORAGE_KEYS.REGISTRATIONS, remaining);
        const updatedEvents = latestEvents.map((ev) =>
          ev.id === target.eventId
            ? { ...ev, registeredCount: Math.max(0, ev.registeredCount - 1) }
            : ev
        );
        this.writeJson(STORAGE_KEYS.EVENTS, updatedEvents);
        this.broadcastChange('REGISTRATION_CANCELLED');
        return { cancelledTicket: target };
      }
    } else {
      this.writeJson(STORAGE_KEYS.REGISTRATIONS, remaining);
      this.broadcastChange('WAITLIST_CANCELLED');
      return { cancelledTicket: target };
    }
  }

  /**
   * Checks in a ticket by its RCP-XXXX-XXXX code and syncs across all tabs.
   */
  public checkInTicket(rawTicketCode: string): {
    ok: boolean;
    message: string;
    ticket?: Ticket;
    event?: SchoolEvent;
  } {
    const normalized = rawTicketCode.trim().toUpperCase();
    const latestRegistrations = this.getRegistrations();
    const latestEvents = this.getEvents();
    const found = latestRegistrations.find((t) => t.ticketCode.toUpperCase() === normalized);

    if (!found) {
      return {
        ok: false,
        message: `No registration found matching ticket code "${normalized}". Please verify the RCP-XXXX-XXXX code.`,
      };
    }

    const evt = latestEvents.find((e) => e.id === found.eventId);

    if (found.status === 'Waitlisted') {
      return {
        ok: false,
        ticket: found,
        event: evt,
        message: `Pass ${found.ticketCode} belongs to ${found.attendeeName}, but is currently on the Waitlist and cannot be checked in until promoted to Confirmed.`,
      };
    }

    if (found.checkedIn) {
      return {
        ok: false,
        ticket: found,
        event: evt,
        message: `Pass ${found.ticketCode} (${found.attendeeName}) was already checked in at ${
          found.checkedInAt
            ? new Date(found.checkedInAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'an earlier time'
        }.`,
      };
    }

    const nowIso = new Date().toISOString();
    const updatedTicket: Ticket = {
      ...found,
      checkedIn: true,
      checkedInAt: nowIso,
    };

    const updatedRegs = latestRegistrations.map((t) =>
      t.id === found.id ? updatedTicket : t
    );
    this.writeJson(STORAGE_KEYS.REGISTRATIONS, updatedRegs);
    this.broadcastChange('TICKET_CHECKED_IN');

    return {
      ok: true,
      ticket: updatedTicket,
      event: evt,
      message: `Successfully checked in ${found.attendeeName} (${found.attendeeRole}) at ${new Date(
        nowIso
      ).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.`,
    };
  }

  // --- EVENTS CRUD ---
  public createEvent(evtData: Omit<SchoolEvent, 'id' | 'registeredCount'>): SchoolEvent {
    const latestEvents = this.getEvents();
    const newEvt: SchoolEvent = {
      ...evtData,
      id: `evt-${Date.now()}`,
      registeredCount: 0,
    };
    this.writeJson(STORAGE_KEYS.EVENTS, [newEvt, ...latestEvents]);
    this.broadcastChange('EVENT_CREATED');
    return newEvt;
  }

  public updateEvent(updated: SchoolEvent): SchoolEvent {
    const latestEvents = this.getEvents();
    this.writeJson(
      STORAGE_KEYS.EVENTS,
      latestEvents.map((ev) => (ev.id === updated.id ? updated : ev))
    );
    this.broadcastChange('EVENT_UPDATED');
    return updated;
  }

  public deleteEvent(eventId: string): void {
    const latestEvents = this.getEvents();
    const latestRegs = this.getRegistrations();
    this.writeJson(
      STORAGE_KEYS.EVENTS,
      latestEvents.filter((ev) => ev.id !== eventId)
    );
    this.writeJson(
      STORAGE_KEYS.REGISTRATIONS,
      latestRegs.filter((t) => t.eventId !== eventId)
    );
    this.broadcastChange('EVENT_DELETED');
  }

  // --- ANNOUNCEMENTS CRUD ---
  public createAnnouncement(annData: Omit<Announcement, 'id' | 'createdAt'>): Announcement {
    const latest = this.getAnnouncements();
    const newAnn: Announcement = {
      ...annData,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.writeJson(STORAGE_KEYS.ANNOUNCEMENTS, [newAnn, ...latest]);
    this.broadcastChange('ANNOUNCEMENT_CREATED');
    return newAnn;
  }

  public togglePinAnnouncement(announcementId: string): void {
    const latest = this.getAnnouncements();
    this.writeJson(
      STORAGE_KEYS.ANNOUNCEMENTS,
      latest.map((a) => (a.id === announcementId ? { ...a, isPinned: !a.isPinned } : a))
    );
    this.broadcastChange('ANNOUNCEMENT_UPDATED');
  }

  public deleteAnnouncement(announcementId: string): void {
    const latest = this.getAnnouncements();
    this.writeJson(
      STORAGE_KEYS.ANNOUNCEMENTS,
      latest.filter((a) => a.id !== announcementId)
    );
    this.broadcastChange('ANNOUNCEMENT_DELETED');
  }

  // --- LIVE UPDATES ---
  public createLiveUpdate(luData: Omit<LiveUpdate, 'id' | 'timestamp'>): LiveUpdate {
    const latest = this.getLiveUpdates();
    const newLu: LiveUpdate = {
      ...luData,
      id: `lu-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.writeJson(STORAGE_KEYS.LIVE_UPDATES, [newLu, ...latest]);
    this.broadcastChange('LIVE_UPDATE_CREATED');
    return newLu;
  }

  /**
   * Resets all events, announcements, live updates, and tickets back to default Ananda College seed data.
   */
  public resetDemoData(): void {
    this.writeJson(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    this.writeJson(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    this.writeJson(STORAGE_KEYS.LIVE_UPDATES, INITIAL_LIVE_UPDATES);
    this.writeJson(STORAGE_KEYS.REGISTRATIONS, INITIAL_TICKETS);
    this.broadcastChange('DEMO_DATA_RESET');
  }
}

export const api = new SynapseApiClient();
