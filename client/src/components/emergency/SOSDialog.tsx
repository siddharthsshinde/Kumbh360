import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Phone } from "lucide-react";
import { useLocation } from "wouter";
import type { EmergencyActionsController } from "@/hooks/useEmergencyActions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CURRENT_USER_ID = "user123";

interface EmergencyContact {
  id: number;
  userId: string;
  contactName: string;
  contactNumber: string;
  relationship: string | null;
  createdAt: string;
}

interface SOSDialogProps {
  emergency: EmergencyActionsController;
}

export function SOSDialog({ emergency }: SOSDialogProps) {
  const [, setLocation] = useLocation();
  const { data: emergencyContacts = [] } = useQuery<EmergencyContact[]>({
    queryKey: [`/api/user-emergency-contacts/${CURRENT_USER_ID}`],
    refetchOnWindowFocus: false,
    enabled: emergency.sosDialogOpen,
  });

  return (
    <Dialog
      open={emergency.sosDialogOpen}
      onOpenChange={emergency.setSosDialogOpen}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Emergency SOS
          </DialogTitle>
          <DialogDescription>
            Send an emergency alert to authorities and trusted contacts. Your
            current location will be attached automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="sos-message" className="font-medium">
              Describe your emergency
            </Label>
            <Textarea
              id="sos-message"
              placeholder="I need immediate help with..."
              className="min-h-[120px]"
              value={emergency.sosMessage}
              onChange={(event) => emergency.setSosMessage(event.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="notify-authorities"
                checked={emergency.notifyControlRoom}
                onCheckedChange={() =>
                  emergency.setNotifyControlRoom(!emergency.notifyControlRoom)
                }
              />
              <Label htmlFor="notify-authorities" className="leading-6">
                Notify the Kumbh control room, police, medical, and safety
                personnel.
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="notify-contacts"
                checked={emergency.notifyContacts}
                onCheckedChange={() =>
                  emergency.setNotifyContacts(!emergency.notifyContacts)
                }
              />
              <Label htmlFor="notify-contacts" className="leading-6">
                Notify my emergency contacts ({emergencyContacts.length || 0}).
              </Label>
            </div>

            {emergency.notifyContacts && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                {emergencyContacts.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Your emergency contacts
                    </div>
                    {emergencyContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="text-sm text-slate-600"
                      >
                        {contact.contactName} - {contact.contactNumber}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 text-sm text-slate-600">
                    <p>You have not added any emergency contacts yet.</p>
                    <Button
                      variant="outline"
                      className="text-blue-600"
                      onClick={() => {
                        emergency.setSosDialogOpen(false);
                        setLocation("/profile");
                      }}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Manage emergency contacts
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => emergency.setSosDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={emergency.sendSOSMessage}
            disabled={emergency.sendingEmergency}
          >
            {emergency.sendingEmergency ? "Sending..." : "Send Emergency Alert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
