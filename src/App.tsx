/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Announcement,
  LiveUpdate,
  PageRoute,
  SchoolEvent,
  Ticket,
  ToastNotification,
  ToastType,
  UserProfile,
  UserRole,
} from './types';
import { api } from './lib/api';
import { useI18n } from './lib/i18n';
import { Navbar } from './components/Navbar';
import { RegistrationModal } from './components/RegistrationModal';
import { AdminActionModal } from './components/AdminActionModal';
import { PageSkeleton } from './components/PageSkeleton';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import { CommandPalette } from './components/CommandPalette';
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { LiveFeedPage } from './pages/LiveFeedPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import {
  PlusCircle,
  Megaphone,
  Radio,
  CheckCircle2,
  LayoutDashboard,
  AlertTriangle,
  Info,
  X,
  RotateCcw,
} from 'lucide-react';

const VALID_ROUTES: PageRoute[] = [
  'home',
  'events',
  'event-detail',
  'calendar',
  'announcements',
  'tickets',
  'live-feed',
  'admin',
  'login',
  'not-found',
];

function resolveInitialRoute(): {
  route: PageRoute;
  eventId?: string;
  attemptedPath?: string;
} {
  if (typeof window === 'undefined') return { route: 'home' };
  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const rawHash = window.location.hash.replace(/^#\/?/, '').trim();

  if (rawHash) {
    const [hashPath, queryString] = rawHash.split('?');
    if (VALID_ROUTES.includes(hashPath as PageRoute)) {
      const params = new URLSearchParams(queryString || '');
      const eventId = params.get('event') || undefined;
      return { route: hashPath as PageRoute, eventId };
    }
    return { route: 'not-found', attemptedPath: `#${rawHash}` };
  }

  if (pathname && pathname !== 'index.html') {
    if (VALID_ROUTES.includes(pathname as PageRoute)) {
      return { route: pathname as PageRoute };
    }
    return { route: 'not-found', attemptedPath: `/${pathname}` };
  }

  return { route: 'home' };
}

export default function App() {
  const { t } = useI18n();
  const initialSnap = api.getSnapshot();
  const initialRouteInfo = resolveInitialRoute();

  const [currentPage, setCurrentPage] = useState<PageRoute>(initialRouteInfo.route);
  const [attemptedPath, setAttemptedPath] = useState<string | undefined>(
    initialRouteInfo.attemptedPath
  );
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initialRouteInfo.eventId || initialSnap.events[0]?.id || 'evt-interhouse-athletics'
  );
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialSnap.currentUser);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ac_synapse_theme_v1') === 'dark';
    } catch {
      return false;
    }
  });
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);

  const [events, setEvents] = useState<SchoolEvent[]>(initialSnap.events);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialSnap.announcements);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>(initialSnap.liveUpdates);
  const [tickets, setTickets] = useState<Ticket[]>(initialSnap.registrations);

  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);
  const [adminModalMode, setAdminModalMode] = useState<'event' | 'announcement' | 'live' | null>(
    null
  );
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const role: UserRole = userProfile?.isAdmin ? 'admin' : 'student_parent';
  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const registeringEvent = events.find((e) => e.id === registeringEventId) || null;

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial brief skeleton hydration for smooth visual entry
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoadingPage(false);
    }, 320);
    return () => window.clearTimeout(timer);
  }, []);

  // Dark mode class toggle + theme-color meta sync + localStorage persistence
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('ac_synapse_theme_v1', darkMode ? 'dark' : 'light');
    } catch {
      // Ignore storage restrictions
    }
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', darkMode ? '#0D0B0E' : '#7A1224');
    }
  }, [darkMode]);

  // Dynamic page titles per route
  useEffect(() => {
    const titleMap: Record<PageRoute, string> = {
      home: 'AC Synapse — Ananda College Event Command Center',
      events: 'Events Directory · AC Synapse — Ananda College',
      'event-detail': `${activeEvent ? activeEvent.title : 'Event Details'} · AC Synapse`,
      calendar: 'Academic & Event Calendar · AC Synapse',
      announcements: 'Official Announcements · AC Synapse',
      tickets: `My QR Tickets (${tickets.length}) · AC Synapse`,
      'live-feed': 'Live Venue Feed · AC Synapse',
      admin: 'Admin Command Center · AC Synapse',
      login: 'Sign In · AC Synapse',
      'not-found': '404 Page Not Found · AC Synapse',
    };
    document.title = titleMap[currentPage] || 'AC Synapse — Ananda College';
  }, [currentPage, activeEvent, tickets.length]);

  // Listen to URL hash changes so unknown hashes show 404 page and browser back/forward works
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
      if (!rawHash) {
        setCurrentPage('home');
        return;
      }
      const [hashPath, queryString] = rawHash.split('?');
      if (VALID_ROUTES.includes(hashPath as PageRoute)) {
        const params = new URLSearchParams(queryString || '');
        const evtId = params.get('event');
        if (evtId) {
          setSelectedEventId(evtId);
        }
        setCurrentPage(hashPath as PageRoute);
      } else {
        setAttemptedPath(`#${rawHash}`);
        setCurrentPage('not-found');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global Ctrl+K / Cmd+K shortcut for Command Palette
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Subscribe to real-time updates from src/lib/api.ts (localStorage + BroadcastChannel across tabs)
  useEffect(() => {
    const unsubscribe = api.subscribe((snap) => {
      setEvents(snap.events);
      setAnnouncements(snap.announcements);
      setLiveUpdates(snap.liveUpdates);
      setTickets(snap.registrations);
      setUserProfile(snap.currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectEvent = (eventId: string) => {
    const exists = events.some((e) => e.id === eventId);
    if (!exists) {
      setAttemptedPath(`/events/${eventId}`);
      setCurrentPage('not-found');
      return;
    }
    setSelectedEventId(eventId);
    setCurrentPage('event-detail');
    window.history.replaceState(null, '', `#event-detail?event=${encodeURIComponent(eventId)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: PageRoute) => {
    if (!VALID_ROUTES.includes(page)) {
      setAttemptedPath(`/${String(page)}`);
      setCurrentPage('not-found');
      return;
    }
    setCurrentPage(page);
    window.history.replaceState(null, '', page === 'home' ? '#' : `#${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmRegistration = async (
    ticketData: Omit<Ticket, 'id' | 'ticketCode' | 'registeredAt' | 'status'>
  ) => {
    try {
      const { ticket, status } = await api.registerForEvent(ticketData);
      setRegisteringEventId(null);
      handleNavigate('tickets');
      showToast(
        status === 'Confirmed'
          ? `Registered! Confirmed pass ${ticket.ticketCode} issued and seat count updated.`
          : `Event is full — Pass ${ticket.ticketCode} placed on the official Waitlist.`,
        status === 'Confirmed' ? 'success' : 'warning'
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Registration error', 'error');
    }
  };

  const handleCancelTicket = async (ticketId: string) => {
    try {
      const { cancelledTicket, promotedTicket } = await api.cancelRegistration(ticketId);
      if (promotedTicket) {
        showToast(
          `Cancelled ${cancelledTicket.ticketCode}. Waitlisted attendee ${promotedTicket.attendeeName} (${promotedTicket.ticketCode}) automatically promoted to Confirmed!`,
          'info'
        );
      } else {
        showToast(
          `Registration ${cancelledTicket.ticketCode} cancelled and seat quota restored.`,
          'info'
        );
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Cancellation failed', 'error');
    }
  };

  const handleTogglePinAnnouncement = (announcementId: string) => {
    api.togglePinAnnouncement(announcementId);
    showToast('Announcement pin status updated across tabs.', 'info');
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    api.deleteAnnouncement(announcementId);
    showToast('Official announcement removed.', 'info');
  };

  const handleCreateEvent = (evtData: Omit<SchoolEvent, 'id' | 'registeredCount'>) => {
    const created = api.createEvent(evtData);
    showToast(`Event published: ${created.title}`, 'success');
  };

  const handleUpdateEvent = (updated: SchoolEvent) => {
    api.updateEvent(updated);
    showToast(`Event updated: ${updated.title}`, 'success');
  };

  const handleDeleteEvent = (eventId: string) => {
    const target = events.find((e) => e.id === eventId);
    api.deleteEvent(eventId);
    showToast(`Deleted event${target ? `: ${target.title}` : ''}.`, 'info');
  };

  const handleCreateAnnouncement = (annData: Omit<Announcement, 'id' | 'createdAt'>) => {
    api.createAnnouncement(annData);
    showToast('Official notice posted and broadcast across open tabs.', 'success');
  };

  const handleCreateLiveUpdate = (luData: Omit<LiveUpdate, 'id' | 'timestamp'>) => {
    api.createLiveUpdate(luData);
    showToast('Live update posted! Synced to Live Feed and Event page.', 'success');
  };

  const handleCheckInTicket = (rawTicketCode: string) => {
    const res = api.checkInTicket(rawTicketCode);
    if (res.ok && res.ticket) {
      showToast(`Checked in ${res.ticket.attendeeName} (${res.ticket.ticketCode})!`, 'success');
    } else {
      showToast(res.message, 'warning');
    }
    return res;
  };

  const handleSignOut = async () => {
    await api.signOut();
    if (currentPage === 'admin') {
      handleNavigate('home');
    }
    showToast('Signed out of AC Synapse.', 'info');
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-[#FAF8F5] dark:bg-[#0D0B0E] text-stone-900 dark:text-stone-100 transition-colors">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[#7A1224] focus:text-amber-200 focus:text-xs focus:font-bold focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        userProfile={userProfile}
        onSignOut={handleSignOut}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        ticketCount={tickets.length}
        onToast={(msg) => showToast(msg, 'success')}
        onOpenSearch={() => setIsCommandOpen(true)}
      />

      {/* Offline Connectivity Banner */}
      <OfflineIndicator />

      {/* Admin Quick Action Bar when signed in with Admin privileges */}
      {role === 'admin' && (
        <div className="bg-[#7A1224] text-amber-100 border-b border-amber-400/20">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <span className="font-semibold truncate max-w-full">
              Admin Session ({userProfile?.email}) · BroadcastChannel Sync Active
            </span>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                aria-label="Open Admin Dashboard"
                onClick={() => handleNavigate('admin')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer ${
                  currentPage === 'admin'
                    ? 'bg-amber-400 text-stone-950'
                    : 'bg-black/25 hover:bg-black/40 text-amber-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" aria-label="Admin dashboard icon" />
                <span>Admin Dashboard</span>
              </button>
              <button
                type="button"
                aria-label="Create new school event"
                onClick={() => setAdminModalMode('event')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-black/25 hover:bg-black/40 text-amber-200 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 shrink-0" aria-label="Add new event icon" />
                <span>+ New Event</span>
              </button>
              <button
                type="button"
                aria-label="Broadcast new official notice"
                onClick={() => setAdminModalMode('announcement')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-black/25 hover:bg-black/40 text-amber-200 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Megaphone className="w-3.5 h-3.5 shrink-0" aria-label="Broadcast notice icon" />
                <span>+ Notice</span>
              </button>
              <button
                type="button"
                aria-label="Post new live venue update"
                onClick={() => setAdminModalMode('live')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-black/25 hover:bg-black/40 text-amber-200 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 shrink-0" aria-label="Post live update icon" />
                <span>+ Live Update</span>
              </button>
              <button
                type="button"
                aria-label="Reset demo data to default Ananda College seed state"
                onClick={() => {
                  api.resetDemoData();
                  showToast('Demo data restored to default Ananda College seed state.', 'info');
                }}
                title="Reset all events, notices, live feed, and tickets to initial demo state"
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-black/25 hover:bg-black/40 text-amber-200 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-label="Reset demo data icon" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated Toast Notification Stack */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-16 md:bottom-6 right-3 sm:right-5 z-50 flex flex-col gap-2 max-w-[calc(100vw-1.5rem)] sm:max-w-md pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              role="status"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto rounded-xl px-4 py-3 shadow-xl border flex items-start justify-between gap-3 text-xs font-semibold ${
                t.type === 'error'
                  ? 'bg-red-950 text-red-100 border-red-500/40'
                  : t.type === 'warning'
                  ? 'bg-amber-950 text-amber-100 border-amber-400/40'
                  : 'bg-stone-900 dark:bg-amber-400 text-amber-200 dark:text-stone-950 border-amber-400/30'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {t.type === 'error' || t.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-label="Warning alert icon" />
                ) : t.type === 'info' ? (
                  <Info className="w-4 h-4 shrink-0 mt-0.5" aria-label="Information icon" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-label="Success check icon" />
                )}
                <span className="leading-relaxed break-words">{t.message}</span>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="Dismiss notification"
                className="opacity-70 hover:opacity-100 shrink-0 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-label="Dismiss notification icon" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Content Container with Skeleton Loader & Smooth Page Transitions */}
      <main
        id="main-content"
        className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-20 md:pb-12"
      >
        {isLoadingPage ? (
          <PageSkeleton />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage === 'event-detail' ? `event-${selectedEventId}` : currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {currentPage === 'login' && (
                <LoginPage
                  onLoginSuccess={(profile, msg) => {
                    showToast(msg, 'success');
                    handleNavigate(profile.isAdmin ? 'admin' : 'home');
                  }}
                />
              )}

              {currentPage === 'home' && (
                <HomePage
                  events={events}
                  announcements={announcements}
                  liveUpdates={liveUpdates}
                  tickets={tickets}
                  onSelectEvent={handleSelectEvent}
                  onRegisterEvent={(ev) => setRegisteringEventId(ev.id)}
                  onNavigate={handleNavigate}
                />
              )}

              {currentPage === 'events' && (
                <EventsPage
                  events={events}
                  tickets={tickets}
                  role={role}
                  onSelectEvent={handleSelectEvent}
                  onRegisterEvent={(ev) => setRegisteringEventId(ev.id)}
                  onOpenAdminCreateEvent={() => setAdminModalMode('event')}
                  onNavigateTickets={() => handleNavigate('tickets')}
                />
              )}

              {currentPage === 'event-detail' && activeEvent && (
                <EventDetailPage
                  event={activeEvent}
                  tickets={tickets}
                  liveUpdates={liveUpdates}
                  onBack={() => handleNavigate('events')}
                  onRegister={(ev) => setRegisteringEventId(ev.id)}
                  onNavigateTickets={() => handleNavigate('tickets')}
                  onShareToast={(msg) => showToast(msg, 'info')}
                />
              )}

              {currentPage === 'calendar' && (
                <CalendarPage events={events} onSelectEvent={handleSelectEvent} />
              )}

              {currentPage === 'announcements' && (
                <AnnouncementsPage
                  announcements={announcements}
                  role={role}
                  onSelectEvent={handleSelectEvent}
                  onTogglePin={handleTogglePinAnnouncement}
                  onOpenAdminAnnouncement={() => setAdminModalMode('announcement')}
                />
              )}

              {currentPage === 'tickets' && (
                <MyTicketsPage
                  tickets={tickets}
                  events={events}
                  onCancelTicket={handleCancelTicket}
                  onSelectEvent={handleSelectEvent}
                  onBrowseEvents={() => handleNavigate('events')}
                />
              )}

              {currentPage === 'live-feed' && (
                <LiveFeedPage
                  liveUpdates={liveUpdates}
                  events={events}
                  role={role}
                  onSelectEvent={handleSelectEvent}
                  onOpenAdminLiveModal={() => setAdminModalMode('live')}
                />
              )}

              {currentPage === 'admin' &&
                (role === 'admin' ? (
                  <AdminDashboardPage
                    events={events}
                    tickets={tickets}
                    announcements={announcements}
                    liveUpdates={liveUpdates}
                    onCreateEvent={handleCreateEvent}
                    onUpdateEvent={handleUpdateEvent}
                    onDeleteEvent={handleDeleteEvent}
                    onCreateAnnouncement={handleCreateAnnouncement}
                    onTogglePinAnnouncement={handleTogglePinAnnouncement}
                    onDeleteAnnouncement={handleDeleteAnnouncement}
                    onCreateLiveUpdate={handleCreateLiveUpdate}
                    onCheckInTicket={handleCheckInTicket}
                    onSelectEvent={handleSelectEvent}
                  />
                ) : (
                  <NotFoundPage
                    attemptedPath="/admin (Admin Access Required)"
                    onNavigate={handleNavigate}
                  />
                ))}

              {currentPage === 'not-found' && (
                <NotFoundPage attemptedPath={attemptedPath} onNavigate={handleNavigate} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* School Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 py-8 mb-14 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
          <div className="space-y-1">
            <p className="font-display font-bold text-stone-900 dark:text-stone-200 text-sm">
              AC Synapse · Ananda College, Colombo 10
            </p>
            <p>
              Maradana Road, Colombo 10, Sri Lanka · අප්පමාදෝ අමතපදං
            </p>
            <p className="font-semibold text-[#7A1224] dark:text-amber-400 pt-0.5">
              Built for BTUI&apos;26 - Annual ICT Day of Royal College
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <PWAInstallButton onInstalledToast={(msg) => showToast(msg, 'success')} />
            <a
              href="https://www.anandacollege.edu.lk/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#7A1224] dark:hover:text-amber-300 underline underline-offset-4"
            >
              {t.officialCollegePortal}
            </a>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleNavigate('calendar')}
              className="hover:text-[#7A1224] dark:hover:text-amber-300 cursor-pointer"
            >
              {t.academicCalendar}
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleNavigate('login')}
              className="hover:text-[#7A1224] dark:hover:text-amber-300 cursor-pointer"
            >
              {userProfile ? t.navSwitchAccount : t.navSignIn}
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => {
                setAttemptedPath('/404-preview');
                handleNavigate('not-found');
              }}
              className="hover:text-[#7A1224] dark:hover:text-amber-300 cursor-pointer"
            >
              404 Page
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RegistrationModal
        event={registeringEvent}
        tickets={tickets}
        allEvents={events}
        onClose={() => setRegisteringEventId(null)}
        onConfirmRegistration={handleConfirmRegistration}
      />

      <AdminActionModal
        mode={adminModalMode}
        events={events}
        onClose={() => setAdminModalMode(null)}
        onCreateEvent={handleCreateEvent}
        onCreateAnnouncement={handleCreateAnnouncement}
        onCreateLiveUpdate={handleCreateLiveUpdate}
      />

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        events={events}
        announcements={announcements}
        liveUpdates={liveUpdates}
        onSelectEvent={handleSelectEvent}
        onNavigate={handleNavigate}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
      />
    </div>
  );
}
