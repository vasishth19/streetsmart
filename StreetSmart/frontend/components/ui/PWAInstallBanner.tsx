'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Check } from 'lucide-react';

// ─── Install App Banner ───────────────────────────────────────────
// Shows automatically when browser fires 'beforeinstallprompt'
// Works on Android Chrome, Edge, Samsung Browser
// On iPhone: shows manual install instructions

export default function PWAInstallBanner() {
  const [showBanner,  setShowBanner]  = useState(false);
  const [isIOS,       setIsIOS]       = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing,  setInstalling]  = useState(false);
  const [showIOSTip,  setShowIOSTip]  = useState(false);

  useEffect(() => {
    // Detect iOS (Safari)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) &&
                !(window as any).MSStream;
    setIsIOS(ios);

    // Check if already installed (standalone mode)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (standalone) { setIsInstalled(true); return; }

    // Android/Desktop: listen for install prompt
    if (!ios) {
      const handlePrompt = () => setShowBanner(true);
      window.addEventListener('pwa-install-available', handlePrompt);

      // If prompt already fired before this component mounted
      if ((window as any).__pwaInstallPrompt) setShowBanner(true);

      return () => window.removeEventListener('pwa-install-available', handlePrompt);
    }
  }, []);

  // ── Android / Desktop install ─────────────────────────────────
  const handleInstall = async () => {
    const prompt = (window as any).__pwaInstallPrompt;
    if (!prompt) return;
    setInstalling(true);
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowBanner(false);
      }
    } finally {
      setInstalling(false);
    }
  };

  // Already installed
  if (isInstalled) return null;

  return (
    <>
      {/* ── Android / Desktop banner ───────────────────────────── */}
      <AnimatePresence>
        {showBanner && !isIOS && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{   y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-6 md:w-80"
          >
            <div className="rounded-2xl border border-[#00FF9C]/30 bg-[#0B1020]/98 backdrop-blur-xl shadow-[0_0_40px_rgba(0,255,156,0.15)] p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00FF9C]/10 border border-[#00FF9C]/30 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-[#00FF9C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#E6F1FF] text-sm">Install StreetSmart</p>
                  <p className="text-xs text-[#8892B0] mt-0.5 leading-relaxed">
                    Add to your home screen for offline navigation
                  </p>
                </div>
                <button onClick={() => setShowBanner(false)}
                  className="text-[#4A5568] hover:text-[#8892B0] flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00FF9C] text-[#05080F] text-sm font-bold transition-all hover:bg-[#00FF9C]/90 disabled:opacity-60"
                >
                  {installing ? (
                    <div className="w-4 h-4 border-2 border-[#05080F] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {installing ? 'Installing...' : 'Install App'}
                </button>
                <button onClick={() => setShowBanner(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8892B0] text-sm hover:text-[#E6F1FF] transition-colors">
                  Later
                </button>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { icon: '📶', text: 'Works offline' },
                  { icon: '📍', text: 'GPS access' },
                  { icon: '🔔', text: 'Alerts' },
                ].map((f) => (
                  <div key={f.text} className="text-center py-1.5 rounded-lg bg-[#05080F] border border-[#1a2a4a]">
                    <div className="text-sm">{f.icon}</div>
                    <div className="text-[9px] text-[#8892B0] font-mono mt-0.5">{f.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── iOS Safari instructions ────────────────────────────── */}
      {/* iOS doesn't support beforeinstallprompt — show manual tip */}
      <AnimatePresence>
        {showIOSTip && isIOS && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-x-0 bottom-0 z-[9999] rounded-t-3xl border-t border-[#00FF9C]/20 bg-[#0B1020]/98 backdrop-blur-xl p-6 pb-10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#E6F1FF]">Install on iPhone</h3>
              <button onClick={() => setShowIOSTip(false)}>
                <X className="w-5 h-5 text-[#8892B0]" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { step: '1', icon: '⬆️', text: 'Tap the Share button at the bottom of Safari' },
                { step: '2', icon: '➕', text: 'Scroll down and tap "Add to Home Screen"' },
                { step: '3', icon: '✅', text: 'Tap "Add" — StreetSmart appears on your home screen!' },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#00FF9C]/10 border border-[#00FF9C]/30 flex items-center justify-center text-sm font-bold text-[#00FF9C] flex-shrink-0">
                    {s.step}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-sm text-[#8892B0]">{s.text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-[#00FF9C]/05 border border-[#00FF9C]/15">
              <p className="text-xs text-[#8892B0] text-center font-mono">
                💡 Once installed, StreetSmart works offline and feels like a native app
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS install trigger button — shown in nav/landing page */}
      {isIOS && !isInstalled && (
        <button
          onClick={() => setShowIOSTip(true)}
          className="flex items-center gap-1.5 text-xs font-mono text-[#00FF9C] border border-[#00FF9C]/30 px-3 py-1.5 rounded-full hover:bg-[#00FF9C]/10 transition-all"
        >
          <Download className="w-3 h-3" />
          Install App
        </button>
      )}
    </>
  );
}