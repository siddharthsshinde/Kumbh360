import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const CURRENT_USER_ID = "user123";

interface Location {
  lat: number;
  lng: number;
}

export interface EmergencyActionsController {
  notifyContacts: boolean;
  notifyControlRoom: boolean;
  sendingEmergency: boolean;
  sosDialogOpen: boolean;
  sosMessage: string;
  openSOS: () => void;
  setNotifyContacts: (value: boolean) => void;
  setNotifyControlRoom: (value: boolean) => void;
  setSosDialogOpen: (open: boolean) => void;
  setSosMessage: (message: string) => void;
  shareLocation: () => void;
  sendSOSMessage: () => void;
}

export function useEmergencyActions(): EmergencyActionsController {
  const { toast } = useToast();
  const [sosDialogOpen, setSosDialogOpen] = useState(false);
  const [sosMessage, setSosMessage] = useState("");
  const [sendingEmergency, setSendingEmergency] = useState(false);
  const [notifyContacts, setNotifyContacts] = useState(true);
  const [notifyControlRoom, setNotifyControlRoom] = useState(true);

  const shareLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser does not support location sharing.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        toast({
          title: "Location Shared",
          description: "Your location has been shared with emergency services.",
        });
      },
      () => {
        toast({
          title: "Location Error",
          description:
            "Unable to get your location. Please enable location services.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  const sendSOSMessage = () => {
    if (!sosMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide emergency details.",
        variant: "destructive",
      });
      return;
    }

    if (!notifyContacts && !notifyControlRoom) {
      toast({
        title: "Notification Options",
        description: "Please select at least one notification option.",
        variant: "destructive",
      });
      return;
    }

    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description:
          "Your browser does not support location sharing. Please use a different device.",
        variant: "destructive",
      });
      return;
    }

    setSendingEmergency(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        try {
          const response = await apiRequest<{ success: boolean; error?: string }>(
            "/api/sos-message",
            {
              method: "POST",
              body: JSON.stringify({
                userId: CURRENT_USER_ID,
                location,
                message: sosMessage,
                toControlRoom: notifyControlRoom,
                toContacts: notifyContacts,
              }),
            },
          );

          if (!response.success) {
            throw new Error(response.error || "Failed to send SOS message");
          }

          toast({
            title: "Emergency Alert Sent",
            description:
              "Emergency services have been notified. Stay calm, help is on the way.",
            variant: "destructive",
            duration: 10000,
          });

          setSosDialogOpen(false);
          setSosMessage("");
        } catch (error) {
          console.error("Failed to send SOS message:", error);
          toast({
            title: "Failed to Send Alert",
            description:
              "There was an error sending your emergency message. Please try again or call emergency services directly.",
            variant: "destructive",
          });
        } finally {
          setSendingEmergency(false);
        }
      },
      () => {
        setSendingEmergency(false);
        toast({
          title: "Location Error",
          description:
            "Unable to get your location. Please enable location services and try again.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  return {
    notifyContacts,
    notifyControlRoom,
    sendingEmergency,
    sosDialogOpen,
    sosMessage,
    openSOS: () => setSosDialogOpen(true),
    setNotifyContacts,
    setNotifyControlRoom,
    setSosDialogOpen,
    setSosMessage,
    shareLocation,
    sendSOSMessage,
  };
}
