import { SchoolEvent, Announcement, LiveUpdate, Ticket, EventCategory } from '../types';
import cricketBanner from '../assets/images/ananda_cricket_encounter_1791468783919.jpg';
import debateBanner from '../assets/images/kularatne_auditorium_debate_1791468797282.jpg';
import scienceBanner from '../assets/images/science_exhibition_hall_1791468810935.jpg';
import athleticsBanner from '../assets/images/athletics_meet_stadium_1791468823845.jpg';
import parentsMeetingBanner from '../assets/images/parents_meeting_olcott_hall.jpg';
import photographicExhibitionBanner from '../assets/images/photographic_exhibition_gallery.jpg';

/**
 * Helper to create an ISO date relative to "now" by adding days, hours, and minutes.
 * Ensures all countdowns, live feeds, and calendar views stay perpetually active and realistic.
 */
function relativeDate(daysOffset: number, hoursOffset = 0, minutesOffset = 0): string {
  const now = new Date();
  const target = new Date(
    now.getTime() +
      daysOffset * 24 * 60 * 60 * 1000 +
      hoursOffset * 60 * 60 * 1000 +
      minutesOffset * 60 * 1000
  );
  // Round seconds to 00 for clean event scheduling unless it's a recent past timestamp
  if (daysOffset >= 0 && hoursOffset >= 0 && minutesOffset >= 0) {
    target.setSeconds(0, 0);
  }
  return target.toISOString();
}

export const PRESET_BANNERS = [
  { label: 'Athletics Stadium', url: athleticsBanner },
  { label: 'Kularatne Auditorium', url: debateBanner },
  { label: 'Science & Robotics Hall', url: scienceBanner },
  { label: 'Battle of the Maroons Cricket', url: cricketBanner },
  { label: 'Parents Meeting Hall', url: parentsMeetingBanner },
  { label: 'Photographic Exhibition Gallery', url: photographicExhibitionBanner },
];

export const CATEGORY_META: Record<
  EventCategory,
  {
    badgeBg: string;
    badgeText: string;
    dotColor: string;
    borderAccent: string;
  }
> = {
  Sports: {
    badgeBg: 'bg-rose-950/10 dark:bg-rose-950/50 border-rose-800/25 dark:border-rose-700/40',
    badgeText: 'text-[#7A1224] dark:text-rose-300',
    dotColor: 'bg-[#7A1224] dark:bg-rose-400',
    borderAccent: 'border-l-[#7A1224]',
  },
  Debate: {
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-600/25 dark:border-amber-500/30',
    badgeText: 'text-amber-800 dark:text-amber-300',
    dotColor: 'bg-amber-500',
    borderAccent: 'border-l-amber-500',
  },
  Exhibition: {
    badgeBg: 'bg-teal-600/10 dark:bg-teal-500/15 border-teal-700/25 dark:border-teal-500/30',
    badgeText: 'text-teal-800 dark:text-teal-300',
    dotColor: 'bg-teal-600 dark:bg-teal-400',
    borderAccent: 'border-l-teal-600',
  },
  Academic: {
    badgeBg: 'bg-sky-600/10 dark:bg-sky-500/15 border-sky-700/25 dark:border-sky-500/30',
    badgeText: 'text-sky-800 dark:text-sky-300',
    dotColor: 'bg-sky-600 dark:bg-sky-400',
    borderAccent: 'border-l-sky-600',
  },
  Cultural: {
    badgeBg: 'bg-purple-600/10 dark:bg-purple-500/15 border-purple-700/25 dark:border-purple-500/30',
    badgeText: 'text-purple-800 dark:text-purple-300',
    dotColor: 'bg-purple-600 dark:bg-purple-400',
    borderAccent: 'border-l-purple-600',
  },
  "Parents' Meeting": {
    badgeBg: 'bg-emerald-600/10 dark:bg-emerald-500/15 border-emerald-700/25 dark:border-emerald-500/30',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    dotColor: 'bg-emerald-600 dark:bg-emerald-400',
    borderAccent: 'border-l-emerald-600',
  },
};

