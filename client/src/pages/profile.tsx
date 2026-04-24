import { motion } from "framer-motion";
import { Palette, Smartphone, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmergencyContacts } from "@/components/EmergencyContacts";
import { ThemePresets } from "@/components/ThemePresets";
import { ThemeSettings } from "@/components/ThemeSettings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
];

export default function ProfilePage() {
  const { i18n } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "en")
    .split("-")[0]
    .toLowerCase();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem("kumbh-app-language", language);
    window.dispatchEvent(
      new CustomEvent("language-changed", { detail: { language } }),
    );
  };

  return (
    <motion.div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-violet-100 bg-[linear-gradient(135deg,#F8F6FF,#FFFFFF_55%,#FFF7F0)] p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-700">
              Personalization
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Tailor the PWA to your journey
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Manage appearance, language, install readiness, and emergency
              contacts from one route without disturbing the existing app logic.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[1.5rem] bg-white/85 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Smartphone className="h-4 w-4 text-violet-600" />
                Install-aware
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Works as a full-screen app when installed on mobile devices.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/85 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Palette className="h-4 w-4 text-violet-600" />
                Theme-ready
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Existing theme utilities remain intact and now live in a
                dedicated settings route.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <ThemeSettings />
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <UserRound className="h-5 w-5 text-[#FF7F00]" />
              <h3 className="text-lg font-semibold">Language preferences</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Switch app language without leaving the route.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((language) => (
                <Button
                  key={language.code}
                  variant={currentLanguage === language.code ? "default" : "outline"}
                  onClick={() => handleLanguageChange(language.code)}
                  className={cn(
                    "rounded-2xl",
                    currentLanguage === language.code &&
                      "bg-[#FF7F00] text-white hover:bg-[#E36A00]",
                  )}
                >
                  {language.label}
                </Button>
              ))}
            </div>
          </section>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <EmergencyContacts />
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <ThemePresets />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
