import type { LucideIcon } from "lucide-react";
import { Home, Map, ShieldAlert, UserRound } from "lucide-react";

export interface AppNavItem {
  href: string;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const appNavigation: AppNavItem[] = [
  {
    href: "/",
    label: "Home",
    title: "Pilgrim Command Center",
    description: "Chat, live updates, weather, and essential planning in one place.",
    icon: Home,
  },
  {
    href: "/map",
    label: "Map",
    title: "Map and Wayfinding",
    description: "Explore facilities, crowd zones, nearby landmarks, and transit support.",
    icon: Map,
  },
  {
    href: "/sos",
    label: "SOS",
    title: "Emergency and Safety",
    description: "Share your location fast, raise alerts, and reach emergency transport.",
    icon: ShieldAlert,
  },
  {
    href: "/profile",
    label: "Profile",
    title: "Profile and Preferences",
    description: "Manage language, app theme, install settings, and emergency readiness.",
    icon: UserRound,
  },
];

export function getCurrentNavItem(pathname: string) {
  return (
    appNavigation.find((item) => item.href === pathname) ||
    appNavigation.find(
      (item) => item.href !== "/" && pathname.startsWith(item.href),
    ) ||
    appNavigation[0]
  );
}
