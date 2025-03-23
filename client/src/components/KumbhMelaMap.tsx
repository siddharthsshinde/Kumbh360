
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
  // Add extended properties for enhanced visualization
  densityLevel?: number;
  count?: number;
  capacity?: number;
  ratio?: number;
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

  // Enhanced update zones data with real-time crowd information and better color representation
  useEffect(() => {
    if (crowdLevels.length === 0) return;
    
    const updatedZones = baseZones.map(zone => {
      // Find matching crowd level data
      const crowdData = crowdLevels.find(level => level.location === zone.name);
      
      if (crowdData) {
        const crowdRatio = crowdData.currentCount / crowdData.capacity;
        let status = 'Low';
        let densityLevel = 0;
        
        // More granular status classification for better UX
        if (crowdRatio > 0.9) {
          status = 'Critical';
          densityLevel = 5; // Critical level
        } else if (crowdRatio > 0.8) {
          status = 'Very High';
          densityLevel = 4; // Very high level
        } else if (crowdRatio > 0.6) {
          status = 'High';
          densityLevel = 3; // High level
        } else if (crowdRatio > 0.4) {
          status = 'Moderate';
          densityLevel = 2; // Moderate level
        } else if (crowdRatio > 0.2) {
          status = 'Low';
          densityLevel = 1; // Low level
        } else {
          status = 'Very Low';
          densityLevel = 0; // Very low level
        }
        
        return {
          ...zone,
          status,
          crowdDensity: Math.min(1, crowdRatio),
          densityLevel, // Add the density level for more granular color mapping
          count: crowdData.currentCount,
          capacity: crowdData.capacity,
          ratio: crowdRatio
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
                density: zone.crowdDensity,
                densityLevel: zone.densityLevel || 0,
                status: zone.status,
                count: zone.count || 0,
                capacity: zone.capacity || 0
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
    
    console.log('Updated crowd levels visualization with new data', {
      timestamp: new Date().toISOString(),
      zones: updatedZones.map(z => ({ 
        name: z.name, 
        status: z.status, 
        density: Math.round(z.crowdDensity * 100) + '%'
      }))
    });
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

        // Add enhanced zone layer with better color gradient
        map.current.addLayer({
          id: `zone-${index}`,
          type: 'fill',
          source: `zone-${index}`,
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'density'],
              0, '#4ade80',      // Green (very low)
              0.2, '#22c55e',    // Darker green (low)
              0.4, '#f59e0b',    // Yellow (moderate)
              0.6, '#f97316',    // Orange (high)
              0.8, '#ef4444',    // Red (very high)
              0.9, '#b91c1c',    // Dark red (critical)
              1.0, '#7f1d1d'     // Very dark red (extreme)
            ],
            'fill-opacity': 0.7,
            // Add pulsing effect for critical areas
            'fill-opacity-transition': {
              duration: 1000,
              delay: 0
            }
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
      <div className="mt-4">
        {/* Enhanced gradient color legend */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Crowd Density Levels</span>
            <span className="text-xs text-gray-500">Updates every 10 seconds</span>
          </div>
          
          {/* Linear gradient display */}
          <div 
            className="h-4 w-full rounded-md mb-1"
            style={{
              background: 'linear-gradient(to right, #4ade80, #22c55e, #f59e0b, #f97316, #ef4444, #b91c1c, #7f1d1d)'
            }}
          />
          
          {/* Scale markers */}
          <div className="flex justify-between text-xs text-gray-600 px-1">
            <span>0%</span>
            <span>20%</span>
            <span>40%</span>
            <span>60%</span>
            <span>80%</span>
            <span>90%</span>
            <span>100%</span>
          </div>
          
          {/* Status labels */}
          <div className="flex justify-between flex-wrap gap-1 mt-1">
            <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded">Very Low</span>
            <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">Low</span>
            <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded">Moderate</span>
            <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded">High</span>
            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-800 rounded">Very High</span>
            <span className="text-xs px-1.5 py-0.5 bg-red-200 text-red-900 rounded">Critical</span>
            <span className="text-xs px-1.5 py-0.5 bg-red-300 text-red-950 rounded">Extreme</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
