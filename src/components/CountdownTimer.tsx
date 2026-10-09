import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface CountdownTimerProps {
  targetDate: string;
  variant?: 'hero' | 'detail' | 'inline';
}

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateTimeLeft(targetIso: string): TimeParts {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, isPast: false };
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  variant = 'hero',
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeParts>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targetDate));
    const timer = window.setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [targetDate]);

  const { t } = useI18n();
  const pad = (n: number) => String(n).padStart(2, '0');

  if (timeLeft.isPast) {
    return (
      <div
        role="timer"
        aria-live="polite"
        aria-label={t.eventCommenced}
        className="inline-flex items-center gap-2 font-mono text-sm sm:text-base font-bold text-amber-400"
      >
        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-pulse" aria-label="Event commenced clock icon" />
        <span>{t.eventCommenced}</span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <span
        role="timer"
        aria-label={`${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds remaining`}
        className="inline-flex items-center gap-1.5 font-mono tabular-nums text-xs sm:text-sm font-bold text-amber-300 bg-black/65 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-amber-400/35 shadow-xs"
      >
        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-label="Countdown clock icon" />
        <span>
          {timeLeft.days}d : {pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s
        </span>
      </span>
    );
  }

  const units = [
    { label: t.days, value: pad(timeLeft.days) },
    { label: t.hours, value: pad(timeLeft.hours) },
    { label: t.minutes, value: pad(timeLeft.minutes) },
    { label: t.seconds, value: pad(timeLeft.seconds) },
  ];

  if (variant === 'detail') {
    return (
      <div
        role="timer"
        aria-label={`Live countdown to event start: ${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds`}
        className="grid grid-cols-4 gap-2 sm:gap-3"
      >
        {units.map((unit) => (
          <div
            key={unit.label}
            className="rounded-2xl bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950 border border-stone-200/90 dark:border-stone-800 border-t-2 border-t-[#7A1224] dark:border-t-amber-400 px-2.5 py-3.5 sm:py-4 text-center shadow-xs"
          >
            <div className="font-mono tabular-nums text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#7A1224] dark:text-amber-400 tracking-tight">
              {unit.value}
            </div>
            <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mt-1 truncate">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Hero variant — Enlarged High-Visibility Command Clock
  return (
    <div
      role="timer"
      aria-label={`Live countdown to next school event: ${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds`}
      className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-2xl w-full"
    >
      {units.map((unit) => (
        <div
          key={unit.label}
          className="relative rounded-2xl bg-gradient-to-b from-black/75 to-black/55 backdrop-blur-md border-2 border-amber-400/40 border-t-amber-300/80 px-2.5 py-3.5 sm:px-5 sm:py-5 text-center min-w-0 shadow-2xl ring-1 ring-amber-400/15"
        >
          <div className="font-mono tabular-nums text-2xl sm:text-5xl lg:text-6xl font-extrabold text-amber-300 tracking-tight leading-none drop-shadow-sm">
            {unit.value}
          </div>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-100/90 mt-1.5 sm:mt-2 truncate">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
};
