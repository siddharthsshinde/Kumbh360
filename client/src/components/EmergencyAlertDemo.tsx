import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmergencyCrowdAlert } from "@/components/EmergencyCrowdAlert";
import { AlertTriangle } from "lucide-react";

export function EmergencyAlertDemo() {
  const [activeTab, setActiveTab] = useState<string>("sangam");
  const [showSangamAlert, setShowSangamAlert] = useState<boolean>(true);
  const [showAshramAlert, setShowAshramAlert] = useState<boolean>(true);
  
  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#FF7F00] flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Emergency Crowd Alerts
        </h2>
      </div>
      
      <Tabs defaultValue="sangam" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sangam" className="relative">
            Sangam Area
            {showSangamAlert && (
              <span className="absolute top-0 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ashram" className="relative">
            Nashik Ashram
            {showAshramAlert && (
              <span className="absolute top-0 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sangam" className="space-y-4 pt-4">
          {showSangamAlert ? (
            <>
              <EmergencyCrowdAlert 
                location="Sangam Area, Nashik"
                timestamp={new Date().toISOString()}
                capacity={15000}
                currentCount={14250}
                alertLevel="critical"
                message="Critical overcrowding at Sangam Area. Emergency services have been deployed. Please avoid this area and follow official instructions."
              />
              
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSangamAlert(false)}
                >
                  Dismiss Alert
                </Button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-gray-500 space-y-3">
              <p>Alert dismissed</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSangamAlert(true)}
              >
                Restore Alert
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="ashram" className="space-y-4 pt-4">
          {showAshramAlert ? (
            <>
              <EmergencyCrowdAlert 
                location="Nashik Ashram"
                timestamp={new Date().toISOString()}
                capacity={8000}
                currentCount={7600}
                alertLevel="critical"
                message="Critical overcrowding at Nashik Ashram. Special event attendees should use North gate exit only. Emergency personnel are on site."
              />
              
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAshramAlert(false)}
                >
                  Dismiss Alert
                </Button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-gray-500 space-y-3">
              <p>Alert dismissed</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAshramAlert(true)}
              >
                Restore Alert
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="text-sm text-gray-500 border-t pt-3 mt-3">
        These emergency alerts are generated based on real-time crowd density data and are updated every 2 minutes. 
        Critical alerts are automatically displayed when crowd density exceeds 90% of maximum capacity.
      </div>
    </Card>
  );
}