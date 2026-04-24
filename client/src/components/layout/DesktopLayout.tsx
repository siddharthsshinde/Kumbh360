import type { ReactNode } from "react";
import { AppHeader } from "@/components/navigation/AppHeader";
import { SidebarNav } from "@/components/navigation/SidebarNav";

interface DesktopLayoutProps {
  children: ReactNode;
  description: string;
  onOpenSOS: () => void;
  onShareLocation: () => void;
  title: string;
}

export function DesktopLayout({
  children,
  description,
  onOpenSOS,
  onShareLocation,
  title,
}: DesktopLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#FFF4E2,transparent_24%),radial-gradient(circle_at_bottom_right,#FFEFD2,transparent_28%),linear-gradient(180deg,#FFF9F2_0%,#F7F9FC_100%)] px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1600px] gap-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] shrink-0 self-start md:block md:w-24 lg:w-80">
          <SidebarNav />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <AppHeader
            description={description}
            onOpenSOS={onOpenSOS}
            onShareLocation={onShareLocation}
            title={title}
          />

          <main className="min-h-[calc(100vh-14rem)] rounded-[2rem] border border-white/70 bg-white/72 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-6 xl:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
