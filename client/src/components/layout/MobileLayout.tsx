import type { ReactNode } from "react";
import { BottomNav } from "@/components/navigation/BottomNav";

interface MobileLayoutProps {
  children: ReactNode;
  description: string;
  onOpenSOS: () => void;
  onShareLocation: () => void;
  title: string;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,rgba(255,127,0,0.07),transparent_32%),linear-gradient(180deg,#FFF9F2_0%,#F5F7FA_100%)]">
      <div
        className="mx-auto flex min-h-[100dvh] max-w-screen-sm flex-col px-4 pb-[calc(6rem+env(safe-area-inset-bottom))]"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <main className="flex-1 space-y-4 pb-2 overscroll-y-contain">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