export const INITIAL_EVENTS: SchoolEvent[] = [
  {
    id: 'evt-interhouse-athletics',
    title: 'Annual Inter-House Athletics Championship',
    subtitle: 'Vijaya, Gemunu, Parakrama & Ashoka Track and Field Finals',
    category: 'Sports',
    description:
      'The premier track and field spectacle of the Ananda College sporting calendar. Athletes from Vijaya, Gemunu, Parakrama, and Ashoka Houses compete across 32 track, relay, and field disciplines for the Colonel Henry Steel Olcott Championship Shield, culminating in the ceremonial Cadet Band march-past.',
    venue: 'Colonel G.W. Rajapaksa Stadium',
    startDate: relativeDate(1, 3, 45),
    endDate: relativeDate(1, 9, 45),
    totalSeats: 450,
    registeredCount: 382,
    organizer: 'Ananda College Sports Council & Physical Education Dept.',
    imageUrl: athleticsBanner,
    featured: true,
    schedule: [
      {
        id: 'sch-1',
        time: '08:00 AM',
        title: 'Hoisting of the College & House Flags and National Anthem',
        speakerOrLead: 'Principal & Senior Prefect Guild',
        locationNote: 'Main Pavilion',
      },
      {
        id: 'sch-2',
        time: '08:45 AM',
        title: 'Under-16 & Under-18 100m, 200m, and 400m Hurdles Heats',
        speakerOrLead: 'Track Officials',
        locationNote: 'Main Tartan Track',
      },
      {
        id: 'sch-3',
        time: '11:15 AM',
        title: 'High Jump, Long Jump & Javelin Throw Finals',
        speakerOrLead: 'Field Referees',
        locationNote: 'Eastern Field Sector',
      },
      {
        id: 'sch-4',
        time: '02:00 PM',
        title: '4x100m & 4x400m Inter-House Championship Relays',
        speakerOrLead: 'House Captains — Vijaya, Gemunu, Parakrama, Ashoka',
        locationNote: 'Main Track',
      },
      {
        id: 'sch-5',
        time: '03:30 PM',
        title: 'Grand March-Past, Cadet Platoon Drill & Shield Presentation',
        speakerOrLead: 'Chief Guest & Principal',
        locationNote: 'Grandstand',
      },
    ],
  },
  {
    id: 'evt-junior-debate-finals',
    title: 'All-Island Junior English & Sinhala Debate Finals',
    subtitle: 'P. de S. Kularatne Memorial Trophy Grand Parliamentary Debate',
    category: 'Debate',
    description:
      'Witness razor-sharp rhetoric and parliamentary analysis as the Junior Debating Pool confronts contemporary questions on artificial intelligence governance, heritage conservation, and climate economics before a panel of distinguished Old Anandian jurists.',
    venue: 'Kularatne Auditorium',
    startDate: relativeDate(3, 5, 0),
    endDate: relativeDate(3, 9, 0),
    totalSeats: 100,
    registeredCount: 100,
    organizer: 'Ananda College English & Sinhala Debating Societies',
    imageUrl: debateBanner,
    schedule: [
      {
        id: 'sch-d1',
        time: '01:30 PM',
        title: 'Seating of Delegations & Motion Announcement for Impromptu Round',
        speakerOrLead: 'Chief Adjudicator',
        locationNote: 'Kularatne Auditorium Foyer',
      },
      {
        id: 'sch-d2',
        time: '02:15 PM',
        title: 'Sinhala Medium Grand Final Debate',
        speakerOrLead: 'Ananda A vs. Visiting Finalist Team',
        locationNote: 'Main Stage',
      },
      {
        id: 'sch-d3',
        time: '03:45 PM',
        title: 'English Medium Grand Final for the Kularatne Shield',
        speakerOrLead: 'Junior Varsity Squad',
        locationNote: 'Main Stage',
      },
      {
        id: 'sch-d4',
        time: '05:00 PM',
        title: 'Adjudication Feedback & Best Speaker Awards',
        speakerOrLead: 'Panel of Old Anandian Barristers',
        locationNote: 'Main Stage',
      },
    ],
  },
  {
    id: 'evt-grade9-parents-meeting',
    title: "Parents' Meeting — Grade 9 Academic & O/L Pathway Briefing",
    subtitle: 'Mid-Year Progress Review & Elective Subject Stream Consultation',
    category: "Parents' Meeting",
    description:
      'Mandatory interactive consultation for parents and guardians of Grade 9 students. Sectional heads and class teachers will present term assessment analytics, basket subject selection guidelines ahead of Grade 10, and co-curricular balance recommendations.',
    venue: 'Olcott Hall',
    startDate: relativeDate(6, 2, 0),
    endDate: relativeDate(6, 5, 30),
    totalSeats: 220,
    registeredCount: 168,
    organizer: 'Grade 9 Sectional Head & Academic Affairs Committee',
    imageUrl: parentsMeetingBanner,
    schedule: [
      {
        id: 'sch-p1',
        time: '08:30 AM',
        title: 'Registration & Distribution of Individual Academic Dossiers',
        speakerOrLead: 'Grade 9 Class Teachers (9-A to 9-M)',
        locationNote: 'Olcott Hall Verandah',
      },
      {
        id: 'sch-p2',
        time: '09:00 AM',
        title: 'Keynote on Academic Standards & G.C.E. O/L Preparation Roadmap',
        speakerOrLead: 'Deputy Principal (Academics)',
        locationNote: 'Olcott Hall Main Floor',
      },
      {
        id: 'sch-p3',
        time: '10:15 AM',
        title: 'One-on-One Teacher & Parent Subject Consultations',
        speakerOrLead: 'Sectional Faculty',
        locationNote: 'Designated Classroom Bays',
      },
    ],
  },
  {
    id: 'evt-science-exhibition',
    title: 'Ananda Vidya — Annual Science, Robotics & Astronomy Exhibition',
    subtitle: 'Student Research Prototypes, Autonomous Rover Demo & Planetarium Dome',
    category: 'Exhibition',
    description:
      'Over 65 student-engineered inventions across biomedical sensors, renewable micro-grids, machine vision robotics, and deep-sky astrophotography. Hosted jointly by the Senior Science Union, Robotics Society, and Ananda College Astronomical Association.',
    venue: 'Olcott Hall & Harischandra Wijetunga Science Complex',
    startDate: relativeDate(10, 1, 30),
    endDate: relativeDate(10, 8, 30),
    totalSeats: 300,
    registeredCount: 214,
    organizer: 'Ananda College Senior Science Union & Robotics Club',
    imageUrl: scienceBanner,
    schedule: [
      {
        id: 'sch-s1',
        time: '09:00 AM',
        title: 'Ceremonial Ribbon Cutting & Autonomous Bot Salute',
        speakerOrLead: 'Senior Science Union President',
        locationNote: 'Olcott Hall Entrance',
      },
      {
        id: 'sch-s2',
        time: '10:30 AM',
        title: 'Live Line-Following & Micromouse Robotics Challenge',
        speakerOrLead: 'AC Robotics Lab Team',
        locationNote: 'Physics Wing Ground Floor',
      },
      {
        id: 'sch-s3',
        time: '01:30 PM',
        title: 'Mobile Planetarium Sessions & Solar Telescope Observation',
        speakerOrLead: 'Astronomical Association',
        locationNote: 'Science Complex Courtyard',
      },
      {
        id: 'sch-s4',
        time: '04:00 PM',
        title: 'Young Innovator Gold Medal Announcement',
        speakerOrLead: 'University of Moratuwa Guest Jury',
        locationNote: 'Olcott Hall',
      },
    ],
  },
  {
    id: 'evt-battle-of-maroons',
    title: 'Ananda–Nalanda Battle of the Maroons Cricket Encounter',
    subtitle: 'Traditional Maroon & Gold Big Match & Limited Overs Fixture',
    category: 'Sports',
    description:
      'The historic fraternal clash between Ananda College and Nalanda College, celebrating nearly a century of Buddhist education, sportsmanship, and camaraderie. Reserve your pavilion passes early for the First XI encounter and Old Boys parade.',
    venue: 'SSC Oval & Colonel G.W. Rajapaksa Stadium Pavilion',
    startDate: relativeDate(15, 2, 0),
    endDate: relativeDate(15, 11, 0),
    totalSeats: 600,
    registeredCount: 540,
    organizer: 'Battle of the Maroons Joint Organizing Committee',
    imageUrl: cricketBanner,
    featured: true,
    schedule: [
      {
        id: 'sch-c1',
        time: '08:30 AM',
        title: 'Traditional Coin Toss & Presentation of First XI Teams',
        speakerOrLead: '1st XI Captains & Principals of Ananda and Nalanda',
        locationNote: 'Center Pitch',
      },
      {
        id: 'sch-c2',
        time: '09:00 AM',
        title: 'Morning Session — First Innings Commencement',
        speakerOrLead: 'First XI Squad',
        locationNote: 'Main Oval',
      },
      {
        id: 'sch-c3',
        time: '12:30 PM',
        title: 'Luncheon Interval & Brass Band Field Performance',
        speakerOrLead: 'Ananda & Nalanda Western Brass Bands',
        locationNote: 'Maroon & Gold Enclosure',
      },
      {
        id: 'sch-c4',
        time: '05:15 PM',
        title: 'Presentation of Dr. N.M. Perera Memorial Trophy',
        speakerOrLead: 'Joint Match Stewards',
        locationNote: 'Main Pavilion Balcony',
      },
    ],
  },
  {
    id: 'evt-rhythm-of-maroons',
    title: 'Prasanga — Symphony of the Maroons Cultural & Oriental Music Night',
    subtitle: 'Classical Hewisi, Kandyan Ves Dance & Orchestral Fusion Showcase',
    category: 'Cultural',
    description:
      'An evening of Sri Lankan cultural heritage and orchestral artistry at Kularatne Auditorium. Featuring the award-winning Ananda College Oriental Music Orchestra, Hewisi Band, and dramatic excerpts from traditional Nadagam and contemporary Sinhala theatre.',
    venue: 'Kularatne Auditorium',
    startDate: relativeDate(21, 9, 0),
    endDate: relativeDate(21, 13, 0),
    totalSeats: 350,
    registeredCount: 275,
    organizer: 'Aesthetic Circle & Oriental Music Society',
    imageUrl: debateBanner,
    schedule: [
      {
        id: 'sch-cu1',
        time: '05:30 PM',
        title: 'Lighting of the Traditional Oil Lamp & Magul Bera',
        speakerOrLead: 'Senior Hewisi Troupe',
        locationNote: 'Kularatne Stage',
      },
      {
        id: 'sch-cu2',
        time: '06:15 PM',
        title: ' orchestral Raga & Vannam Symphonic Suite',
        speakerOrLead: '60-Piece Oriental Orchestra',
        locationNote: 'Main Auditorium',
      },
      {
        id: 'sch-cu3',
        time: '07:45 PM',
        title: 'Kandyan Ves & Low-Country Devil Dance Choreography',
        speakerOrLead: 'Senior Dance Ensemble',
        locationNote: 'Main Auditorium',
      },
    ],
  },
  {
    id: 'evt-al-stem-colloquium',
    title: 'Annual G.C.E. A/L Combined Mathematics & Physics Olympiad Colloquium',
    subtitle: 'Advanced Problem-Solving Symposium & University Faculty Panel',
    category: 'Academic',
    description:
      'Intensive academic seminar for Grade 12 and Grade 13 Physical and Biological Science students. Features live Olympiad proof breakdowns, past-paper mechanics clinics, and engineering career pathways led by eminent Old Anandian professors.',
    venue: 'Fritz Kunz Memorial Hall',
    startDate: relativeDate(28, 1, 0),
    endDate: relativeDate(28, 6, 30),
    totalSeats: 180,
    registeredCount: 134,
    organizer: 'Senior Mathematics & Physics Societies',
    imageUrl: scienceBanner,
    schedule: [
      {
        id: 'sch-a1',
        time: '08:30 AM',
        title: 'Pure Mathematics Proof Strategies & Olympiad Combinatorics',
        speakerOrLead: 'Guest Lecturer — Dept. of Mathematics',
        locationNote: 'Fritz Kunz Hall',
      },
      {
        id: 'sch-a2',
        time: '11:00 AM',
        title: 'Electromagnetism & Classical Mechanics Timed Challenge',
        speakerOrLead: 'Senior Physics Faculty',
        locationNote: 'Fritz Kunz Hall',
      },
      {
        id: 'sch-a3',
        time: '01:30 PM',
        title: 'Q&A Forum with Recent Island-Rank Old Anandians',
        speakerOrLead: '2025/2026 Merit Scholars',
        locationNote: 'Main Stage',
      },
    ],
  },
  {
    id: 'evt-photographic-salon',
    title: 'Lenses of Maradana — 74th Annual Photographic Art Exhibition',
    subtitle: 'Monochrome Heritage, Wildlife & Street Documentary Gallery',
    category: 'Exhibition',
    description:
      'Curated gallery exhibition by the Ananda College Photographic Art Society, showcasing 120 framed prints across Sri Lankan wildlife conservation, architectural heritage of Colombo, and school life chronicles.',
    venue: 'Olcott Hall',
    startDate: relativeDate(1, 5, 0),
    endDate: relativeDate(1, 10, 0),
    totalSeats: 150,
    registeredCount: 88,
    organizer: 'Ananda College Photographic Art Society (ACPAS)',
    imageUrl: photographicExhibitionBanner,
    schedule: [
      {
        id: 'sch-ph1',
        time: '09:30 AM',
        title: 'Gallery Opening & Curatorial Walk-Through',
        speakerOrLead: 'Master-in-Charge & ACPAS Committee',
        locationNote: 'Olcott Hall Gallery Wing',
      },
      {
        id: 'sch-ph2',
        time: '02:00 PM',
        title: 'Masterclass on Documentary Lighting & Composition',
        speakerOrLead: 'Guest Photojournalist',
        locationNote: 'Seminar Corner',
      },
    ],
  },
  {
    id: 'evt-grade12-parents-forum',
    title: "Parents' Meeting — Grade 12 A/L Stream Orientation & Mentorship",
    subtitle: 'Laboratory Safety, Continuous Assessment & University Admission Briefing',
    category: "Parents' Meeting",
    description:
      'Essential briefing for parents of newly inducted Grade 12 Advanced Level students across Physical Science, Biological Science, Commerce, Arts, and Technology streams.',
    venue: 'Kularatne Auditorium',
    startDate: relativeDate(44, 1, 30),
    endDate: relativeDate(44, 4, 30),
    totalSeats: 280,
    registeredCount: 195,
    organizer: 'Advanced Level Sectional Heads',
    imageUrl: debateBanner,
    schedule: [
      {
        id: 'sch-pm1',
        time: '08:30 AM',
        title: 'Principal’s Address on Advanced Level Academic Discipline',
        speakerOrLead: 'Principal, Ananda College',
        locationNote: 'Kularatne Auditorium',
      },
      {
        id: 'sch-pm2',
        time: '10:00 AM',
        title: 'Stream-Specific Breakout Sessions (Science, Commerce, Arts, Tech)',
        speakerOrLead: 'Stream Coordinators',
        locationNote: 'Sectional Lecture Halls',
      },
    ],
  },
  {
    id: 'evt-annual-prize-giving',
    title: 'Annual Prize Giving & Academic Honours Convocation',
    subtitle: 'Celebration of Island Merit Ranks, Sports Colours & Leadership',
    category: 'Academic',
    description:
      'The most solemn and prestigious convocation of the academic year at Ananda College. Honours students who have excelled in national examinations, international Olympiads, and national-level sports under the timeless motto "අප්පමාදෝ අමතපදං".',
    venue: 'Kularatne Auditorium',
    startDate: relativeDate(54, 1, 0),
    endDate: relativeDate(54, 5, 30),
    totalSeats: 400,
    registeredCount: 364,
    organizer: 'College Administration & Old Boys’ Association Executive',
    imageUrl: debateBanner,
    featured: true,
    schedule: [
      {
        id: 'sch-pg1',
        time: '08:00 AM',
        title: 'Ceremonial Procession & Floral Tribute to Col. Henry Steel Olcott Statue',
        speakerOrLead: 'Principal, Chief Guest & Senior Prefects',
        locationNote: 'Front Quadrangle',
      },
      {
        id: 'sch-pg2',
        time: '09:00 AM',
        title: 'Presentation of the Annual College Report',
        speakerOrLead: 'Principal',
        locationNote: 'Kularatne Auditorium',
      },
      {
        id: 'sch-pg3',
        time: '10:15 AM',
        title: 'Conferral of Special Memorial Prizes & Gold Medals',
        speakerOrLead: 'Chief Guest',
        locationNote: 'Kularatne Auditorium',
      },
    ],
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Gate Entry & Traffic Plan for Inter-House Athletics Finals at Rajapaksa Stadium',
    body: 'All students and parents attending the Annual Inter-House Athletics Championship must present their AC Synapse digital QR pass at Gate 02 (Main Pavilion Entrance). School buses will depart from the Maradana Main Gate at 06:45 AM sharp.',
    category: 'Sports',
    createdAt: relativeDate(0, -2, -15),
    author: 'Prefects’ Guild & Sports Council',
    isUrgent: true,
    isPinned: true,
    relatedEventId: 'evt-interhouse-athletics',
  },
  {
    id: 'ann-2',
    title: 'Grade 9 Parents’ Meeting Seating Assignments by Class Section',
    body: 'Parents attending the Grade 9 Academic & O/L Pathway Briefing at Olcott Hall are kindly requested to use the Eastern Wing entrance for classes 9-A through 9-F, and the Western Wing entrance for classes 9-G through 9-M.',
    category: "Parents' Meeting",
    createdAt: relativeDate(0, -6, 0),
    author: 'Deputy Principal (Academics)',
    isUrgent: true,
    isPinned: true,
    relatedEventId: 'evt-grade9-parents-meeting',
  },
  {
    id: 'ann-3',
    title: 'Final Abstract & Prototype Check-In for Ananda Vidya Science Exhibition',
    body: 'All participating teams from Grades 8–13 must complete electrical safety verification for their robotics and renewable energy stalls at the Harischandra Wijetunga Science Complex before Friday 02:30 PM.',
    category: 'Exhibition',
    createdAt: relativeDate(-1, -3, 0),
    author: 'Senior Science Union',
    isUrgent: false,
    isPinned: true,
    relatedEventId: 'evt-science-exhibition',
  },
  {
    id: 'ann-4',
    title: 'Junior Debate Finals Adjudication Panel & Audience Etiquette',
    body: 'Doors to Kularatne Auditorium will close 10 minutes prior to the Prime Minister’s opening speech. Electronic devices must be switched to silent mode inside the auditorium.',
    category: 'Debate',
    createdAt: relativeDate(-2, -4, 0),
    author: 'Debating Society Secretary',
    isUrgent: false,
    isPinned: false,
    relatedEventId: 'evt-junior-debate-finals',
  },
  {
    id: 'ann-5',
    title: 'Battle of the Maroons Student Enclosure Passes Quota Open',
    body: 'Student and Parent Maroon & Gold pavilion registrations are now open via AC Synapse. Each student index number is eligible for up to two companion parent passes.',
    category: 'Sports',
    createdAt: relativeDate(-3, -1, 0),
    author: 'Big Match Joint Organizing Committee',
    isUrgent: false,
    isPinned: false,
    relatedEventId: 'evt-battle-of-maroons',
  },
];

