import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, CheckCircle2 } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function NetworkStatus() {
  const { isOnline, wasOffline } = useNetworkStatus();

  const showBanner = !isOnline || wasOffline;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -48 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -48 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-safe-top"
          style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
        >
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg ${
              isOnline
                ? "bg-emerald-500 text-white"
                : "bg-slate-900 text-white"
            }`}
          >
            {isOnline ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Back online
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                You're offline — app shell available
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
