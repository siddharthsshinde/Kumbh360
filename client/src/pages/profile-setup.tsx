import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Bell, Menu, User, Phone, Compass, ChevronRight, Check } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

const DURATION_OPTIONS = ["1-3", "4-7", "8-14", "15+"];

interface ProfileData {
  name: string;
  age: string;
  gender: string;
  emergencyPhone: string;
  duration: string;
  groupSize: string;
}

const STORAGE_KEY = "kumbh360-profile";

function loadProfile(): ProfileData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { name: "", age: "", gender: "", emergencyPhone: "", duration: "4-7", groupSize: "" };
}

interface Props {
  /** Total steps; defaults to 3 */
  totalSteps?: number;
  /** Current step (1-indexed); defaults to 2 */
  currentStep?: number;
  onContinue?: () => void;
}

export default function ProfileSetup({ totalSteps = 3, currentStep = 2, onContinue }: Props) {
  const [, navigate] = useLocation();
  const { trigger } = useHaptics();
  const [form, setForm] = useState<ProfileData>(loadProfile);
  const [errors, setErrors] = useState<Partial<ProfileData>>({});

  const set = (key: keyof ProfileData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<ProfileData> = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.emergencyPhone.trim()) errs.emergencyPhone = "Required";
    else if (!/^\d{10}$/.test(form.emergencyPhone.trim())) errs.emergencyPhone = "Enter a valid 10-digit number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) { trigger("light"); return; }
    trigger("medium");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    if (onContinue) {
      onContinue();
    } else {
      navigate("/profile");
    }
  };

  const progressPct = Math.round(((currentStep - 1) / totalSteps) * 100);

  const inputCls = (err?: string) => cn(
    "w-full h-12 px-4 rounded-[0.75rem] border text-[16px] leading-[24px] outline-none transition-all",
    "bg-white placeholder:text-[#8e7066]",
    err
      ? "border-[#D32F2F] focus:ring-2 focus:ring-red-300"
      : "border-[#e2bfb3] focus:ring-2 focus:ring-[#FF7F00]/30 focus:border-[#FF7F00]",
  );

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#fff8f6]">

      {/* ── Top App Bar ── */}
      <header
        className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 active:scale-95"
          data-testid="button-menu">
          <Menu className="h-5 w-5 text-slate-600" />
        </button>
        <h1 className="text-xl font-black uppercase tracking-wider text-orange-600">Kumbh360</h1>
        <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 active:scale-95"
          data-testid="button-bell-setup">
          <Bell className="h-5 w-5 text-slate-600" />
        </button>
      </header>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-md px-4 pt-6 pb-36 space-y-6">

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold leading-[20px] tracking-[0.01em] text-[#FF7F00]">
                Setup Progress
              </span>
              <span className="text-[14px] font-semibold leading-[20px] tracking-[0.01em] text-[#44474E]">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#f8ddd4]">
              <div
                className="h-full rounded-full bg-[#FF7F00] transition-all duration-500"
                style={{ width: `${progressPct + 33}%` }}
              />
            </div>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-[24px] font-bold leading-[32px] text-[#1A1C1E]">Complete Your Profile</h2>
            <p className="mt-1 text-[16px] leading-[24px] text-[#44474E]">
              Help us ensure your safety and provide the best pilgrimage experience.
            </p>
          </div>

          {/* ── Card: Personal Information ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.05 }}
            className="rounded-xl border border-[#e2bfb3] bg-white p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2 text-[#FF7F00]">
              <User className="h-5 w-5" />
              <h3 className="text-[20px] font-semibold leading-[28px]">Personal Information</h3>
            </div>

            {/* Full Name */}
            <div>
              <label className="mb-1 block text-[12px] font-medium leading-[16px] tracking-[0.04em] text-[#5a4138]" htmlFor="ps-name">
                Full Name
              </label>
              <input
                id="ps-name"
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={e => set("name", e.target.value)}
                className={inputCls(errors.name)}
                data-testid="input-full-name"
              />
              {errors.name && <p className="mt-1 text-[11px] text-[#D32F2F]">{errors.name}</p>}
            </div>

            {/* Age + Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-[12px] font-medium leading-[16px] tracking-[0.04em] text-[#5a4138]" htmlFor="ps-age">
                  Age
                </label>
                <input
                  id="ps-age"
                  type="number"
                  placeholder="Ex: 45"
                  min={1}
                  max={120}
                  value={form.age}
                  onChange={e => set("age", e.target.value)}
                  className={inputCls()}
                  data-testid="input-age"
                />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium leading-[16px] tracking-[0.04em] text-[#5a4138]" htmlFor="ps-gender">
                  Gender
                </label>
                <div className="relative">
                  <select
                    id="ps-gender"
                    value={form.gender}
                    onChange={e => set("gender", e.target.value)}
                    className={cn(inputCls(), "appearance-none pr-8")}
                    data-testid="select-gender"
                  >
                    <option value="" disabled>Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-[#5a4138]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Card: Emergency Contact ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.1 }}
            className="rounded-xl border border-[#e2bfb3] border-l-4 border-l-[#D32F2F] bg-white p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2 text-[#D32F2F]">
              <Phone className="h-5 w-5" />
              <h3 className="text-[20px] font-semibold leading-[28px]">Emergency Contact</h3>
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium leading-[16px] tracking-[0.04em] text-[#5a4138]" htmlFor="ps-phone">
                Guardian/Relative Phone Number
              </label>
              <div className="flex">
                <div className="flex h-12 items-center rounded-l-[0.75rem] border border-r-0 border-[#e2bfb3] bg-[#fff1ec] px-3 text-[16px] text-[#5a4138]">
                  +91
                </div>
                <input
                  id="ps-phone"
                  type="tel"
                  placeholder="9876543210"
                  value={form.emergencyPhone}
                  onChange={e => set("emergencyPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className={cn(inputCls(errors.emergencyPhone), "flex-1 rounded-l-none")}
                  data-testid="input-emergency-phone"
                />
              </div>
              {errors.emergencyPhone
                ? <p className="mt-1 text-[11px] text-[#D32F2F]">{errors.emergencyPhone}</p>
                : <p className="mt-2 text-[10px] italic text-[#44474E]">This number will be contacted during SOS triggers.</p>
              }
            </div>
          </motion.div>

          {/* ── Card: Travel Intent ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.15 }}
            className="rounded-xl border border-[#e2bfb3] bg-white p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2 text-[#005ab4]">
              <Compass className="h-5 w-5" />
              <h3 className="text-[20px] font-semibold leading-[28px]">Travel Intent</h3>
            </div>

            {/* Duration chips */}
            <div>
              <label className="mb-2 block text-[12px] font-medium leading-[16px] tracking-[0.04em] text-[#5a4138]">
                Planned Duration (Days)
              </label>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map(opt => {
                  const active = form.duration === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { trigger("light"); set("duration", opt); }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-semibold leading-[20px] tracking-[0.01em] transition-all",
                        active
                          ? "border-2 border-[#FF7F00] bg-[#ffdbce] text-[#FF7F00] shadow-sm"
                          : "border border-[#e2bfb3] bg-white text-[#261813] hover:bg-[#ffdbce]",
                      )}
                      data-testid={`button-duration-${opt}`}
                    >
                      {active && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group Size */}
            <div>
              <label className="mb-1 block text-[12px] font-medium leading-[16px] tracking-[0.04em] text-[#5a4138]" htmlFor="ps-group">
                Group Size (Including You)
              </label>
              <input
                id="ps-group"
                type="number"
                placeholder="Ex: 5"
                min={1}
                max={500}
                value={form.groupSize}
                onChange={e => set("groupSize", e.target.value)}
                className={inputCls()}
                data-testid="input-group-size"
              />
            </div>
          </motion.div>

          {/* CTA */}
          <div className="pt-2 space-y-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="flex w-full h-14 items-center justify-center gap-2 rounded-xl bg-[#FF7F00] text-white text-[20px] font-semibold leading-[28px] shadow-[0px_8px_24px_rgba(255,127,0,0.3)] active:scale-95 transition-transform"
              data-testid="button-complete-setup"
            >
              Complete Setup
              <ChevronRight className="h-5 w-5" />
            </motion.button>
            <p className="text-center text-[12px] font-medium leading-[16px] tracking-[0.04em] text-[#44474E]">
              You can update these details later in Settings.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
