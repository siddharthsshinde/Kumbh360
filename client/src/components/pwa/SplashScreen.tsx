import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    if (new URLSearchParams(window.location.search).get("nosplash")) return false;
    return !sessionStorage.getItem("kumbh360-splashed");
  });

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("kumbh360-splashed", "1");
    }, 1600);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[linear-gradient(140deg,#FF7F00_0%,#FF9A3C_45%,#FF6000_100%)]"
        >
          {/* Decorative rings */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full border border-white/10 opacity-60" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full border border-white/10 opacity-60" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full border border-white/15 opacity-60" />
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-orange-900/20 blur-3xl -translate-x-1/3 translate-y-1/3" />
          </div>

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 20, delay: 0.08 }}
            className="relative flex flex-col items-center gap-6"
          >
            {/* Logo */}
            <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white shadow-2xl">
              <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none">
                <circle cx="32" cy="32" r="28" fill="#FF7F00" opacity="0.12" />
                <path
                  d="M32 6C17.6 6 8 18 8 29.5c0 15.5 24 32.5 24 32.5s24-17 24-32.5C56 18 46.4 6 32 6z"
                  fill="#FF7F00"
                />
                <circle cx="32" cy="28" r="8" fill="white" />
                <circle cx="32" cy="28" r="4" fill="#FF7F00" opacity="0.5" />
              </svg>
            </div>

            {/* Title */}
            <div className="space-y-1.5 text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white">Kumbh360</h1>
              <p className="text-sm font-semibold text-orange-100 tracking-widest uppercase">Pilgrim Companion</p>
            </div>

            {/* Loading dots */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-2"
            >
              {[0, 150, 300].map((delay, i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-white/70 animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-xs text-orange-100/70 font-medium"
            >
              Nashik · Trimbakeshwar · Kumbh Mela 2025
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
