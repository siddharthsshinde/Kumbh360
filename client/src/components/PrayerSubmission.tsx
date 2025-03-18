import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";

export function PrayerSubmission() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [prayer, setPrayer] = useState("");

  const handleSubmit = async () => {
    if (!prayer.trim()) return;

    // Here we would typically make an API call to submit the prayer
    // For now, we'll just show a success message
    toast({
      title: t("prayerSubmitted"),
      description: "🙏 Om Namah Shivaya",
      variant: "default",
    });

    setOpen(false);
    setPrayer("");
  };

  return (
    <>
      <Button
        variant="default"
        onClick={() => setOpen(true)}
        className="rounded-full w-14 h-14 shadow-lg flex items-center justify-center bg-[#FF7F00] hover:bg-[#E3A018] text-white"
        aria-label="Submit Prayer"
      >
        <Heart className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-[#FF7F00] text-xl">{t("submitPrayer")}</DialogTitle>
            <DialogDescription>
              Your prayer will be physically placed at the sacred sites by our local representatives.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={prayer}
              onChange={(e) => setPrayer(e.target.value)}
              placeholder={t("prayerPlaceholder")}
              className="min-h-[100px] border-[#FF7F00]/20 focus:border-[#FF7F00]"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} className="bg-[#FF7F00] hover:bg-[#E3A018] text-white">
              {t("submitPrayer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}