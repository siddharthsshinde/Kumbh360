import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    return !sessionStorage.getItem("kumbh360-splashed");
  });

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("kumbh360-splashed", "1");
    }, 1800);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FF7F00]"
        >
          <motion.div
            initial={{ scale: 0.72, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.1 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white shadow-2xl">
              <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none">
                <circle cx="32" cy="32" r="28" fill="#FF7F00" opacity="0.15" />
                <path d="M32 8C19 8 10 19 10 30c0 14 22 28 22 28s22-14 22-28C54 19 45 8 32 8z" fill="#FF7F00" />
                <circle cx="32" cy="29" r="7" fill="white" />
              </svg>
            </div>

            <div className="space-y-1 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white">Kumbh360</h1>
              <p className="text-sm font-medium text-orange-100">Pilgrim Companion</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:300ms]" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
