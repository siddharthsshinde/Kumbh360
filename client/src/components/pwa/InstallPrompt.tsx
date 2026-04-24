import { useState } from "react";
import { motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

const STORAGE_KEY = "kumbh360-install-dismissed";

export function InstallPrompt() {
  const [dismissed, setDismissed] = useState(() => {
    return window.sessionStorage.getItem(STORAGE_KEY) === "true";
  });
  const { canInstall, promptToInstall } = useInstallPrompt();

  if (!canInstall || dismissed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[1.75rem] border border-[#FFE0B5] bg-[linear-gradient(135deg,#FFF8EC,#FFFFFF)] p-4 shadow-[0_18px_50px_rgba(255,127,0,0.12)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#C45D00]">
            Install app
          </p>
          <h3 className="text-lg font-semibold text-slate-900">
            Add Kumbh360 to your home screen
          </h3>
          <p className="text-sm leading-6 text-slate-600">
            Get a cleaner full-screen experience, faster relaunches, and offline
            shell support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              window.sessionStorage.setItem(STORAGE_KEY, "true");
              setDismissed(true);
            }}
            className="rounded-2xl border-slate-200 text-slate-500 hover:bg-slate-100"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              void promptToInstall();
            }}
            className="rounded-2xl bg-[#FF7F00] text-white hover:bg-[#E36A00]"
          >
            <Download className="h-4 w-4" />
            Install now
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
