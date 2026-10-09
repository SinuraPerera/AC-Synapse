import React from 'react';
import { motion } from 'motion/react';
import {
  Moon,
  Sun,
  ShieldCheck,
  UserCheck,
  Home,
  Calendar as CalendarIcon,
  Compass,
  Megaphone,
  Ticket as TicketIcon,
  Radio,
  LogIn,
  LogOut,
  Search,
} from 'lucide-react';
import { PageRoute, UserProfile } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { LANGUAGES, LanguageCode, useI18n } from '../lib/i18n';

interface NavbarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  userProfile: UserProfile | null;
  onSignOut: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  ticketCount: number;
  onToast?: (msg: string) => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  userProfile,
  onSignOut,
  darkMode,
  onToggleDarkMode,
  ticketCount,
  onToast,
  onOpenSearch,
}) => {
  const isAdmin = Boolean(userProfile?.isAdmin);
  const { lang, setLang, t } = useI18n();

  const handleSelectLanguage = (code: LanguageCode, nativeName: string) => {
    if (code === lang) return;
    setLang(code);
    if (onToast) {
      onToast(`Language switched to ${nativeName}`);
    }
  };

  const navItems: {
    id: PageRoute;
    label: string;
    shortLabel: string;
    ariaLabel: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'home',
      label: t.navHome,
      shortLabel: t.navHome,
      ariaLabel: `Navigate to ${t.navHome}`,
      icon: <Home className="w-4 h-4" aria-label={`${t.navHome} icon`} />,
    },
    {
      id: 'events',
      label: t.navEvents,
      shortLabel: t.navEvents,
      ariaLabel: `Navigate to ${t.navEvents}`,
      icon: <Compass className="w-4 h-4" aria-label={`${t.navEvents} icon`} />,
    },
    {
      id: 'calendar',
      label: t.navCalendar,
      shortLabel: t.navCalendar,
      ariaLabel: `Navigate to ${t.navCalendar}`,
      icon: <CalendarIcon className="w-4 h-4" aria-label={`${t.navCalendar} icon`} />,
    },
    {
      id: 'announcements',
      label: t.navAnnouncements,
      shortLabel: t.navNoticesShort,
      ariaLabel: `Navigate to ${t.navAnnouncements}`,
      icon: <Megaphone className="w-4 h-4" aria-label={`${t.navAnnouncements} icon`} />,
    },
    {
      id: 'tickets',
      label: ticketCount > 0 ? `${t.navTickets} (${ticketCount})` : t.navTickets,
      shortLabel: t.navTickets,
      ariaLabel:
        ticketCount > 0
          ? `Navigate to ${t.navTickets} (${ticketCount} active passes)`
          : `Navigate to ${t.navTickets}`,
      icon: <TicketIcon className="w-4 h-4" aria-label={`${t.navTickets} icon`} />,
    },
    {
      id: 'live-feed',
      label: t.navLiveFeed,
      shortLabel: t.navLiveFeed,
      ariaLabel: `Navigate to ${t.navLiveFeed}`,
      icon: <Radio className="w-4 h-4" aria-label={`${t.navLiveFeed} icon`} />,
    },
    ...(isAdmin
      ? [
          {
            id: 'admin' as PageRoute,
            label: t.navAdmin,
            shortLabel: t.navAdmin,
            ariaLabel: `Navigate to ${t.navAdmin}`,
            icon: <ShieldCheck className="w-4 h-4" aria-label={`${t.navAdmin} icon`} />,
          },
        ]
      : []),
  ];

  const isEventActive = (id: PageRoute) =>
    currentPage === id || (id === 'events' && currentPage === 'event-detail');

  return (
    <>
      {/* Top Navigation Bar — Strict 3-Zone Contract with Maroon & Gold Heritage Ribbon */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/92 dark:bg-[#0D0B0E]/92 backdrop-blur-xl border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
        <div
          aria-hidden="true"
          className="h-0.5 w-full bg-gradient-to-r from-[#5A0D1B] via-amber-400 to-[#5A0D1B]"
        />
        <div className="max-w-7xl mx-auto h-14 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Zone 1: Ananda College Crest & Wordmark */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            aria-label="AC Synapse — Return to Ananda College Event Command Center Home"
            className="group flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7A1224] whitespace-nowrap cursor-pointer"
          >
            <img
              src="/logo.png"
              alt="Ananda College Logo"
              className="w-8 h-8 object-contain shadow-xs group-hover:scale-105 transition-transform"
            />
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#7A1224] dark:text-amber-400">
              AC Synapse
            </span>
          </button>

          {/* Zone 2: Clean text navigation links with animated active indicator */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-medium h-full"
          >
            {navItems.map((item) => {
              const active = isEventActive(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-label={item.ariaLabel}
                  aria-current={active ? 'page' : undefined}
                  className={`relative h-full flex items-center whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7A1224] ${
                    active
                      ? 'text-[#7A1224] dark:text-amber-300 font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {active && (
                    <motion.span
                      layoutId="desktop-nav-underline"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#7A1224] dark:bg-amber-400"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Search (⌘K), Language Toggle (EN/සිං/த), PWA Install, Auth Control & Dark Mode Toggle */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {onOpenSearch && (
              <button
                type="button"
                onClick={onOpenSearch}
                title="Quick Search (Ctrl+K / ⌘K)"
                aria-label="Open command search (Ctrl+K or Command+K)"
                className="min-h-[34px] px-2 sm:px-2.5 py-1 rounded-lg border border-stone-200/90 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-[#7A1224]/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]"
              >
                <Search
                  className="w-3.5 h-3.5 text-[#7A1224] dark:text-amber-400"
                  aria-label="Search icon"
                />
                <kbd className="hidden xl:inline-block font-mono text-[10px] text-stone-400">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Trilingual Toggle (English / Sinhala / Tamil) */}
            <div
              role="group"
              aria-label="Language selector (English, Sinhala, Tamil)"
              className="inline-flex items-center rounded-lg p-0.5 border border-stone-200/90 dark:border-stone-800 bg-stone-100 dark:bg-stone-900"
            >
              {LANGUAGES.map((l) => {
                const isActive = lang === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleSelectLanguage(l.code, l.nativeName)}
                    title={l.nativeName}
                    aria-label={`Switch language to ${l.nativeName}`}
                    aria-pressed={isActive}
                    className={`min-h-[28px] px-1.5 sm:px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7A1224] ${
                      isActive
                        ? 'bg-[#7A1224] text-amber-200 dark:bg-amber-400 dark:text-stone-950 shadow-2xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    {l.shortLabel}
                  </button>
                );
              })}
            </div>

            <PWAInstallButton compact onInstalledToast={onToast} />

            {userProfile ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate(isAdmin ? 'admin' : 'tickets')}
                  aria-label={
                    isAdmin
                      ? `Open Admin Dashboard for ${userProfile.displayName}`
                      : `Open My Tickets for ${userProfile.displayName}`
                  }
                  className={`min-h-[36px] sm:min-h-[38px] px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224] ${
                    isAdmin
                      ? 'bg-[#7A1224] text-amber-200 border-[#7A1224] dark:bg-amber-400 dark:text-stone-950 dark:border-amber-400'
                      : 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-800 hover:border-[#7A1224]/40'
                  }`}
                >
                  {isAdmin ? (
                    <ShieldCheck
                      className="w-3.5 h-3.5 shrink-0"
                      aria-label="Administrator badge icon"
                    />
                  ) : (
                    <UserCheck
                      className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-label="Verified student user icon"
                    />
                  )}
                  <span className="hidden sm:inline max-w-[110px] truncate">
                    {userProfile.displayName}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onSignOut}
                  title={t.navSignOut}
                  aria-label={t.navSignOut}
                  className="min-h-[36px] sm:min-h-[38px] px-2 sm:px-2.5 py-1.5 rounded-lg border border-stone-200/90 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]"
                >
                  <LogOut className="w-3.5 h-3.5" aria-label="Sign out icon" />
                  <span className="hidden lg:inline">{t.navSignOut}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('login')}
                aria-label={t.navSignIn}
                className="min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#7A1224] hover:bg-[#600E1C] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" aria-label="Sign in icon" />
                <span className="hidden sm:inline">{t.navSignIn}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              className="min-h-[36px] min-w-[36px] sm:min-h-[38px] sm:min-w-[38px] p-2 rounded-lg border border-stone-200/90 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-amber-300 hover:border-[#7A1224]/40 transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" aria-label="Light mode sun icon" />
              ) : (
                <Moon className="w-4 h-4" aria-label="Dark mode moon icon" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-[#FAF8F5]/95 dark:bg-[#0D0B0E]/95 backdrop-blur-xl border-t border-stone-200 dark:border-stone-800 grid items-center px-0.5 ${
          isAdmin ? 'grid-cols-7' : 'grid-cols-6'
        }`}
      >
        {navItems.map((item) => {
          const active = isEventActive(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-label={item.ariaLabel}
              aria-current={active ? 'page' : undefined}
              className={`relative min-h-[44px] flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer min-w-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7A1224] ${
                active
                  ? 'text-[#7A1224] dark:text-amber-400 font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="mobile-nav-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute top-0.5 w-6 h-0.5 rounded-full bg-[#7A1224] dark:bg-amber-400"
                />
              )}
              <div className="relative">
                {item.icon}
                {item.id === 'tickets' && ticketCount > 0 && (
                  <span
                    aria-label={`${ticketCount} tickets`}
                    className="-top-1.5 -right-2.5 absolute font-mono tabular-nums text-[9px] font-bold text-[#7A1224] dark:text-amber-300"
                  >
                    {ticketCount}
                  </span>
                )}
              </div>
              <span className="text-[9.5px] sm:text-[10px] tracking-tight mt-0.5 truncate max-w-full px-0.5">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
