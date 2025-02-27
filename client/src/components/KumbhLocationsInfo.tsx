
import React from 'react';
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function KumbhLocationsInfo() {
  return (
    <Card className="w-full bg-white shadow-md mb-4">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4 text-[#FF7F00]">
          <span className="mr-2">🏯</span>
          Sacred Sites of Kumbh Mela
        </h2>
        
        <Tabs defaultValue="ramkund">
          <TabsList className="w-full flex overflow-x-auto pb-1 mb-2">
            <TabsTrigger value="ramkund" className="flex-1">Ramkund</TabsTrigger>
            <TabsTrigger value="tapovan" className="flex-1">Tapovan</TabsTrigger>
            <TabsTrigger value="kalaram" className="flex-1">Kalaram Temple</TabsTrigger>
            <TabsTrigger value="trimbak" className="flex-1">Trimbakeshwar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ramkund" className="mt-2">
            <div className="text-sm">
              <p className="mb-2"><strong>Ramkund</strong> is the most sacred bathing spot in Nashik. According to legend, Lord Rama and Sita bathed here during their exile.</p>
              <p className="mb-2">During Kumbh Mela, millions of devotees take a holy dip in Ramkund to wash away their sins.</p>
              <p className="text-orange-700 font-semibold">Main bathing days: Scheduled for special celestial alignments in 2025</p>
            </div>
          </TabsContent>
          
          <TabsContent value="tapovan" className="mt-2">
            <div className="text-sm">
              <p className="mb-2"><strong>Tapovan</strong> is where Lord Rama, Sita and Lakshmana stayed during their exile.</p>
              <p className="mb-2">This ancient meditation site is visited by sadhus and pilgrims seeking spiritual enlightenment.</p>
              <p className="text-orange-700 font-semibold">Special events: Sadhu gatherings and religious discourses throughout Kumbh Mela</p>
            </div>
          </TabsContent>
          
          <TabsContent value="kalaram" className="mt-2">
            <div className="text-sm">
              <p className="mb-2"><strong>Kalaram Temple</strong> is dedicated to Lord Rama and features black stone architecture.</p>
              <p className="mb-2">The temple is one of the most important religious sites in Nashik and a key location during Kumbh Mela.</p>
              <p className="text-orange-700 font-semibold">Daily rituals: Morning aarti at 5:30 AM and evening aarti at 7:00 PM</p>
            </div>
          </TabsContent>
          
          <TabsContent value="trimbak" className="mt-2">
            <div className="text-sm">
              <p className="mb-2"><strong>Trimbakeshwar Temple</strong> is one of the 12 Jyotirlingas dedicated to Lord Shiva.</p>
              <p className="mb-2">Located about 30km from Nashik city, this is where the Godavari River originates.</p>
              <p className="text-orange-700 font-semibold">Special darshan: Extended hours during Kumbh Mela from 4:00 AM to 11:00 PM</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="text-xs text-gray-500 mt-4">
          <p>All these sacred sites will have special arrangements during Kumbh Mela 2025. Crowd management systems will be in place. Please check the map for exact locations.</p>
        </div>
      </div>
    </Card>
  );
}
