
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useQuery } from "@tanstack/react-query";
import type { CrowdLevel } from "@shared/schema";

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
  const zonesRef = useRef<MapZone[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch crowd levels for real-time data
  const { data: crowdLevels = [] } = useQuery<CrowdLevel[]>({
    queryKey: ["/api/crowd-levels"],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });

  // Base sacred zones data
  const baseZones: MapZone[] = [
    {
      name: 'Ramkund',
      coordinates: [[73.7913, 20.0059], [73.7920, 20.0067], [73.7915, 20.0085]],
      status: 'Active',
      crowdDensity: 0.8
    },
    {
      name: 'Kalaram Temple',
      coordinates: [[73.7902, 20.0064], [73.7910, 20.0072], [73.7906, 20.0080]],
      status: 'Moderate',
      crowdDensity: 0.6
    },
    {
      name: 'Tapovan',
      coordinates: [[73.7938, 20.0116], [73.7950, 20.0130], [73.7940, 20.0145]],
      status: 'Moderate',
      crowdDensity: 0.5
    },
    {
      name: 'Godavari Ghat',
      coordinates: [[73.7928, 20.0060], [73.7935, 20.0070], [73.7925, 20.0075]],
      status: 'Quiet',
      crowdDensity: 0.3
    }
  ];

  // Update zones data with real-time crowd information
  useEffect(() => {
    if (crowdLevels.length === 0) return;
    
    const updatedZones = baseZones.map(zone => {
      // Find matching crowd level data
      const crowdData = crowdLevels.find(level => level.location === zone.name);
      
      if (crowdData) {
        const crowdRatio = crowdData.currentCount / crowdData.capacity;
        let status = 'Low';
        
        if (crowdRatio > 0.8) status = 'Critical';
        else if (crowdRatio > 0.6) status = 'High';
        else if (crowdRatio > 0.4) status = 'Moderate';
        
        return {
          ...zone,
          status,
          crowdDensity: Math.min(1, crowdRatio)
        };
      }
      
      return zone;
    });
    
    zonesRef.current = updatedZones;
    setLastUpdated(new Date().toLocaleTimeString());
    
    // Update map sources if map is loaded
    if (map.current && map.current.isStyleLoaded()) {
      updatedZones.forEach((zone, index) => {
        if (!map.current) return;
        
        try {
          const source = map.current.getSource(`zone-${index}`);
          if (source) {
            (source as mapboxgl.GeoJSONSource).setData({
              type: 'Feature',
              properties: {
                name: zone.name,
                density: zone.crowdDensity
              },
              geometry: {
                type: 'Polygon',
                coordinates: [zone.coordinates]
              }
            });
          }
        } catch (error) {
          console.error('Error updating source', error);
        }
      });
    }
  }, [crowdLevels]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [73.7913, 20.0059],
      zoom: 14
    });

    map.current.on('load', () => {
      const currentZones = zonesRef.current.length > 0 ? zonesRef.current : baseZones;
      
      currentZones.forEach((zone, index) => {
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
        
        // Add text label
        map.current.addLayer({
          id: `zone-label-${index}`,
          type: 'symbol',
          source: `zone-${index}`,
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans Bold'],
            'text-size': 12,
            'text-offset': [0, 0],
            'text-anchor': 'center'
          },
          paint: {
            'text-color': '#000',
            'text-halo-color': '#fff',
            'text-halo-width': 1
          }
        });
      });
    });

    return () => map.current?.remove();
  }, []);

  const filterZones = (value: string) => {
    setZoneFilter(value);
    const currentZones = zonesRef.current.length > 0 ? zonesRef.current : baseZones;
    
    currentZones.forEach((_, index) => {
      if (!map.current) return;
      const visibility = value === 'all' || value === `zone-${index}` ? 'visible' : 'none';
      map.current.setLayoutProperty(`zone-${index}`, 'visibility', visibility);
      map.current.setLayoutProperty(`zone-label-${index}`, 'visibility', visibility);
    });
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Kumbh Mela Sacred Zones</h2>
          {lastUpdated && (
            <p className="text-xs text-gray-500">Last updated: {lastUpdated}</p>
          )}
        </div>
        <Select value={zoneFilter} onValueChange={filterZones}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter zones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Zones</SelectItem>
            {(zonesRef.current.length > 0 ? zonesRef.current : baseZones).map((zone, index) => (
              <SelectItem key={index} value={`zone-${index}`}>
                {zone.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div ref={mapContainer} className="h-[500px] rounded-lg" />
      <div className="mt-4 flex gap-2 flex-wrap">
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
        <div className="ml-auto text-xs text-gray-500">
          Updates every 10 seconds
        </div>
      </div>
    </Card>
  );
}
