import { Link, useLocation } from "wouter";
import { appNavigation } from "@/config/navigation";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();
  const { trigger } = useHaptics();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-slate-200">
      <div
        className="grid grid-cols-5"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {appNavigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              onClick={() => trigger(isActive ? "light" : "medium")}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-3 px-1 transition-colors active:bg-slate-50",
                isActive ? "text-[#FF7F00]" : "text-slate-400",
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon
                className={cn(
                  "transition-colors",
                  isActive
                    ? "h-[1.35rem] w-[1.35rem] stroke-[2.2px] text-[#FF7F00]"
                    : "h-[1.3rem] w-[1.3rem] stroke-[1.7px] text-slate-400",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider leading-none",
                  isActive ? "text-[#FF7F00]" : "text-slate-400",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