export const INITIAL_LIVE_UPDATES: LiveUpdate[] = [
  {
    id: 'lu-1',
    eventId: 'evt-interhouse-athletics',
    eventTitle: 'Annual Inter-House Athletics Championship',
    type: 'score',
    headline: 'Vijaya House surges ahead after Under-18 400m Hurdles & Javelin Qualifications',
    detail: 'Overall House Standings heading into tomorrow’s finals: Vijaya leads by 14 points following a new meet record in the U-18 Javelin.',
    scoreSummary: 'Vijaya 248 pts · Gemunu 234 pts · Parakrama 219 pts · Ashoka 206 pts',
    timestamp: relativeDate(0, 0, -12),
    venue: 'Colonel G.W. Rajapaksa Stadium',
    isHappeningNow: true,
  },
  {
    id: 'lu-2',
    eventId: 'evt-battle-of-maroons',
    eventTitle: 'Ananda–Nalanda Battle of the Maroons Cricket Encounter',
    type: 'score',
    headline: '1st XI Warm-Up Fixture: Ananda College 214/4 (42.0 overs) at Tea Interval',
    detail: 'Skipper K. Mendis unbeaten on 84* off 102 balls (9 fours, 2 sixes) in the final preparatory turf encounter ahead of the Big Match.',
    scoreSummary: 'Ananda 1st XI 214/4 (42 ov) vs Old Anandians XI',
    timestamp: relativeDate(0, 0, -28),
    venue: 'Colonel G.W. Rajapaksa Stadium Pavilion',
    isHappeningNow: true,
  },
  {
    id: 'lu-3',
    eventId: 'evt-junior-debate-finals',
    eventTitle: 'All-Island Junior English & Sinhala Debate Finals',
    type: 'schedule',
    headline: 'Semi-Final Draw & Motion Categories Released for Kularatne Shield',
    detail: 'The English Medium Grand Final will follow Asian Parliamentary format (3v3) with a 30-minute closed preparation window in Seminar Room 02.',
    timestamp: relativeDate(0, -1, -15),
    venue: 'Kularatne Auditorium',
    isHappeningNow: true,
  },
  {
    id: 'lu-4',
    eventId: 'evt-science-exhibition',
    eventTitle: 'Ananda Vidya — Annual Science, Robotics & Astronomy Exhibition',
    type: 'highlight',
    headline: 'Autonomous Solar Micro-Grid & Braille Refreshable Display Pass Bench Trials',
    detail: 'The Grade 12 Engineering Invention Squad completed a 6-hour continuous stress test on their low-cost tactile reader prototype.',
    timestamp: relativeDate(0, -2, -40),
    venue: 'Harischandra Wijetunga Science Complex',
    isHappeningNow: false,
  },
  {
    id: 'lu-5',
    eventId: 'evt-interhouse-athletics',
    eventTitle: 'Annual Inter-House Athletics Championship',
    type: 'highlight',
    headline: 'Gemunu House Quartet Clocks 43.18s in U-18 4x100m Relay Time Trial',
    detail: 'Fastest qualifying baton exchange recorded on the main tartan track this season.',
    scoreSummary: '1st: Gemunu (43.18s) · 2nd: Parakrama (43.62s)',
    timestamp: relativeDate(0, -4, -10),
    venue: 'Colonel G.W. Rajapaksa Stadium',
    isHappeningNow: false,
  },
  {
    id: 'lu-6',
    eventId: 'evt-rhythm-of-maroons',
    eventTitle: 'Prasanga — Symphony of the Maroons Cultural & Oriental Music Night',
    type: 'schedule',
    headline: 'Full Dress & Acoustic Rehearsal Scheduled at Kularatne Auditorium',
    detail: 'Sound check for the 60-piece Oriental Orchestra and Hewisi troupe moved to 03:00 PM tomorrow to accommodate stage lighting calibration.',
    timestamp: relativeDate(0, -6, -30),
    venue: 'Kularatne Auditorium',
    isHappeningNow: false,
  },
  {
    id: 'lu-7',
    eventId: 'evt-al-stem-colloquium',
    eventTitle: 'Annual G.C.E. A/L Combined Mathematics & Physics Olympiad Colloquium',
    type: 'alert',
    headline: 'Problem Set Booklet & Formula Reference Uploaded for Registered Candidates',
    detail: 'Registered Grade 12 & 13 participants will receive printed problem folios at Fritz Kunz Memorial Hall upon presenting their QR ticket.',
    timestamp: relativeDate(-1, -2, 0),
    venue: 'Fritz Kunz Memorial Hall',
    isHappeningNow: false,
  },
  {
    id: 'lu-8',
    eventId: 'evt-grade9-parents-meeting',
    eventTitle: "Parents' Meeting — Grade 9 Academic & O/L Pathway Briefing",
    type: 'schedule',
    headline: 'Additional Consultation Desk Opened for Aesthetic & IT Basket Subjects',
    detail: 'Subject coordinators for ICT, Eastern Music, and Drama will be stationed at Desk 04 inside Olcott Hall from 10:15 AM.',
    timestamp: relativeDate(-1, -5, 0),
    venue: 'Olcott Hall',
    isHappeningNow: false,
  },
];

export const INITIAL_TICKETS: Ticket[] = [];

