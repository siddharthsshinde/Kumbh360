import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { appNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto grid max-w-screen-sm grid-cols-4 gap-1 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2">
        {appNavigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-2xl px-2 text-xs font-medium transition-colors",
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
              <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full">
                <Icon className="h-5 w-5" />
              </span>
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
