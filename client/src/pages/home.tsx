import { ChatInterface } from "@/components/ChatInterface";
import { WeatherWidget } from "@/components/WeatherWidget";
import { FacilityMap } from "@/components/FacilityMap";
import { CrowdLevelIndicator } from "@/components/CrowdLevel";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { RealTimeSafetySuggestion } from "@/components/RealTimeSafetySuggestion";
import { NewsWidget } from "@/components/NewsWidget";
import { KumbhLocationsInfo } from "@/components/KumbhLocationsInfo";
import { AccommodationFinder } from "@/components/AccommodationFinder";
import { EmergencyContacts } from "@/components/EmergencyContacts";
import { StreetView } from "@/components/StreetView";
import { LostAndFound } from "@/components/LostAndFound";
import { SmartTransportationHub } from "@/components/SmartTransportationHub";
import { FoodWaterSafety } from "@/components/FoodWaterSafety";
import { CommunityFeatures } from "@/components/CommunityFeatures";
import { MapPin, AlertCircle, Camera, UserSearch, AlertTriangle, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { PrayerSubmission } from "@/components/PrayerSubmission";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Placeholder user ID - in a real app, this would come from authentication
const CURRENT_USER_ID = "user123";

interface EmergencyContact {
  id: number;
  userId: string;
  contactName: string;
  contactNumber: string;
  relationship: string | null;
  createdAt: string;
}

interface Location {
  lat: number;
  lng: number;
}

export default function Home() {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const [showStreetView, setShowStreetView] = useState(false);
  const [showLostAndFound, setShowLostAndFound] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [activeTab, setActiveTab] = useState("main");
  const [sosMessage, setSosMessage] = useState("");
  const [sosDialogOpen, setSosDialogOpen] = useState(false);
  const [sendingEmergency, setSendingEmergency] = useState(false);
  const [notifyContacts, setNotifyContacts] = useState(true);
  const [notifyControlRoom, setNotifyControlRoom] = useState(true);
  
  // Fetch emergency contacts
  const { data: emergencyContacts = [] } = useQuery<EmergencyContact[]>({
    queryKey: [`/api/user-emergency-contacts/${CURRENT_USER_ID}`],
    refetchOnWindowFocus: false,
    enabled: sosDialogOpen, // Only fetch when dialog opens
  });

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          toast({
            title: "Location Shared",
            description: "Your location has been shared with emergency services.",
            variant: "default"
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enable location services.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location sharing.",
        variant: "destructive"
      });
    }
  };

  const handleSOS = () => {
    // Open the SOS dialog
    setSosDialogOpen(true);
  };
  
  const sendSOSMessage = () => {
    if (!sosMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide emergency details.",
        variant: "destructive"
      });
      return;
    }
    
    if (!notifyContacts && !notifyControlRoom) {
      toast({
        title: "Notification Options",
        description: "Please select at least one notification option.",
        variant: "destructive"
      });
      return;
    }
    
    setSendingEmergency(true);
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const location: Location = { lat: latitude, lng: longitude };
          
          try {
            // Send SOS via API using the apiRequest utility
            const response = await apiRequest("/api/sos-message", {
              method: "POST",
              body: JSON.stringify({
                userId: CURRENT_USER_ID,
                location,
                message: sosMessage,
                toControlRoom: notifyControlRoom,
                toContacts: notifyContacts
              }),
            });
            
            if (response.success) {
              // Show success message
              toast({
                title: "Emergency Alert Sent",
                description: "Emergency services have been notified. Stay calm, help is on the way.",
                variant: "destructive",
                duration: 10000
              });
              
              // Close dialog and reset
              setSosDialogOpen(false);
              setSosMessage("");
            } else {
              throw new Error(response.error || "Failed to send SOS message");
            }
          } catch (error) {
            console.error("Failed to send SOS message:", error);
            toast({
              title: "Failed to Send Alert",
              description: "There was an error sending your emergency message. Please try again or call emergency services directly.",
              variant: "destructive"
            });
          } finally {
            setSendingEmergency(false);
          }
        },
        (error) => {
          setSendingEmergency(false);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enable location services and try again.",
            variant: "destructive"
          });
        }
      );
    } else {
      setSendingEmergency(false);
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location sharing. Please use a different device.",
        variant: "destructive"
      });
    }
  };

  // Mobile navigation tabs
  const tabs = [
    { id: "main", label: "Main" },
    { id: "maps", label: "Maps" },
    { id: "info", label: "Info" },
    { id: "transport", label: "Transport" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header Section - Fixed at the top */}
      <header className="sticky top-0 z-50 bg-white shadow-md px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-[#FF7F00] hidden md:block">Kumbh Mela 2025</h1>
            
            {/* Emergency Buttons - Always visible */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={handleShareLocation}
                className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs sm:text-sm"
                size="sm"
              >
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Share Location</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleSOS}
                className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm"
                size="sm"
              >
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">SOS</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowStreetView(!showStreetView)}
                className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm"
                size="sm"
              >
                <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{showStreetView ? 'Hide View' : 'Street View'}</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowLostAndFound(!showLostAndFound)}
                className="flex items-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs sm:text-sm"
                size="sm"
              >
                <UserSearch className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">{showLostAndFound ? 'Hide Lost & Found' : 'Lost & Found'}</span>
              </Button>
            </div>
            
            {/* Language Selector */}
            <div className="flex gap-1 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => i18n.changeLanguage("en")}
                className={`${i18n.language === "en" ? "bg-[#FF7F00] text-white" : ""} text-xs px-2 py-1`}
                size="sm"
              >
                EN
              </Button>
              <Button
                variant="outline"
                onClick={() => i18n.changeLanguage("hi")}
                className={`${i18n.language === "hi" ? "bg-[#FF7F00] text-white" : ""} text-xs px-2 py-1`}
                size="sm"
              >
                हिं
              </Button>
              <Button
                variant="outline"
                onClick={() => i18n.changeLanguage("mr")}
                className={`${i18n.language === "mr" ? "bg-[#FF7F00] text-white" : ""} text-xs px-2 py-1`}
                size="sm"
              >
                मरा
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 pb-20 pt-4">
        {/* Mobile Tab Navigation - Only visible on small screens */}
        <div className="md:hidden mb-4 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 border-b border-gray-200 pb-2">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`rounded-full text-sm px-4 ${activeTab === tab.id ? "bg-[#FF7F00] text-white" : "text-gray-600"}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {showStreetView && (
          <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
            <StreetView />
          </div>
        )}

        {showLostAndFound && (
          <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
            <LostAndFound />
          </div>
        )}

        {/* Safety Alert - Always Visible */}
        <div className="mb-6 rounded-lg shadow-md overflow-hidden border-l-4 border-[#FF7F00]">
          <RealTimeSafetySuggestion />
        </div>

        {/* Main Content Sections */}
        <div className={`space-y-6 ${(activeTab === "main" || activeTab === "info") ? "" : "hidden md:block"}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            <div className="md:col-span-2 h-full flex flex-col">
              <ChatInterface />
            </div>
            <div className="space-y-4 h-full flex flex-col">
              <WeatherWidget />
              <div className="flex-grow">
                <CrowdLevelIndicator />
              </div>
            </div>
          </div>
          
          {/* Kumbh Mela Map placed above News Updates as requested */}
          <div className="rounded-lg overflow-hidden shadow-lg">
            <FacilityMap />
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-md">
            <KumbhLocationsInfo />
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-md">
            <NewsWidget />
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-md">
            <FoodWaterSafety />
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-md">
            <CommunityFeatures />
          </div>
        </div>

        {/* Maps Content Section - Map is now also in the main section */}
        <div className={`space-y-6 ${(activeTab === "maps") ? "" : "hidden md:block"}`}>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <FacilityMap />
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-md">
            <KumbhLocationsInfo />
          </div>
        </div>

        {/* Travel & Accommodations Content Section */}
        <div className={`space-y-6 ${(activeTab === "transport" || activeTab === "info") ? "" : "hidden md:block"}`}>
          <div className="rounded-lg overflow-hidden shadow-md">
            <AccommodationFinder/>
          </div>
          
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden shadow-md">
              <SmartTransportationHub />
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Submission now shown as a floating action button */}
      <div className="fixed bottom-4 right-4 z-40">
        <PrayerSubmission />
      </div>

      {/* SOS Dialog */}
      <Dialog open={sosDialogOpen} onOpenChange={setSosDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Emergency SOS
            </DialogTitle>
            <DialogDescription>
              Send emergency alert to authorities and your emergency contacts. Your current location will be shared automatically.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sos-message" className="font-medium">Describe your emergency:</Label>
              <Textarea 
                id="sos-message" 
                placeholder="I need immediate help with..." 
                className="min-h-[100px]"
                value={sosMessage}
                onChange={(e) => setSosMessage(e.target.value)}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="notify-authorities" 
                  checked={notifyControlRoom}
                  onCheckedChange={() => setNotifyControlRoom(!notifyControlRoom)}
                />
                <Label htmlFor="notify-authorities">
                  Notify Kumbh Control Room (Police, Medical & Safety Personnel)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="notify-contacts" 
                  checked={notifyContacts}
                  onCheckedChange={() => setNotifyContacts(!notifyContacts)}
                />
                <Label htmlFor="notify-contacts">
                  Notify my emergency contacts ({emergencyContacts.length || 0})
                </Label>
              </div>
              
              {/* Contact Information */}
              {notifyContacts && (
                <div className="border rounded-md p-3 bg-gray-50">
                  {emergencyContacts.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Your emergency contacts:</div>
                      {emergencyContacts.map((contact) => (
                        <div key={contact.id} className="text-sm">
                          {contact.contactName} • {contact.contactNumber}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 flex flex-col items-center space-y-2">
                      <p>You haven't added any emergency contacts yet.</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-blue-600"
                        onClick={() => {
                          setSosDialogOpen(false);
                          setShowEmergencyContacts(true);
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Add Emergency Contacts
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setSosDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={sendSOSMessage}
              disabled={sendingEmergency}
            >
              {sendingEmergency ? "Sending..." : "Send Emergency Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emergency Contacts Section */}
      {showEmergencyContacts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Emergency Contacts</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowEmergencyContacts(false)}
                >
                  Close
                </Button>
              </div>
              <div className="p-4">
                <EmergencyContacts />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Emergency Contacts button */}
      <div className="fixed bottom-4 left-4 z-40">
        <Button
          variant="outline"
          className="rounded-full shadow-lg bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
          onClick={() => setShowEmergencyContacts(true)}
        >
          <Phone className="h-4 w-4 mr-2" />
          Emergency Contacts
        </Button>
      </div>
    </div>
  );
}