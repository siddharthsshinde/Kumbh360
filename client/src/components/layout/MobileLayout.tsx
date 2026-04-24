import type { ReactNode } from "react";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BottomNav } from "@/components/navigation/BottomNav";

interface MobileLayoutProps {
  children: ReactNode;
  description: string;
  onOpenSOS: () => void;
  onShareLocation: () => void;
  title: string;
}

export function MobileLayout({
  children,
  description,
  onOpenSOS,
  onShareLocation,
  title,
}: MobileLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,#FFF4E2,transparent_38%),linear-gradient(180deg,#FFF9F2_0%,#F7F9FC_100%)]">
      <div className="mx-auto flex min-h-[100dvh] max-w-screen-sm flex-col px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="sticky top-0 z-40 pb-4 pt-1">
          <AppHeader
            compact
            description={description}
            onOpenSOS={onOpenSOS}
            onShareLocation={onShareLocation}
            title={title}
          />
        </div>

        <main className="flex-1 space-y-6 pb-2">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}
