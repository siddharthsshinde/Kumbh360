import { AlertTriangle, MapPinned } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  compact?: boolean;
  description: string;
  onOpenSOS: () => void;
  onShareLocation: () => void;
  title: string;
}

export function AppHeader({
  compact = false,
  description,
  onOpenSOS,
  onShareLocation,
  title,
}: AppHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/88 p-5 shadow-[0_24px_80px_rgba(255,127,0,0.12)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,127,0,0.22),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(227,160,24,0.18),transparent_34%)]" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white"
          >
            Kumbh360 PWA
          </Link>

          <div className="space-y-2">
            <h1
              className={cn(
                "font-semibold tracking-tight text-slate-900",
                compact ? "text-[1.75rem]" : "text-3xl",
              )}
            >
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={onShareLocation}
            className="rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            <MapPinned className="h-4 w-4" />
            <span className={cn(compact && "hidden xs:inline")}>Share location</span>
          </Button>
          <Button
            variant="destructive"
            onClick={onOpenSOS}
            className="rounded-2xl bg-[#D14343] shadow-sm hover:bg-[#B73434]"
          >
            <AlertTriangle className="h-4 w-4" />
            <span className={cn(compact && "hidden xs:inline")}>Open SOS</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
