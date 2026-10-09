import React, { useState } from 'react';
import { Download, Smartphone, X, WifiOff, CheckCircle2 } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../lib/usePWAInstall';
import { useFocusTrap } from '../lib/useFocusTrap';

interface PWAInstallButtonProps {
  compact?: boolean;
  onInstalledToast?: (msg: string) => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  onInstalledToast,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const modalRef = useFocusTrap<HTMLDivElement>(showGuideModal, () => setShowGuideModal(false));

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted && onInstalledToast) {
        onInstalledToast('AC Synapse installed to your home screen!');
      }
      return;
    }
    setShowGuideModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title="Install AC Synapse as an App (PWA)"
        aria-label="Install AC Synapse App"
        className={
          compact
            ? 'min-h-[36px] px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 dark:bg-amber-400/10 text-[#7A1224] dark:text-amber-300 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]'
            : 'min-h-[38px] px-3.5 py-1.5 rounded-lg border border-[#7A1224]/30 dark:border-amber-400/30 bg-[#7A1224]/10 dark:bg-amber-400/10 text-[#7A1224] dark:text-amber-300 hover:bg-[#7A1224]/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]'
        }
      >
        <Download className="w-3.5 h-3.5 shrink-0" aria-label="Install app download icon" />
        <span className={compact ? 'hidden lg:inline' : ''}>
          {isIOS ? 'Install on iOS' : 'Install App'}
        </span>
      </button>

      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
          onClick={() => setShowGuideModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4 focus:outline-none"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#7A1224] text-amber-300 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" aria-label="Mobile device icon" />
                </div>
                <div>
                  <h3
                    id="pwa-guide-title"
                    className="font-display text-lg font-bold text-stone-900 dark:text-stone-100"
                  >
                    Install AC Synapse PWA
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Offline-ready Progressive Web App
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="Close install guide"
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]"
              >
                <X className="w-4 h-4" aria-label="Close modal icon" />
              </button>
            </div>

            {isIOS ? (
              <div className="rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-4 text-xs text-stone-700 dark:text-stone-300 space-y-2 leading-relaxed">
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  To install on iPhone or iPad (Safari):
                </p>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>
                    Tap the <strong>Share</strong> icon in the Safari bottom toolbar.
                  </li>
                  <li>
                    Scroll down and select <strong>Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong>Add</strong> in the top-right corner to launch AC Synapse in
                    standalone mode.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-4 text-xs text-stone-700 dark:text-stone-300 space-y-2 leading-relaxed">
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  Install to Desktop or Android Home Screen:
                </p>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>
                    Open AC Synapse in its own browser tab (if viewing inside an embedded preview).
                  </li>
                  <li>
                    Click the <strong>Install AC Synapse</strong> icon in your browser&apos;s
                    address bar, or open the browser menu and select{' '}
                    <strong>Install App / Add to Home Screen</strong>.
                  </li>
                </ol>
                <div className="pt-2 flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2
                    className="w-3.5 h-3.5 shrink-0"
                    aria-label="Service worker active check icon"
                  />
                  <span>Service worker &amp; offline manifest are active.</span>
                </div>
              </div>
            )}

            <button
              type="button"
              data-autofocus="true"
              onClick={() => setShowGuideModal(false)}
              aria-label="Acknowledge install instructions and close modal"
              className="w-full min-h-[42px] rounded-xl bg-[#7A1224] hover:bg-[#600E1C] text-amber-200 dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A1224]"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 text-white px-3.5 py-2 text-xs font-semibold shadow-lg border border-amber-400/40"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0 animate-pulse" aria-label="Offline mode icon" />
      <span>Offline Mode — Using cached AC Synapse data</span>
    </div>
  );
};
