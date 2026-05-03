import { Link, useLocation } from "wouter";
import { appNavigation } from "@/config/navigation";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const [location] = useLocation();
  const { trigger } = useHaptics();

  return (
    <div className="flex h-full flex-col rounded-[2rem] border border-white/60 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl">
      {/* Brand */}
      <div className="rounded-[1.75rem] bg-[linear-gradient(140deg,#FF7F00_0%,#FF9A3C_45%,#E36A00_100%)] p-4 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/25">
            <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
              <path d="M16 2C9 2 4 9 4 15c0 8 12 17 12 17s12-9 12-17C28 9 23 2 16 2z" fill="white" />
              <circle cx="16" cy="14" r="4.5" fill="#FF7F00" opacity="0.9" />
            </svg>
          </div>
          <div className="md:hidden lg:block">
            <p className="text-sm font-bold">Kumbh360</p>
            <p className="text-xs text-orange-100">Pilgrim Companion</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="mt-5 space-y-1.5">
        {appNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          const isSOS = item.href === "/sos";

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              onClick={() => trigger(isSOS ? "error" : "light")}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all",
                isSOS
                  ? isActive
                    ? "bg-red-50 text-red-600 shadow-[inset_0_0_0_1.5px_rgba(239,68,68,0.2)]"
                    : "text-red-500 hover:bg-red-50"
                  : isActive
                    ? "bg-[#FFF3E2] text-[#C45D00] shadow-[inset_0_0_0_1.5px_rgba(255,127,0,0.15)]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
              data-testid={`sidebar-${item.label.toLowerCase()}`}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                  isSOS
                    ? isActive
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-red-100 text-red-500"
                    : isActive
                      ? "bg-white text-[#FF7F00] shadow-sm"
                      : "bg-slate-100 text-slate-500 group-hover:bg-white",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1 md:hidden lg:block">
                <div className="text-sm font-semibold">{item.label}</div>
                <p className="line-clamp-1 text-xs text-slate-400">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        {/* Status chip */}
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-3 py-2.5 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-semibold text-emerald-700 md:hidden lg:block">Live · All systems operational</p>
          <p className="text-xs font-semibold text-emerald-700 hidden md:block lg:hidden">Live</p>
        </div>

        {/* Offline note */}
        <div className="rounded-[1.5rem] bg-slate-900 p-4 text-slate-200">
          <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Ready offline</p>
          <p className="mt-1.5 text-xs leading-5 text-slate-300 md:hidden lg:block">
            Navigation shell available even without connectivity.
          </p>
        </div>
      </div>
    </div>
  );
}
