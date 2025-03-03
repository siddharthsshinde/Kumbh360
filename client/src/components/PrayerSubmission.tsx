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
        variant="outline"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700"
      >
        <Heart className="h-4 w-4" />
        {t("submitPrayer")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("submitPrayer")}</DialogTitle>
            <DialogDescription>
              Your prayer will be physically placed at the sacred sites by our local representatives.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={prayer}
              onChange={(e) => setPrayer(e.target.value)}
              placeholder={t("prayerPlaceholder")}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} className="bg-[#FF7F00] hover:bg-[#FF5500]">
              {t("submitPrayer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}