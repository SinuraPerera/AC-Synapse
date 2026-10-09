import React, { createContext, useContext, useEffect, useState } from 'react';
import { EventCategory } from '../types';

export type LanguageCode = 'en' | 'si' | 'ta';

export interface LanguageMeta {
  code: LanguageCode;
  shortLabel: string;
  nativeName: string;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'en', shortLabel: 'EN', nativeName: 'English' },
  { code: 'si', shortLabel: 'සිං', nativeName: 'සිංහල' },
  { code: 'ta', shortLabel: 'த', nativeName: 'தமிழ்' },
];

export interface UIStrings {
  // Navigation
  navHome: string;
  navEvents: string;
  navCalendar: string;
  navAnnouncements: string;
  navTickets: string;
  navLiveFeed: string;
  navAdmin: string;
  navNoticesShort: string;
  navSignIn: string;
  navSignOut: string;
  navSwitchAccount: string;

  //Countdown
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  eventCommenced: string;

  // Categories
  catAll: string;
  catSports: string;
  catDebate: string;
  catExhibition: string;
  catAcademic: string;
  catCultural: string;
  catParentsMeeting: string;

  // Home Page
  pinnedNotice: string;
  allNotices: string;
  collegeLocation: string;
  nextMajorEvent: string;
  registerForEvent: string;
  joinWaitlist: string;
  eventDetailsSchedule: string;
  happeningNow: string;
  liveCampusFeedTitle: string;
  openFullLiveFeed: string;
  upcomingSchoolEvents: string;
  upcomingSubtitle: string;
  browseAllEvents: string;
  seatsLeft: string;
  seatsFilled: string;
  fullWaitlistOpen: string;
  details: string;
  register: string;
  waitlist: string;

  // Events Page
  eventsDirectoryTitle: string;
  eventsDirectorySubtitle: string;
  syncButton: string;
  publishEvent: string;
  searchEventsPlaceholder: string;
  allCapacities: string;
  seatsAvailable: string;
  clearFilters: string;

  // Event Detail Page
  backToEvents: string;
  shareEvent: string;
  liveVenueUpdates: string;
  eventOverview: string;
  programmeSchedule: string;
  venueAndPassReservation: string;
  eventCountdown: string;
  addToGoogleCalendar: string;
  downloadIcs: string;

  // Calendar Page
  calendarTitle: string;
  calendarSubtitle: string;
  monthGrid: string;
  agendaView: string;
  today: string;

  // Announcements Page
  announcementsTitle: string;
  announcementsSubtitle: string;
  broadcastNotice: string;
  searchNoticesPlaceholder: string;
  urgent: string;
  pinned: string;

  // My Tickets Page
  ticketsTitle: string;
  ticketsSubtitle: string;
  confirmed: string;
  waitlisted: string;
  uniqueTicketCode: string;
  downloadTicketPng: string;
  cancelRegistration: string;
  noTicketsYet: string;

  // Live Feed Page
  liveFeedTitle: string;
  liveFeedSubtitle: string;
  postLiveUpdate: string;
  allUpdates: string;
  scores: string;
  scheduleChanges: string;
  highlights: string;
  alerts: string;

  // Footer
  officialCollegePortal: string;
  academicCalendar: string;
}

