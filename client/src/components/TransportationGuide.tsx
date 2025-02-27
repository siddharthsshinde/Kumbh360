
import React, { useState } from 'react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';

export function TransportationGuide() {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="w-full bg-white shadow-md mb-4">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4 text-[#FF7F00] flex items-center justify-between">
          <div>
            <span className="mr-2">🚌</span>
            Transportation Guide
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs"
          >
            {expanded ? "Show Less" : "Show More"}
          </Button>
        </h2>
        
        {expanded ? (
          <Tabs defaultValue="bus" className="w-full">
            <TabsList className="w-full grid grid-cols-4 mb-4">
              <TabsTrigger value="bus">Bus Services</TabsTrigger>
              <TabsTrigger value="train">Trains</TabsTrigger>
              <TabsTrigger value="auto">Auto/Taxi</TabsTrigger>
              <TabsTrigger value="special">Special Services</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bus" className="space-y-4">
              <div>
                <h3 className="font-semibold text-md mb-2">Kumbh Special Shuttle Services</h3>
                <p className="text-sm mb-2">Free shuttle buses run every 15 minutes from:</p>
                <ul className="text-sm list-disc pl-5 mb-3">
                  <li>Nashik Road Railway Station to Ramkund</li>
                  <li>Central Bus Stand to Tapovan</li>
                  <li>Nashik Municipal Corporation to Trimbakeshwar</li>
                </ul>
                <p className="text-sm mb-2"><span className="font-semibold">Hours:</span> 4:00 AM - 11:00 PM daily</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-md mb-2">City Bus Routes</h3>
                <p className="text-sm mb-2">Regular city buses with increased frequency during Kumbh Mela:</p>
                <ul className="text-sm list-disc pl-5">
                  <li>Route 1: Nashik Road - CBS - Ramkund (every 10 min)</li>
                  <li>Route 5: Nashik Road - Tapovan - Trimbakeshwar (every 20 min)</li>
                  <li>Route 8: Cidco - Panchavati - Ramkund (every 15 min)</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="train" className="space-y-4">
              <div>
                <h3 className="font-semibold text-md mb-2">Special Trains for Kumbh</h3>
                <p className="text-sm mb-2">Indian Railways has added special trains for Kumbh Mela 2025:</p>
                <ul className="text-sm list-disc pl-5 mb-3">
                  <li>Mumbai - Nashik (10 additional trains daily)</li>
                  <li>Pune - Nashik (8 additional trains daily)</li>
                  <li>Delhi - Nashik (2 additional trains daily)</li>
                </ul>
                <p className="text-sm font-semibold text-orange-700">Book in advance as seats fill quickly!</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-md mb-2">From Nashik Road Station</h3>
                <p className="text-sm mb-2">Free shuttle buses and prepaid auto services available outside the station.</p>
                <p className="text-sm">Distance to main bathing ghats: ~7 km (30-45 min during Kumbh)</p>
              </div>
            </TabsContent>
            
            <TabsContent value="auto" className="space-y-4">
              <div>
                <h3 className="font-semibold text-md mb-2">Auto Rickshaws</h3>
                <p className="text-sm mb-2">Auto rickshaws are available throughout Nashik with fixed rates during Kumbh:</p>
                <ul className="text-sm list-disc pl-5 mb-3">
                  <li>Nashik Road to Ramkund: ₹200</li>
                  <li>Nashik CBS to Panchavati: ₹150</li>
                  <li>Ramkund to Tapovan: ₹100</li>
                </ul>
                <p className="text-sm font-semibold text-red-600">Always confirm price before starting journey!</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-md mb-2">Prepaid Taxi Services</h3>
                <p className="text-sm mb-2">Prepaid taxi booths at:</p>
                <ul className="text-sm list-disc pl-5">
                  <li>Nashik Road Railway Station</li>
                  <li>Central Bus Stand</li>
                  <li>Nashik Airport</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="special" className="space-y-4">
              <div>
                <h3 className="font-semibold text-md mb-2">Electric Cart Service</h3>
                <p className="text-sm mb-2">Free e-carts for elderly and disabled visitors:</p>
                <ul className="text-sm list-disc pl-5 mb-3">
                  <li>Available at all major entry points</li>
                  <li>Pre-booking available through Kumbh Mela app</li>
                </ul>
                <p className="text-sm">Priority given to senior citizens and persons with disabilities</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-md mb-2">Walking Routes</h3>
                <p className="text-sm mb-2">Dedicated pedestrian-only paths marked with orange flags:</p>
                <ul className="text-sm list-disc pl-5">
                  <li>Ramkund Circuit: 2 km loop around key bathing areas</li>
                  <li>Panchavati Path: 3 km route connecting major temples</li>
                  <li>Godavari Walkway: 5 km riverside path</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-sm space-y-2">
            <p>Multiple transportation options available for Kumbh Mela visitors:</p>
            <ul className="list-disc pl-5">
              <li>Free shuttle buses every 15 minutes from major points</li>
              <li>Special train services with increased frequency</li>
              <li>Fixed-rate auto rickshaws and prepaid taxis</li>
              <li>Electric carts for elderly and disabled visitors</li>
            </ul>
            <p className="text-orange-700 font-semibold mt-2">Click "Show More" for detailed routes and schedules.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
