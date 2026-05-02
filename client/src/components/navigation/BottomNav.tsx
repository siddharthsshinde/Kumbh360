import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { appNavigation } from "@/config/navigation";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();
  const { trigger } = useHaptics();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto grid max-w-screen-sm grid-cols-5 gap-0.5 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-1.5">
        {appNavigation.map((item) => {
          const isActive = location === item.href;
          const isSOS = item.href === "/sos";
          const Icon = item.icon;

          if (isSOS) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => trigger(isActive ? "light" : "error")}
                className="relative flex flex-col items-center justify-center gap-1 py-1"
              >
                <span className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-full shadow-md transition-transform active:scale-95",
                  isActive
                    ? "bg-red-600 shadow-red-200"
                    : "bg-red-500 shadow-red-200"
                )}>
                  <Icon className="h-5 w-5 text-white" />
                  {!isActive && (
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-red-300 ring-2 ring-white" />
                  )}
                </span>
                <span className={cn("text-[10px] font-semibold", isActive ? "text-red-600" : "text-red-500")}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              onClick={() => trigger(isActive ? "light" : "medium")}
              className={cn(
                "relative flex min-h-[4rem] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[10px] font-medium transition-colors",
                isActive ? "text-[#FF7F00]" : "text-slate-500",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 rounded-2xl bg-[#FFF3E2]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full">
                <Icon className="h-[1.15rem] w-[1.15rem]" />
              </span>
              <span className="relative z-10 leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
