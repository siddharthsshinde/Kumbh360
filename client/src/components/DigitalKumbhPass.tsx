import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, Download, Share2, CheckCircle2, Calendar, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHaptics } from "@/hooks/useHaptics";
import { useNativeShare } from "@/hooks/useNativeShare";
import { useToast } from "@/hooks/use-toast";

const PASS_DATA = {
  name: "Pilgrim",
  passId: "KMN-2025-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
  zone: "Nashik — Panchavati Zone",
  validFrom: "Jan 29, 2025",
  validTo: "Sep 14, 2025",
  category: "General Pilgrim",
  issued: "Kumbh Mela Authority, Nashik",
};

function QRVisual({ data }: { data: string }) {
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=160x160&margin=8&color=1e293b&bgcolor=ffffff`}
      alt="Kumbh Pass QR Code"
      className="h-40 w-40 rounded-2xl"
      onError={(e) => {
        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Crect width='160' height='160' fill='%23f1f5f9' rx='12'/%3E%3Ctext x='50%25' y='50%25' font-family='monospace' font-size='11' fill='%2394a3b8' dominant-baseline='middle' text-anchor='middle'%3EQR Code%3C/text%3E%3C/svg%3E";
      }}
    />
  );
}

export function DigitalKumbhPass() {
  const [flipped, setFlipped] = useState(false);
  const { trigger } = useHaptics();
  const { share } = useNativeShare();
  const { toast } = useToast();

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Digital Kumbh Pass</h2>
          <p className="text-xs text-slate-500">Tap card to flip</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Verified
        </span>
      </div>

      {/* Pass Card */}
      <motion.div
        onClick={() => { trigger("light"); setFlipped(f => !f); }}
        style={{ cursor: "pointer", perspective: 1000 }}
        className="relative h-52"
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d", position: "absolute", width: "100%", height: "100%" }}
        >
          {/* Front */}
          <div
            style={{ backfaceVisibility: "hidden" }}
            className="absolute inset-0 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#FF7F00,#FFa040_50%,#FF6000)] p-5 text-white shadow-[0_12px_40px_rgba(255,127,0,0.35)]"
          >
            <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:repeating-linear-gradient(45deg,white_0px,white_1px,transparent_0,transparent_50%)] [background-size:20px_20px]" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-200">Kumbh Mela 2025 · Nashik</p>
                  <h3 className="mt-1 text-2xl font-bold">{PASS_DATA.name}</h3>
                  <p className="text-xs text-orange-100">{PASS_DATA.category}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-mono text-sm font-bold tracking-widest text-orange-100">{PASS_DATA.passId}</p>
                <div className="flex items-center gap-4 text-xs text-orange-200">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{PASS_DATA.validFrom} — {PASS_DATA.validTo}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-orange-200">
                  <MapPin className="h-3 w-3" />{PASS_DATA.zone}
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-hidden rounded-[2rem] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.10)]"
          >
            <QRVisual data={`KUMBH360:${PASS_DATA.passId}:${PASS_DATA.name}:${PASS_DATA.zone}`} />
            <div className="text-center">
              <p className="font-mono text-xs font-bold tracking-widest text-slate-600">{PASS_DATA.passId}</p>
              <p className="mt-0.5 text-xs text-slate-400">Scan at entry gates · Show to officials</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Pass details */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: User, label: "Category", value: PASS_DATA.category },
          { icon: MapPin, label: "Zone", value: "Panchavati" },
          { icon: Calendar, label: "Valid From", value: PASS_DATA.validFrom },
          { icon: Calendar, label: "Valid To", value: PASS_DATA.validTo },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </div>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 rounded-2xl"
          onClick={() => {
            trigger("light");
            void share({ title: "My Kumbh Pass", text: `Pass ID: ${PASS_DATA.passId}`, url: window.location.href });
          }}
        >
          <Share2 className="h-4 w-4" />
          Share pass
        </Button>
        <Button
          className="flex-1 rounded-2xl bg-[#FF7F00] hover:bg-[#E36A00] text-white"
          onClick={() => {
            trigger("medium");
            toast({ description: "Pass saved to device" });
          }}
        >
          <Download className="h-4 w-4" />
          Save pass
        </Button>
      </div>
    </div>
  );
}
