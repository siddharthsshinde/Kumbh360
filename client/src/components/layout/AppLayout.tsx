import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { getCurrentNavItem } from "@/config/navigation";
import { PrayerSubmission } from "@/components/PrayerSubmission";
import { DesktopLayout } from "@/components/layout/DesktopLayout";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { useDevice } from "@/hooks/useDevice";

interface AppLayoutProps {
  children: ReactNode;
  onOpenSOS: () => void;
  onShareLocation: () => void;
}

export function AppLayout({
  children,
  onOpenSOS,
  onShareLocation,
}: AppLayoutProps) {
  const [location] = useLocation();
  const { isMobile } = useDevice();
  const currentNav = getCurrentNavItem(location);

  const content = (
    <>
      <InstallPrompt />
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="space-y-6"
      >
        {children}
      </motion.div>
    </>
  );

  return (
    <>
      {isMobile ? (
        <MobileLayout
          description={currentNav.description}
          onOpenSOS={onOpenSOS}
          onShareLocation={onShareLocation}
          title={currentNav.title}
        >
          {content}
        </MobileLayout>
      ) : (
        <DesktopLayout
          description={currentNav.description}
          onOpenSOS={onOpenSOS}
          onShareLocation={onShareLocation}
          title={currentNav.title}
        >
          {content}
        </DesktopLayout>
      )}

      <div className="pointer-events-none fixed bottom-[calc(6.25rem+env(safe-area-inset-bottom))] right-4 z-40 md:bottom-6">
        <div className="pointer-events-auto">
          <PrayerSubmission />
        </div>
      </div>
    </>
  );
}
