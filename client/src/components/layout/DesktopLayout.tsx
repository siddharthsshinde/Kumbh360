import type { ReactNode } from "react";
import { SidebarNav } from "@/components/navigation/SidebarNav";

interface DesktopLayoutProps {
  children: ReactNode;
  description: string;
  onOpenSOS: () => void;
  onShareLocation: () => void;
  title: string;
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(255,127,0,0.08),transparent_28%),radial-gradient(ellipse_at_bottom_right,rgba(255,127,0,0.05),transparent_30%),linear-gradient(180deg,#FFF9F2_0%,#F5F7FA_100%)] px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1600px] gap-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] shrink-0 self-start md:block md:w-24 lg:w-80">
          <SidebarNav />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-5 min-h-[calc(100vh-3rem)] rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.07)] backdrop-blur-sm md:p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
