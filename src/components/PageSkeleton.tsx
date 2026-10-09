import React from 'react';

export const PageSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading AC Synapse content"
      className="space-y-8 animate-pulse py-2"
    >
      {/* Hero Skeleton */}
      <div className="rounded-2xl bg-stone-200/80 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-8 h-72 sm:h-80 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="h-4 w-40 rounded-md bg-stone-300 dark:bg-stone-800" />
          <div className="h-8 sm:h-10 w-3/4 max-w-xl rounded-lg bg-stone-300 dark:bg-stone-800" />
          <div className="h-4 w-1/2 max-w-md rounded-md bg-stone-300 dark:bg-stone-800" />
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-stone-300/90 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
            />
          ))}
        </div>
      </div>

      {/* Strip Skeleton */}
      <div className="rounded-xl bg-stone-200/60 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 p-4 flex items-center justify-between gap-4">
        <div className="h-4 w-2/3 rounded bg-stone-300 dark:bg-stone-800" />
        <div className="h-4 w-20 rounded bg-stone-300 dark:bg-stone-800 shrink-0" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2].map((card) => (
          <div
            key={card}
            className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden"
          >
            <div className="h-44 bg-stone-200 dark:bg-stone-800" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-24 rounded bg-stone-200 dark:bg-stone-800" />
              <div className="h-5 w-5/6 rounded bg-stone-300 dark:bg-stone-700" />
              <div className="h-3 w-2/3 rounded bg-stone-200 dark:bg-stone-800" />
              <div className="pt-2 flex items-center justify-between">
                <div className="h-4 w-20 rounded bg-stone-200 dark:bg-stone-800" />
                <div className="h-8 w-24 rounded-lg bg-stone-300 dark:bg-stone-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading school events and live updates...</span>
    </div>
  );
};
