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
    embedUrl: "https://www.google.com/maps/embed?pb=!4v1742246127271!6m8!1m7!1sPqDHN1zHdVLHt2OZJXq_IQ!2m2!1d20.00854120408353!2d73.7924885746894!3f210.56375!4f0!5f0.7820865974627469",
    location: {
      lat: 20.0074901,
      lng: 73.79205090000005
    }
  },
  {
    name: "Kalaram Temple",
    description: "Historic black stone temple dedicated to Lord Rama in Panchavati area. Notable for its architectural beauty and religious importance.",
    embedUrl: "https://www.google.com/maps/embed?pb=!4v1742247900000!6m8!1m7!1sCAoSLEFGMVFpcE9DSjJTRzVoeDU3ZlBwS0NQdjVMZlYwb2x5dGt1ZnYzTFZULW1r!2m2!1d20.00689164875!2d73.7902840338182!3f0!4f0!5f0.7820865974627469",
    location: {
      lat: 20.0064,
      lng: 73.7904
    }
  },
  {
    name: "Tapovan",
    description: "Sacred area where Lord Rama stayed during exile. Features ancient caves and meditation spots surrounded by natural beauty.",
    embedUrl: "https://www.google.com/maps/embed?pb=!4v1742247950000!6m8!1m7!1sCAoSLEFGMVFpcE5nZVFibEJxcVhpcl9lbkVlVTQ1NXFNZk1GMTNnYUpJLXVjV01V!2m2!1d20.01103104458!2d73.79389071464539!3f0!4f0!5f0.7820865974627469",
    location: {
      lat: 20.0116,
      lng: 73.7938
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