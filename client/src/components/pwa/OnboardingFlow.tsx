import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, Sparkles } from "lucide-react";
import splashImg from "@assets/Primary_Splash_Container_(Mobile_Framed)_1779814023585.jpg";
import slide1Img from "@assets/Kumbh360_Onboarding_-_Slide_1_1779814023578.jpg";
import slide2Img from "@assets/Kumbh360_Onboarding_-_Slide_2_1779814023584.jpg";
import slide3Img from "@assets/Onboarding_Welcome_-_Final_Slide3_1779814023585.jpg";

type Phase = "splash" | "slide1" | "slide2" | "slide3";

function TempleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 3 l2.5 5h5l-2.5 3.5 4 11H25l-1.5-4h-7l-1.5 4H11l4-11L12.5 8h5L20 3z" />
      <rect x="8" y="27" width="24" height="2.5" rx="1.2" />
      <rect x="5" y="31" width="30" height="2.5" rx="1.2" />
      <rect x="3" y="35" width="34" height="3" rx="1.5" />
    </svg>
  );
}

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 32 : 8,
            backgroundColor: i === current ? "#FF7F00" : "#D9CEBE",
          }}
          transition={{ duration: 0.3 }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  );
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const urlPhase = new URLSearchParams(window.location.search).get("phase") as Phase | null;
  const [phase, setPhase] = useState<Phase>(urlPhase ?? "splash");

  useEffect(() => {
    if (urlPhase) return; // don't auto-advance when a phase is forced via URL
    const t = setTimeout(() => setPhase("slide1"), 3000);
    return () => clearTimeout(t);
  }, [urlPhase]);

  const finish = () => {
    localStorage.setItem("kumbh360-onboarded", "1");
    onComplete();
  };

  return (
    /* Full-screen backdrop; on desktop, centers a phone-width panel */
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/60 md:bg-slate-900">
      <div className="relative w-full overflow-hidden md:w-[390px] md:rounded-[3rem] md:shadow-2xl" style={{ height: "100svh", maxHeight: "100svh" }}>
        <AnimatePresence mode="wait">

          {/* ── PRIMARY SPLASH ── */}
          {phase === "splash" && (
            <motion.div
              key="splash"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center overflow-hidden bg-gradient-to-b from-[#FFA533] via-[#FF8000] to-[#FF5500]"
            >
              {/* Radial light glow top */}
              <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(255,255,255,0.28),transparent)]" />
              {/* Warm glow bottom */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 [background-image:radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(180,60,0,0.45),transparent)]" />

              {/* Temple icon circle */}
              <motion.div
                initial={{ y: -28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.55, ease: "easeOut" }}
                className="mt-14 flex h-[80px] w-[80px] items-center justify-center rounded-full border border-white/30 bg-white/20 shadow-lg backdrop-blur-sm"
              >
                <TempleIcon className="h-11 w-11 text-white" />
              </motion.div>

              {/* Brand */}
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-4 text-center"
              >
                <h1 className="text-[2.75rem] font-black tracking-tight text-white drop-shadow-sm">Kumbh360</h1>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/75">
                  Your Sacred Journey Guide
                </p>
              </motion.div>

              {/* Hero card — shows the ghat/sunset photo */}
              <motion.div
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative mx-6 mt-7 w-[calc(100%-3rem)] overflow-hidden rounded-[2.2rem] shadow-[0_20px_60px_rgba(0,0,0,0.38)]"
                style={{ height: 270 }}
              >
                <img
                  src={splashImg}
                  alt="Sacred Kumbh Mela ghat"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: "50% 62%" }}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
              </motion.div>

              {/* Meditation figure */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.9 }}
                className="mt-5"
              >
                <svg viewBox="0 0 44 28" className="h-7 w-11 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="22" cy="4" r="3.5" />
                  <path d="M12 22 Q15 14 22 14 Q29 14 32 22" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                  <polygon points="4,18 9,14 12,18 9,24" />
                  <polygon points="40,18 35,14 32,18 35,24" />
                </svg>
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="mt-auto mb-10 flex flex-col items-center gap-2"
              >
                <div className="h-px w-20 bg-white/25" />
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
                  Est. 2024 · Sangam Divine
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* ── ONBOARDING SLIDES ── */}
          {phase !== "splash" && (
            <motion.div
              key="slides-wrapper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-[#FAF8F4]"
            >
              <AnimatePresence mode="wait">

                {/* SLIDE 1 */}
                {phase === "slide1" && (
                  <motion.div
                    key="s1"
                    initial={{ opacity: 0, x: 48 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -48 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex h-full flex-col px-5 pb-10 pt-5"
                  >
                    {/* Nav */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[#FF7F00]">
                        <TempleIcon className="h-5 w-5" />
                        <span className="text-sm font-bold">Sacred Kumbh</span>
                      </div>
                      <button
                        onClick={finish}
                        className="text-sm font-medium text-slate-400"
                        data-testid="button-skip-s1"
                      >
                        Skip
                      </button>
                    </div>

                    {/* Hero card */}
                    <div
                      className="mt-5 w-full overflow-hidden rounded-[2rem] shadow-xl"
                      style={{ height: 264 }}
                    >
                      <img
                        src={slide1Img}
                        alt="Navigate the Sacred Gathering"
                        className="h-full w-full object-cover"
                        style={{ objectPosition: "50% 35%" }}
                      />
                    </div>

                    {/* Text */}
                    <div className="mt-6 flex-1 text-center">
                      <h2 className="text-[1.65rem] font-black leading-tight text-slate-900">
                        Navigate the{" "}
                        <span className="text-[#FF7F00]">Sacred<br />Gathering</span>
                      </h2>
                      <p className="mt-3 text-[0.875rem] leading-relaxed text-slate-500">
                        Real-time maps, crowd-aware routing,<br />
                        and spiritual guidance — all in one app.
                      </p>
                    </div>

                    <div className="py-5">
                      <ProgressDots current={0} />
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setPhase("slide2")}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFAA30] to-[#FF6500] py-4 text-base font-bold text-white shadow-lg shadow-orange-200"
                      data-testid="button-next-s1"
                    >
                      Next <span aria-hidden>→</span>
                    </motion.button>
                  </motion.div>
                )}

                {/* SLIDE 2 */}
                {phase === "slide2" && (
                  <motion.div
                    key="s2"
                    initial={{ opacity: 0, x: 48 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -48 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex h-full flex-col px-5 pb-10 pt-5"
                  >
                    {/* Nav */}
                    <div className="flex justify-end">
                      <button
                        onClick={finish}
                        className="text-[0.7rem] font-black uppercase tracking-widest text-[#FF7F00]"
                        data-testid="button-skip-s2"
                      >
                        Skip
                      </button>
                    </div>

                    {/* Illustration circle */}
                    <div className="relative mt-4 flex flex-1 items-center justify-center" style={{ maxHeight: 260 }}>
                      <div className="relative" style={{ width: 240, height: 240 }}>
                        {/* Dark circle with image */}
                        <div className="absolute inset-0 overflow-hidden rounded-full shadow-2xl">
                          <div className="absolute inset-0 bg-[#0F1D3A]" />
                          <img
                            src={slide2Img}
                            alt="Stay Safe Connected illustration"
                            className="absolute inset-0 h-full w-full object-cover opacity-75 mix-blend-luminosity"
                            style={{ objectPosition: "50% 42%" }}
                          />
                        </div>

                        {/* Floating — location pin */}
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 18 }}
                          className="absolute -right-5 top-10 flex h-11 w-11 items-center justify-center rounded-full bg-[#FF7F00] shadow-xl"
                        >
                          <MapPin className="h-5 w-5 text-white" />
                        </motion.div>

                        {/* Floating — people */}
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.45, type: "spring", stiffness: 300, damping: 18 }}
                          className="absolute -left-5 bottom-14 flex h-11 w-11 items-center justify-center rounded-full bg-[#FF7F00] shadow-xl"
                        >
                          <Users className="h-5 w-5 text-white" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Text */}
                    <div className="text-center">
                      <h2 className="text-[1.65rem] font-black leading-tight text-slate-900">
                        Stay Safe, Stay<br />Connected
                      </h2>
                      <p className="mt-3 text-[0.875rem] leading-relaxed text-slate-500">
                        Real-time crowd monitoring, emergency<br />
                        SOS, and group tracking keep you and<br />
                        your family safe.
                      </p>
                    </div>

                    <div className="py-5">
                      <ProgressDots current={1} />
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setPhase("slide3")}
                      className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FFAA30] to-[#FF6500] py-4 text-base font-bold text-white shadow-lg shadow-orange-200"
                      data-testid="button-next-s2"
                    >
                      Next
                    </motion.button>
                  </motion.div>
                )}

                {/* SLIDE 3 */}
                {phase === "slide3" && (
                  <motion.div
                    key="s3"
                    initial={{ opacity: 0, x: 48 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -48 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex h-full flex-col px-5 pb-10 pt-5"
                  >
                    {/* Nav */}
                    <div className="flex items-center justify-center gap-1.5 text-[#FF7F00]">
                      <TempleIcon className="h-5 w-5" />
                      <span className="text-sm font-bold">Sacred Navigation</span>
                    </div>

                    {/* Phone mockup card */}
                    <div className="relative flex flex-1 items-center justify-center" style={{ maxHeight: 300 }}>
                      {/* Outer cream card */}
                      <div
                        className="relative overflow-visible rounded-[2.5rem] bg-[#EDE9E0] shadow-xl"
                        style={{ width: 252, height: 284 }}
                      >
                        {/* Phone inner frame */}
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.75rem] bg-black shadow-inner"
                          style={{ width: 196, height: 236 }}
                        >
                          <img
                            src={slide3Img}
                            alt="Your sacred journey"
                            className="h-full w-full object-cover"
                            style={{ objectPosition: "50% 32%" }}
                          />
                          {/* Dynamic island / notch */}
                          <div className="absolute left-1/2 top-2.5 h-[14px] w-[56px] -translate-x-1/2 rounded-full bg-black" />
                        </div>
                      </div>

                      {/* Sparkles floating badge */}
                      <motion.div
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.25, type: "spring", stiffness: 280, damping: 18 }}
                        className="absolute flex items-center justify-center rounded-2xl bg-white shadow-lg"
                        style={{ width: 52, height: 52, left: "calc(50% - 148px)", top: "calc(50% - 142px)" }}
                      >
                        <Sparkles className="h-6 w-6 text-slate-700" />
                      </motion.div>

                      {/* Location pin floating badge */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 280, damping: 18 }}
                        className="absolute flex items-center justify-center rounded-full bg-[#FF7F00] shadow-lg"
                        style={{ width: 44, height: 44, right: "calc(50% - 156px)", bottom: "calc(50% - 142px)" }}
                      >
                        <MapPin className="h-5 w-5 text-white" />
                      </motion.div>
                    </div>

                    {/* Text */}
                    <div className="mt-2 text-center">
                      <h2 className="text-[1.65rem] font-black leading-tight text-slate-900">
                        Your Spiritual Journey<br />Begins
                      </h2>
                      <p className="mt-3 text-[0.875rem] leading-relaxed text-slate-500">
                        Plan your yatra, book accommodations,<br />
                        watch live darshan, and create lasting<br />
                        sacred memories.
                      </p>
                    </div>

                    <div className="py-5">
                      <ProgressDots current={2} />
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={finish}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FFAA30] to-[#FF6500] py-4 text-base font-bold text-white shadow-lg shadow-orange-200"
                      data-testid="button-get-started"
                    >
                      Get Started 🙏
                    </motion.button>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
