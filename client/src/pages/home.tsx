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
import { TransportationGuide } from "@/components/TransportationGuide";
import { MapPin, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { i18n } = useTranslation();
  const { toast } = useToast();

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Here you would typically send this to your backend
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
    // Here you would integrate with emergency services
    toast({
      title: "Emergency Alert Sent",
      description: "Emergency services have been notified. Stay calm, help is on the way.",
      variant: "destructive",
      duration: 10000 // Show for 10 seconds
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleShareLocation}
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700"
            >
              <MapPin className="h-4 w-4" />
              Share Location
            </Button>
            <Button
              variant="outline"
              onClick={handleSOS}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700"
            >
              <AlertCircle className="h-4 w-4" />
              SOS
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => i18n.changeLanguage("en")}
              className={i18n.language === "en" ? "bg-[#FF7F00] text-white" : ""}
            >
              English
            </Button>
            <Button
              variant="outline"
              onClick={() => i18n.changeLanguage("hi")}
              className={i18n.language === "hi" ? "bg-[#FF7F00] text-white" : ""}
            >
              हिंदी
            </Button>
            <Button
              variant="outline"
              onClick={() => i18n.changeLanguage("mr")}
              className={i18n.language === "mr" ? "bg-[#FF7F00] text-white" : ""}
            >
              मराठी
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4">
          <RealTimeSafetySuggestion />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <ChatInterface />
          </div>
          <div className="space-y-8">
            <WeatherWidget />
            <CrowdLevelIndicator />
          </div>
        </div>
        <div className="mb-6">
          <NewsWidget />
        </div>
        <FacilityMap />
        <KumbhLocationsInfo />
        <AccommodationFinder/>
        <TransportationGuide />
      </div>
    </div>
  );
}