import { motion } from "framer-motion";
import { Palette, Smartphone, UserRound, Globe, Shield, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmergencyContacts } from "@/components/EmergencyContacts";
import { ThemePresets } from "@/components/ThemePresets";
import { ThemeSettings } from "@/components/ThemeSettings";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useHaptics";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

export default function ProfilePage() {
  const { i18n } = useTranslation();
  const { trigger } = useHaptics();
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "en")
    .split("-")[0]
    .toLowerCase();

  const handleLanguageChange = (language: string) => {
    trigger("light");
    i18n.changeLanguage(language);
    localStorage.setItem("kumbh-app-language", language);
    window.dispatchEvent(
      new CustomEvent("language-changed", { detail: { language } }),
    );
  };

  return (
    <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">

      {/* ── Hero ── */}
      <motion.section variants={item} className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(140deg,#6D28D9_0%,#8B5CF6_45%,#7C3AED_100%)] p-5 text-white shadow-[0_16px_48px_rgba(109,40,217,0.28)]">
        <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.18),transparent_50%)]" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-200">Personalization</p>
            <h1 className="mt-1 text-[1.6rem] font-bold leading-tight">Profile</h1>
            <p className="mt-0.5 text-sm text-violet-100/90">Language, theme & emergency contacts</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <UserRound className="h-5 w-5" />
          </div>
        </div>

        {/* Quick info pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
            <Smartphone className="h-3.5 w-3.5" />
            PWA Ready
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
            <Shield className="h-3.5 w-3.5" />
            SOS Enabled
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
            <Globe className="h-3.5 w-3.5" />
            {LANGUAGE_OPTIONS.find(l => l.code === currentLanguage)?.native ?? "English"}
          </div>
        </div>
      </motion.section>

      {/* ── Language ── */}
      <motion.div variants={item}>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Language preference</h2>
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
                <Globe className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">App language</p>
                <p className="text-xs text-slate-500">Affects all text throughout the app</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all",
                    currentLanguage === language.code
                      ? "border-[#FF7F00] bg-[#FFF3E2] text-[#FF7F00] shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                  data-testid={`button-lang-${language.code}`}
                >
                  <span className="text-base">{language.native}</span>
                  <span className="text-[10px] font-medium opacity-60">{language.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Theme settings ── */}
      <motion.div variants={item}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Appearance</h2>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <ThemeSettings />
        </div>
      </motion.div>

      {/* ── Theme presets ── */}
      <motion.div variants={item}>
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <ThemePresets />
        </div>
      </motion.div>

      {/* ── Emergency contacts ── */}
      <motion.div variants={item}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Emergency contacts</h2>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <EmergencyContacts />
        </div>
      </motion.div>

      {/* ── App info ── */}
      <motion.div variants={item}>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
              <Palette className="h-4 w-4 text-[#FF7F00]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Kumbh360</p>
              <p className="text-xs text-slate-500">Pilgrim Companion · v1.0</p>
            </div>
          </div>
          {[
            { label: "Offline support", desc: "Works without internet after first load" },
            { label: "Multi-language", desc: "English, Hindi & Marathi supported" },
            { label: "Privacy-first", desc: "Location shared only when you choose" },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center justify-between border-t border-slate-50 py-3">
              <div>
                <p className="text-xs font-semibold text-slate-900">{label}</p>
                <p className="text-[11px] text-slate-500">{desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </div>
          ))}
        </div>
      </motion.div>

      <div className="h-2" />
    </motion.div>
  );
}
