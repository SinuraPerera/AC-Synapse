import React from 'react';
import { Compass, Home, Calendar, Ticket, AlertOctagon, ArrowLeft } from 'lucide-react';
import { PageRoute } from '../types';

interface NotFoundPageProps {
  attemptedPath?: string;
  onNavigate: (page: PageRoute) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ attemptedPath, onNavigate }) => {
  return (
    <div className="max-w-2xl mx-auto py-10 sm:py-16 px-4 text-center">
      <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#7A1224]/10 dark:bg-amber-400/10 border border-[#7A1224]/25 dark:border-amber-400/30 text-[#7A1224] dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#7A1224] dark:text-amber-400">
            Error 404 · Route Not Found
          </p>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100">
            This Campus Venue or Page Does Not Exist
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
            The page{attemptedPath ? ` (${attemptedPath})` : ''} you requested could not be located
            in the AC Synapse directory. Use the quick links below to return to the command center.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#7A1224] hover:bg-[#600E1C] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('events')}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Events</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('calendar')}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>View Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('tickets')}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Ticket className="w-4 h-4" />
            <span>My QR Tickets</span>
          </button>
        </div>

        <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#7A1224] dark:hover:text-amber-300 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Ananda College Command Center</span>
          </button>
        </div>
      </div>
    </div>
  );
};
