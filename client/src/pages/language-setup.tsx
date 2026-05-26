import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Bell, Check, Mic, Plus, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "hi", native: "हिन्दी", label: "Hindi",   flag: "🇮🇳" },
  { code: "en", native: "English", label: "Global",  flag: "🌐" },
  { code: "mr", native: "मराठी",   label: "Marathi", flag: "🇮🇳" },
  { code: "bn", native: "বাংলা",   label: "Bengali", flag: "🇮🇳" },
  { code: "ta", native: "தமிழ்",   label: "Tamil",   flag: "🇮🇳" },
  { code: "te", native: "తెలుగు",  label: "Telugu",  flag: "🇮🇳" },
];

const EXTRA_LANGUAGES = [
  { code: "gu", native: "ગુજરાતી", label: "Gujarati", flag: "🇮🇳" },
  { code: "kn", native: "ಕನ್ನಡ",   label: "Kannada",  flag: "🇮🇳" },
  { code: "pa", native: "ਪੰਜਾਬੀ",  label: "Punjabi",  flag: "🇮🇳" },
  { code: "ur", native: "اردو",    label: "Urdu",     flag: "🇵🇰" },
];

interface Props {
  /** Total steps in the onboarding flow; defaults to 3 */
  totalSteps?: number;
  /** Which step this screen is; defaults to 2 (0-indexed) */
  currentStep?: number;
  /** Called when user taps Continue */
  onContinue?: () => void;
}

export default function LanguageSetup({ totalSteps = 3, currentStep = 2, onContinue }: Props) {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const { trigger } = useHaptics();

  const initialLang = (i18n.resolvedLanguage || i18n.language || "hi").split("-")[0].toLowerCase();
  const [selected, setSelected] = useState(initialLang);
  const [showMore, setShowMore] = useState(false);

  const visibleLanguages = showMore ? [...LANGUAGES, ...EXTRA_LANGUAGES] : LANGUAGES;

  const handleSelect = (code: string) => {
    trigger("light");
    setSelected(code);
  };

  const handleContinue = () => {
    trigger("medium");
    i18n.changeLanguage(selected);
    localStorage.setItem("kumbh-app-language", selected);
    window.dispatchEvent(new CustomEvent("language-changed", { detail: { language: selected } }));
    if (onContinue) {
      onContinue();
    } else {
      navigate("/profile");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#fff8f6]">
      {/* ── Top App Bar ── */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#e2e8f0] bg-white/90 px-4 shadow-sm backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1 as any)}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 active:scale-95"
            data-testid="button-back"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <span className="text-[18px] font-bold tracking-tight text-orange-600">Kumbh360</span>
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 active:scale-95"
          data-testid="button-bell">
          <Bell className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[448px] flex-col gap-8 px-4 pb-32 pt-6">

          {/* Progress bar */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className="h-[6px] flex-1 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: i < currentStep ? "#FF7F00" : "#fee2d9" }}
                />
              ))}
            </div>

            {/* Heading */}
            <div className="pt-2">
              <h1 className="text-[32px] font-bold leading-[40px] tracking-[-0.02em] text-[#261813]">
                Choose Language
              </h1>
            </div>
            <p className="text-[16px] leading-[24px] text-[#5a4138]">
              Select your preferred language for navigation and assistance.
            </p>
          </div>

          {/* Language card grid */}
          <div className="grid grid-cols-2 gap-3">
            {visibleLanguages.map(({ code, native, label, flag }) => {
              const isActive = selected === code;
              return (
                <motion.button
                  key={code}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelect(code)}
                  className={cn(
                    "relative flex flex-col items-start rounded-[12px] p-[17px] text-left shadow-[0px_1px_1px_rgba(0,0,0,0.05)] transition-all duration-200",
                    isActive
                      ? "border-2 border-[#FF7F00] bg-[#ffdbce]"
                      : "border border-[#e2bfb3] bg-white",
                  )}
                  data-testid={`button-lang-${code}`}
                >
                  {/* Flag + check row */}
                  <div className="mb-4 flex w-full items-start justify-between">
                    <span className="text-[22px] leading-none">{flag}</span>
                    {isActive ? (
                      <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
                        <Check className="h-3.5 w-3.5 text-[#FF7F00]" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <div className="h-[26px] w-[26px] rounded-full border border-[#e2bfb3] bg-transparent" />
                    )}
                  </div>

                  {/* Native name */}
                  <span className="mb-1 text-[20px] font-semibold leading-[28px] text-[#261813]">
                    {native}
                  </span>

                  {/* English label */}
                  <span className="text-[12px] font-medium tracking-[0.04em] text-[#5a4138]">
                    {label}
                  </span>

                  {/* Active dot */}
                  {isActive && (
                    <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF7F00]" />
                  )}
                </motion.button>
              );
            })}

            {/* See More Languages — spans full width */}
            {!showMore && (
              <button
                onClick={() => { trigger("light"); setShowMore(true); }}
                className="col-span-2 flex items-center justify-center gap-3 rounded-[12px] border-2 border-dashed border-[#e2bfb3] py-[18px] transition-colors hover:bg-[#fff1ec] active:scale-98"
                data-testid="button-more-languages"
              >
                <Plus className="h-5 w-5 text-[#5a4138]" />
                <span className="text-[14px] font-semibold tracking-[0.01em] text-[#5a4138]">
                  See More Languages
                </span>
              </button>
            )}
          </div>

          {/* AI Voice Support card */}
          <div className="flex gap-4 rounded-[16px] border border-white/30 bg-white/70 p-5 shadow-sm backdrop-blur-[5px]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-100">
              <Mic className="h-5 w-5 text-violet-700" />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold tracking-[0.01em] text-[#261813]">
                Voice Support Ready
              </p>
              <p className="mt-1 text-[12px] font-medium leading-[16px] tracking-[0.04em] text-[#5a4138]">
                Your assistant can talk to you in your native tongue for hands-free guidance.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Sticky footer Continue button ── */}
      <div
        className="shrink-0 border-t border-[#e2bfb3] bg-white/80 px-4 pt-[17px] backdrop-blur-[12px]"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto max-w-[448px]">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[12px] bg-[#FF7F00] py-[16px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
            data-testid="button-continue-language"
          >
            <span className="text-[14px] font-semibold tracking-[0.01em] text-white">
              Continue
            </span>
            <ChevronLeft className="h-4 w-4 rotate-180 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
