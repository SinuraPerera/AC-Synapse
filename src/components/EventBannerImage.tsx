import React, { useState } from 'react';
import { EventCategory } from '../types';

interface EventBannerImageProps {
  src: string;
  alt: string;
  category: EventCategory;
  className?: string;
  priority?: boolean;
}

export const EventBannerImage: React.FC<EventBannerImageProps> = ({
  src,
  alt,
  category,
  className = 'w-full h-full object-cover',
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-gradient-to-br from-[#5A0D1B] via-[#7A1224] to-[#2D070E] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden ${className}`}
      >
        <div className="w-14 h-14 rounded-full border border-amber-400/40 flex items-center justify-center mb-2 bg-black/20">
          <span className="font-display text-base font-bold text-amber-300">AC</span>
        </div>
        <span className="text-xs font-medium text-amber-200/90 tracking-wide">
          Ananda College · {category}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-stone-200 dark:bg-stone-800 ${className}`}>
      {!isLoaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
