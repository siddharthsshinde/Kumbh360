
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface MapZone {
  name: string;
  coordinates: number[][];
  status: string;
  crowdDensity: number;
}

export function KumbhMelaMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  const sacredZones: MapZone[] = [
    {
      name: 'Ramkund',
      coordinates: [[73.7913, 20.0059], [73.7920, 20.0067], [73.7915, 20.0085]],
      status: 'Active',
      crowdDensity: 0.8
    },
    {
      name: 'Tapovan',
      coordinates: [[73.7938, 20.0116], [73.7950, 20.0130], [73.7940, 20.0145]],
      status: 'Moderate',
      crowdDensity: 0.5
    }
  ];

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [73.7913, 20.0059],
      zoom: 14
    });

    map.current.on('load', () => {
      sacredZones.forEach((zone, index) => {
        if (!map.current) return;

        // Add zone polygon
        map.current.addSource(`zone-${index}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {
              name: zone.name,
              density: zone.crowdDensity
            },
            geometry: {
              type: 'Polygon',
              coordinates: [zone.coordinates]
            }
          }
        });

        // Add zone layer
        map.current.addLayer({
          id: `zone-${index}`,
          type: 'fill',
          source: `zone-${index}`,
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'density'],
              0, '#00ff00',
              0.5, '#ffff00',
              1, '#ff0000'
            ],
            'fill-opacity': 0.7
          }
        });
      });
    });

    return () => map.current?.remove();
  }, []);

  const filterZones = (value: string) => {
    setZoneFilter(value);
    sacredZones.forEach((_, index) => {
      if (!map.current) return;
      const visibility = value === 'all' || value === `zone-${index}` ? 'visible' : 'none';
      map.current.setLayoutProperty(`zone-${index}`, 'visibility', visibility);
    });
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Kumbh Mela Sacred Zones</h2>
        <Select value={zoneFilter} onValueChange={filterZones}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter zones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Zones</SelectItem>
            {sacredZones.map((zone, index) => (
              <SelectItem key={index} value={`zone-${index}`}>
                {zone.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div ref={mapContainer} className="h-[500px] rounded-lg" />
      <div className="mt-4 flex gap-2">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 opacity-70 rounded mr-2" />
          <span>Low Crowd</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-500 opacity-70 rounded mr-2" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 opacity-70 rounded mr-2" />
          <span>High Crowd</span>
        </div>
      </div>
    </Card>
  );
}