const TRANSLATIONS: Record<LanguageCode, UIStrings> = {
  en: {
    navHome: 'Home',
    navEvents: 'Events',
    navCalendar: 'Calendar',
    navAnnouncements: 'Announcements',
    navTickets: 'My Tickets',
    navLiveFeed: 'Live Feed',
    navAdmin: 'Admin',
    navNoticesShort: 'Notices',
    navSignIn: 'Sign In',
    navSignOut: 'Sign Out',
    navSwitchAccount: 'Switch Account',

    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    eventCommenced: 'Event In Progress / Commenced',

    catAll: 'All',
    catSports: 'Sports',
    catDebate: 'Debate',
    catExhibition: 'Exhibition',
    catAcademic: 'Academic',
    catCultural: 'Cultural',
    catParentsMeeting: "Parents' Meeting",

    pinnedNotice: 'Pinned Notice',
    allNotices: 'All Notices',
    collegeLocation: 'Ananda College, Colombo 10',
    nextMajorEvent: 'Next Major Event',
    registerForEvent: 'Register for Event',
    joinWaitlist: 'Join Waitlist',
    eventDetailsSchedule: 'Event Details & Schedule',
    happeningNow: 'Happening Now',
    liveCampusFeedTitle: 'Live Campus Telemetry & Score Updates',
    openFullLiveFeed: 'Open Full Live Feed',
    upcomingSchoolEvents: 'Upcoming School Events',
    upcomingSubtitle: 'Next 2 months of sports encounters, exhibitions, debates, and assemblies',
    browseAllEvents: 'Browse All Events',
    seatsLeft: 'seats left',
    seatsFilled: 'seats',
    fullWaitlistOpen: 'Full · Waitlist Open',
    details: 'Details',
    register: 'Register',
    waitlist: 'Join Waitlist',

    eventsDirectoryTitle: 'School Events Directory',
    eventsDirectorySubtitle:
      'Browse, filter, and reserve digital passes for upcoming events at Ananda College',
    syncButton: 'Sync',
    publishEvent: 'Publish Event',
    searchEventsPlaceholder:
      'Search by event name, venue (e.g. Kularatne, Olcott Hall), or organizer...',
    allCapacities: 'All Capacities',
    seatsAvailable: 'Seats Available',
    clearFilters: 'Clear Filters',

    backToEvents: 'Back to Events Directory',
    shareEvent: 'Share Event',
    liveVenueUpdates: 'Live Venue Updates',
    eventOverview: 'Event Overview & Guidelines',
    programmeSchedule: 'Programme & Schedule Timeline',
    venueAndPassReservation: 'Venue & Pass Reservation',
    eventCountdown: 'Countdown to Kickoff',
    addToGoogleCalendar: 'Add to Google Calendar',
    downloadIcs: 'Download .ics',

    calendarTitle: 'Academic & Co-Curricular Calendar',
    calendarSubtitle:
      'Interactive monthly schedule with direct Google Calendar & iCalendar (.ics) export',
    monthGrid: 'Month Grid',
    agendaView: 'Agenda View',
    today: 'Today',

    announcementsTitle: 'Official School Announcements',
    announcementsSubtitle:
      'Circulars, venue directives, and urgent notices from Ananda College administration',
    broadcastNotice: 'Broadcast Notice',
    searchNoticesPlaceholder: 'Search notices by keyword, grade, venue, or issuing authority...',
    urgent: 'Urgent',
    pinned: 'Pinned',

    ticketsTitle: 'My Digital Event Passes',
    ticketsSubtitle:
      'Present your scannable RCP QR code pass at Ananda College venue gates or download as PNG',
    confirmed: 'Confirmed',
    waitlisted: 'Waitlisted',
    uniqueTicketCode: 'Unique Ticket Code',
    downloadTicketPng: 'Download Ticket (PNG)',
    cancelRegistration: 'Cancel Registration',
    noTicketsYet: 'No active event tickets yet',

    liveFeedTitle: 'Live Campus Score & Event Feed',
    liveFeedSubtitle: 'Real-time scoreboards, schedule adjustments, highlights, and venue alerts',
    postLiveUpdate: 'Post Live Update',
    allUpdates: 'All Updates',
    scores: 'Scores',
    scheduleChanges: 'Schedule Changes',
    highlights: 'Highlights',
    alerts: 'Alerts',

    officialCollegePortal: 'Official College Portal',
    academicCalendar: 'Academic Calendar',
  },

  si: {
    navHome: 'මුල් පිටුව',
    navEvents: 'උත්සව',
    navCalendar: 'දින දර්ශනය',
    navAnnouncements: 'නිවේදන',
    navTickets: 'මගේ ප්‍රවේශපත්',
    navLiveFeed: 'සජීවී පුවත්',
    navAdmin: 'පරිපාලන',
    navNoticesShort: 'නිවේදන',
    navSignIn: 'පිවිසෙන්න',
    navSignOut: 'ඉවත් වන්න',
    navSwitchAccount: 'ගිණුම මාරු කරන්න',

    days: 'දින',
    hours: 'පැය',
    minutes: 'මිනිත්තු',
    seconds: 'තත්පර',
    eventCommenced: 'උත්සවය දැන් පැවැත්වේ',

    catAll: 'සියල්ල',
    catSports: 'ක්‍රීඩා',
    catDebate: 'විවාද',
    catExhibition: 'ප්‍රදර්ශන',
    catAcademic: 'අධ්‍යාපනික',
    catCultural: 'සංස්කෘතික',
    catParentsMeeting: 'දෙමාපිය රැස්වීම්',

    pinnedNotice: 'විශේෂ නිවේදනය',
    allNotices: 'සියලු නිවේදන',
    collegeLocation: 'ආනන්ද විද්‍යාලය, කොළඹ 10',
    nextMajorEvent: 'මීළඟ ප්‍රධාන උත්සවය',
    registerForEvent: 'ලියාපදිංචි වන්න',
    joinWaitlist: 'පොරොත්තු ලේඛනයට',
    eventDetailsSchedule: 'උත්සව විස්තර සහ කාලසටහන',
    happeningNow: 'දැන් සජීවීව',
    liveCampusFeedTitle: 'සජීවී ලකුණු සහ උත්සව යාවත්කාලීන',
    openFullLiveFeed: 'සම්පූර්ණ සජීවී පුවත්',
    upcomingSchoolEvents: 'ඉදිරි පාසල් උත්සව',
    upcomingSubtitle: 'ඉදිරි මාස 2 තුළ පැවැත්වෙන ක්‍රීඩා, විවාද, ප්‍රදර්ශන සහ රැස්වීම්',
    browseAllEvents: 'සියලු උත්සව බලන්න',
    seatsLeft: 'ආසන ඉතිරිව ඇත',
    seatsFilled: 'ආසන',
    fullWaitlistOpen: 'ආසන පිරී ඇත · පොරොත්තු ලේඛනය විවෘතයි',
    details: 'විස්තර',
    register: 'ලියාපදිංචි වන්න',
    waitlist: 'පොරොත්තු ලේඛනය',

    eventsDirectoryTitle: 'පාසල් උත්සව නාමාවලිය',
    eventsDirectorySubtitle:
      'ආනන්ද විද්‍යාලයේ ඉදිරි උත්සව සොයා බලා ඔබගේ ඩිජිටල් ප්‍රවේශපත් වෙන්කරවා ගන්න',
    syncButton: 'යාවත්කාලීන',
    publishEvent: 'උත්සවයක් එක් කරන්න',
    searchEventsPlaceholder: 'උත්සවයේ නම, ශාලාව (කුලරත්න, ඕල්කට් ශාලාව) හෝ සංවිධායක අනුව සොයන්න...',
    allCapacities: 'සියලු ආසන',
    seatsAvailable: 'ආසන ඇති උත්සව',
    clearFilters: 'පෙරහන් ඉවත් කරන්න',

    backToEvents: 'උත්සව නාමාවලියට ආපසු',
    shareEvent: 'උත්සවය බෙදාගන්න',
    liveVenueUpdates: 'සජීවී යාවත්කාලීන',
    eventOverview: 'උත්සව විස්තර සහ මාර්ගෝපදේශ',
    programmeSchedule: 'වැඩසටහන් කාලසටහන',
    venueAndPassReservation: 'ස්ථානය සහ ප්‍රවේශපත් වෙන්කිරීම',
    eventCountdown: 'උත්සවය ආරම්භයට ඉතිරි කාලය',
    addToGoogleCalendar: 'Google දින දර්ශනයට එක් කරන්න',
    downloadIcs: '.ics බාගත කරන්න',

    calendarTitle: 'අධ්‍යයන සහ විෂය සමගාමී දින දර්ශනය',
    calendarSubtitle: 'මාසික උත්සව කාලසටහන සහ Google Calendar / .ics බාගත කිරීම්',
    monthGrid: 'මාසික දසුන',
    agendaView: 'න්‍යාය පත්‍රය',
    today: 'අද',

    announcementsTitle: 'නිල පාසල් නිවේදන',
    announcementsSubtitle: 'ආනන්ද විද්‍යාලීය පරිපාලනය විසින් නිකුත් කරන ලද නිල චක්‍රලේඛ සහ නිවේදන',
    broadcastNotice: 'නිවේදනයක් පළ කරන්න',
    searchNoticesPlaceholder: 'මූල පදය, ශ්‍රේණිය හෝ ශාලාව අනුව නිවේදන සොයන්න...',
    urgent: 'හදිසි',
    pinned: 'විශේෂ',

    ticketsTitle: 'මගේ ඩිජිටල් ප්‍රවේශපත්',
    ticketsSubtitle: 'ඇතුළුවීමේ දොරටුවේදී ඔබගේ RCP QR කේතය ඉදිරිපත් කරන්න හෝ PNG ලෙස බාගන්න',
    confirmed: 'තහවුරු කළ',
    waitlisted: 'පොරොත්තු ලේඛනයේ',
    uniqueTicketCode: 'ප්‍රවේශපත් අංකය',
    downloadTicketPng: 'ප්‍රවේශපත බාගන්න (PNG)',
    cancelRegistration: 'ලියාපදිංචිය අවලංගු කරන්න',
    noTicketsYet: 'තවමත් ප්‍රවේශපත් ලබාගෙන නොමැත',

    liveFeedTitle: 'සජීවී ලකුණු සහ උත්සව පුවත්',
    liveFeedSubtitle: 'තත්‍ය කාලීන ලකුණු පුවරු, කාලසටහන් වෙනස්වීම් සහ විශේෂ අවස්ථා',
    postLiveUpdate: 'සජීවී පුවතක් එක් කරන්න',
    allUpdates: 'සියලු පුවත්',
    scores: 'ලකුණු',
    scheduleChanges: 'කාලසටහන් වෙනස්වීම්',
    highlights: 'විශේෂ අවස්ථා',
    alerts: 'දැනුම්දීම්',

    officialCollegePortal: 'නිල විද්‍යාලීය වෙබ් අඩවිය',
    academicCalendar: 'අධ්‍යයන දින දර්ශනය',
  },

  ta: {
    navHome: 'முகப்பு',
    navEvents: 'நிகழ்வுகள்',
    navCalendar: 'நாட்காட்டி',
    navAnnouncements: 'அறிவிப்புகள்',
    navTickets: 'எனது நுழைவுச்சீட்டுகள்',
    navLiveFeed: 'நேரலை',
    navAdmin: 'நிர்வாகம்',
    navNoticesShort: 'அறிவிப்பு',
    navSignIn: 'உள்நுழைய',
    navSignOut: 'வெளியேறு',
    navSwitchAccount: 'கணக்கை மாற்று',

    days: 'நாட்கள்',
    hours: 'மணி',
    minutes: 'நிமிடம்',
    seconds: 'நொடி',
    eventCommenced: 'நிகழ்வு நடைபெறுகிறது',

    catAll: 'அனைத்தும்',
    catSports: 'விளையாட்டு',
    catDebate: 'விவாதம்',
    catExhibition: 'கண்காட்சி',
    catAcademic: 'கல்வி',
    catCultural: 'கலாச்சாரம்',
    catParentsMeeting: 'பெற்றோர் கூட்டம்',

    pinnedNotice: 'முக்கிய அறிவிப்பு',
    allNotices: 'அனைத்து அறிவிப்புகள்',
    collegeLocation: 'ஆனந்தா கல்லூரி, கொழும்பு 10',
    nextMajorEvent: 'அடுத்த முக்கிய நிகழ்வு',
    registerForEvent: 'நிகழ்விற்கு பதிவு செய்க',
    joinWaitlist: 'காத்திருப்புப் பட்டியல்',
    eventDetailsSchedule: 'நிகழ்வு விவரங்கள் & நிரல்',
    happeningNow: 'இப்போது நேரலையில்',
    liveCampusFeedTitle: 'நேரலை புள்ளிகள் மற்றும் நிகழ்வு தகவல்கள்',
    openFullLiveFeed: 'முழு நேரலைப் பட்டியல்',
    upcomingSchoolEvents: 'வரவிருக்கும் பாடசாலை நிகழ்வுகள்',
    upcomingSubtitle: 'அடுத்த 2 மாத விளையாட்டு, விவாதம், கண்காட்சி மற்றும் கூட்டங்கள்',
    browseAllEvents: 'அனைத்து நிகழ்வுகளும்',
    seatsLeft: 'இருக்கைகள் உள்ளன',
    seatsFilled: 'இருக்கைகள்',
    fullWaitlistOpen: 'நிறைந்தது · காத்திருப்பு பட்டியல்',
    details: 'விவரம்',
    register: 'பதிவு செய்',
    waitlist: 'காத்திருப்பு',

    eventsDirectoryTitle: 'பாடசாலை நிகழ்வுகள் பட்டியல்',
    eventsDirectorySubtitle:
      'ஆனந்தா கல்லூரியின் நிகழ்வுகளைத் தேடி உங்கள் டிஜிட்டல் நுழைவுச்சீட்டைப் பெறுங்கள்',
    syncButton: 'புதுப்பி',
    publishEvent: 'நிகழ்வை வெளியிடு',
    searchEventsPlaceholder: 'நிகழ்வு பெயர், மண்டபம் அல்லது ஏற்பாட்டாளர் மூலம் தேடுக...',
    allCapacities: 'அனைத்து இடங்கள்',
    seatsAvailable: 'இருக்கைகள் உள்ளவை',
    clearFilters: 'வடிகட்டிகளை நீக்கு',

    backToEvents: 'நிகழ்வுகள் பட்டியலுக்குத் திரும்பு',
    shareEvent: 'நிகழ்வைப் பகிர்',
    liveVenueUpdates: 'நேரலை நிகழ்வு தகவல்கள்',
    eventOverview: 'நிகழ்வு விவரங்கள் மற்றும் வழிகாட்டிகள்',
    programmeSchedule: 'நிகழ்ச்சி நிரல்',
    venueAndPassReservation: 'இடம் மற்றும் நுழைவுச்சீட்டு முன்பதிவு',
    eventCountdown: 'நிகழ்வு தொடங்க மீதமுள்ள நேரம்',
    addToGoogleCalendar: 'Google நாட்காட்டியில் சேர்',
    downloadIcs: '.ics பதிவிறக்கம்',

    calendarTitle: 'கல்வி மற்றும் இணை பாடவிதான நாட்காட்டி',
    calendarSubtitle: 'மாதாந்திர நிகழ்வு அட்டவணை மற்றும் Google Calendar / .ics பதிவிறக்கம்',
    monthGrid: 'மாதக் கட்டம்',
    agendaView: 'நிகழ்ச்சிப் பட்டியல்',
    today: 'இன்று',

    announcementsTitle: 'உத்தியோகபூர்வ பாடசாலை அறிவிப்புகள்',
    announcementsSubtitle: 'ஆனந்தா கல்லூரி நிர்வாகத்தின் சுற்றறிக்கைகள் மற்றும் அவசர அறிவிப்புகள்',
    broadcastNotice: 'அறிவிப்பை வெளியிடு',
    searchNoticesPlaceholder: 'சொல், தரம் அல்லது மண்டபம் மூலம் அறிவிப்புகளைத் தேடுக...',
    urgent: 'அவசரம்',
    pinned: 'நிலைநிறுத்தப்பட்டது',

    ticketsTitle: 'எனது டிஜிட்டல் நுழைவுச்சீட்டுகள்',
    ticketsSubtitle: 'நுழைவாயிலில் உங்கள் RCP QR குறியீட்டைக் காண்பிக்கவும் அல்லது PNG ஆக பதிவிறக்கவும்',
    confirmed: 'உறுதிசெய்யப்பட்டது',
    waitlisted: 'காத்திருப்புப் பட்டியல்',
    uniqueTicketCode: 'நுழைவுச்சீட்டு குறியீடு',
    downloadTicketPng: 'நுழைவுச்சீட்டை பதிவிறக்கு (PNG)',
    cancelRegistration: 'பதிவை ரத்து செய்',
    noTicketsYet: 'இன்னும் நுழைவுச்சீட்டுகள் எதுவும் இல்லை',

    liveFeedTitle: 'நேரலை புள்ளிகள் மற்றும் நிகழ்வு ஓடை',
    liveFeedSubtitle: 'நிகழ்நேர புள்ளிகள், நேர மாற்றங்கள் மற்றும் முக்கிய துளிகள்',
    postLiveUpdate: 'நேரலை தகவலை இடு',
    allUpdates: 'அனைத்தும்',
    scores: 'புள்ளிகள்',
    scheduleChanges: 'நேர மாற்றம்',
    highlights: 'சிறப்புத் துளிகள்',
    alerts: 'எச்சரிக்கைகள்',

    officialCollegePortal: 'கல்லூரி இணையதளம்',
    academicCalendar: 'கல்வி நாட்காட்டி',
  },
};

const LANG_STORAGE_KEY = 'ac_synapse_lang_v1';

interface I18nContextValue {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: UIStrings;
  translateCategory: (cat: 'All' | EventCategory | 'General') => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: TRANSLATIONS.en,
  translateCategory: (c) => c,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'en' || saved === 'si' || saved === 'ta') return saved;
    } catch {
      // Ignore storage error
    }
    return 'en';
  });

  const setLang = (next: LanguageCode) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // Ignore storage error
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === LANG_STORAGE_KEY &&
        (e.newValue === 'en' || e.newValue === 'si' || e.newValue === 'ta')
      ) {
        setLangState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const t = TRANSLATIONS[lang];

  const translateCategory = (cat: 'All' | EventCategory | 'General'): string => {
    switch (cat) {
      case 'All':
        return t.catAll;
      case 'Sports':
        return t.catSports;
      case 'Debate':
        return t.catDebate;
      case 'Exhibition':
        return t.catExhibition;
      case 'Academic':
        return t.catAcademic;
      case 'Cultural':
        return t.catCultural;
      case "Parents' Meeting":
        return t.catParentsMeeting;
      default:
        return cat;
    }
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, translateCategory }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  return useContext(I18nContext);
}
