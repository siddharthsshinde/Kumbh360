import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Location {
  name: string;
  description: string;
  embedUrl?: string; // Google Maps embed URL
  location: {
    lat: number;
    lng: number;
  };
}

const NASHIK_LOCATIONS: Location[] = [
  {
    name: "Ramkund",
    description: "Sacred bathing ghat on the Godavari River, where pilgrims perform holy rituals. Known for its spiritual significance during Kumbh Mela.",
    embedUrl: "https://www.google.com/maps/embed?pb=!4v1743013941549!6m8!1m7!1sCAoSFkNJSE0wb2dLRUlDQWdJRGMxNjdWRmc.!2m2!1d20.00801065915066!2d73.7923077051028!3f222.9007123300821!4f0!5f0.7820865974627469",
    location: {
      lat: 19.994031, 
      lng: 73.788984
    }
  },
  {
    name: "Kalaram Temple",
    description: "Historic black stone temple dedicated to Lord Rama in Panchavati area. Notable for its architectural beauty and religious importance.",
    embedUrl: "https://www.google.com/maps/embed?pb=!4v1742506764845!6m8!1m7!1sCAoSLEFGMVFpcFAyYWpyQktSaXJ1UGlkMlU4a2xaQVlLeEZZczVkZnpVQk1rNWdy!2m2!1d19.9969979!2d73.7906662!3f290!4f0!5f0.7820865974627469",
    location: {
      lat: 19.997090, 
      lng: 73.790732
    }
  },
  {
    name: "Tapovan",
    description: "Sacred area where Lord Rama stayed during exile. Features ancient caves and meditation spots surrounded by natural beauty.",
    embedUrl: "https://www.google.com/maps/embed?pb=!4v1742506832892!6m8!1m7!1sCAoSLEFGMVFpcE9MN2YtVDMxVnVRT0Q4eWdSU01YWDh2bEdFVWc0QmNXSm04YU5j!2m2!1d19.9967088!2d73.7715396!3f340!4f0!5f0.7820865974627469",
    location: {
      lat: 19.996708, 
      lng: 73.771539
    }
  },
  {
    name: "Trimbakeshwar Temple",
    description: "One of the 12 Jyotirlingas of Lord Shiva, located near the source of the Godavari River. A significant pilgrimage site during Kumbh Mela.",
    embedUrl: "https://www.google.com/maps/embed?pb=!4v1743013799730!6m8!1m7!1sCAoSF0NJSE0wb2dLRUlDQWdJQ3Nockhhd0FF!2m2!1d19.93226034298676!2d73.53088431904804!3f347.99960142392763!4f-11.914398405267548!5f0.7820865974627469",
    location: {
      lat: 19.932127, 
      lng: 73.530555
    }
  }
];

export function StreetView() {
  const [selectedLocation, setSelectedLocation] = useState<Location>(NASHIK_LOCATIONS[0]);
  const { toast } = useToast();

  const changeLocation = (location: Location) => {
    setSelectedLocation(location);
    toast({
      title: "Location Changed",
      description: `Now viewing ${location.name}`,
      variant: "default",
    });
  };

  return (
    <Card className="p-4 w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center text-[#FF7F00]">
          Kumbh Mela 360° View
        </h2>

        <div className="flex gap-2 justify-center mb-4 flex-wrap">
          {NASHIK_LOCATIONS.map((location) => (
            <Button
              key={location.name}
              onClick={() => changeLocation(location)}
              variant={selectedLocation.name === location.name ? "default" : "outline"}
              className={selectedLocation.name === location.name ? "bg-[#FF7F00] text-white" : ""}
            >
              {location.name}
            </Button>
          ))}
        </div>

        <div className="relative w-full overflow-hidden rounded-lg" style={{ height: "450px" }}>
          {selectedLocation.embedUrl ? (
            <iframe 
              src={selectedLocation.embedUrl}
              width="100%" 
              height="100%" 
              style={{border: 0}} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title={`${selectedLocation.name} Street View`}
              className="rounded-lg"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <p>No street view available for this location</p>
            </div>
          )}
        </div>

        <p className="text-center text-gray-600 mt-2">
          {selectedLocation.description}
        </p>
      </div>
    </Card>
  );
}