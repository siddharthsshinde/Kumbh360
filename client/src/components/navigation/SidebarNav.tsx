import { Link, useLocation } from "wouter";
import { appNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const [location] = useLocation();

  return (
    <div className="flex h-full flex-col rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,#FF7F00,#E3A018_58%,#FFD9A0)] p-4 text-white">
        <p className="text-xs uppercase tracking-[0.35em] text-white/80">Kumbh360</p>
        <h2 className="mt-2 text-lg font-semibold md:hidden lg:block">
          Pilgrim companion
        </h2>
        <p className="mt-2 hidden text-sm text-white/80 lg:block">
          Responsive PWA shell for maps, safety, and live guidance.
        </p>
      </div>

      <nav className="mt-6 space-y-2">
        {appNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all",
                isActive
                  ? "bg-[#FFF3E2] text-[#C45D00] shadow-[inset_0_0_0_1px_rgba(255,127,0,0.12)]"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl transition-colors",
                  isActive
                    ? "bg-white text-[#FF7F00] shadow-sm"
                    : "bg-slate-100 text-slate-500 group-hover:bg-white",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1 md:hidden lg:block">
                <div className="font-semibold">{item.label}</div>
                <p className="line-clamp-2 text-xs text-slate-500">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[1.5rem] bg-slate-900 p-4 text-slate-200">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
          Ready offline
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300 md:hidden lg:block">
          Once installed, the app keeps the navigation shell available even when
          connectivity is unstable.
        </p>
      </div>
    </div>
  );
}
