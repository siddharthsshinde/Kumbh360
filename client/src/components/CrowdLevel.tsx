import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Users, AlertTriangle, Clock, Info, ChevronUp, ChevronDown, 
  Minus, Calendar, ArrowRight, MapPin, BarChart
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CrowdLevel } from "@shared/schema";
import { Button } from "@/components/ui/button";

type TrendDirection = "increasing" | "decreasing" | "stable";
type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

interface CrowdForecast {
  hour: number;
  percentage: number;
  status: string;
}

// Function to get status color class
const getStatusColor = (status: string) => {
  switch (status) {
    case "safe": return "bg-green-500";
    case "moderate": return "bg-yellow-500";
    case "crowded": return "bg-orange-500";
    case "overcrowded": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

// Function to get status text color class
const getStatusTextColor = (status: string) => {
  switch (status) {
    case "safe": return "text-green-500";
    case "moderate": return "text-yellow-500";
    case "crowded": return "text-orange-500";
    case "overcrowded": return "text-red-500";
    default: return "text-gray-500";
  }
};

// Function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "overcrowded":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "crowded":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case "moderate":
      return <Info className="h-4 w-4 text-yellow-500" />;
    case "safe":
      return <Info className="h-4 w-4 text-green-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-500" />;
  }
};

// Function to get trend icon
const getTrendIcon = (trend: TrendDirection) => {
  switch (trend) {
    case "increasing":
      return <ChevronUp className="h-4 w-4 text-red-500" />;
    case "decreasing":
      return <ChevronDown className="h-4 w-4 text-green-500" />;
    case "stable":
      return <Minus className="h-4 w-4 text-gray-500" />;
    default:
      return null;
  }
};

// Get estimated trend based on time of day and location
const getEstimatedTrend = (location: string, currentHour: number): TrendDirection => {
  // Morning rush hour trend (6 AM - 9 AM)
  if (currentHour >= 6 && currentHour < 9) {
    if (location === "Ramkund" || location === "Godavari Ghat") {
      return "increasing";
    }
  }
  
  // Midday trend (11 AM - 2 PM)
  if (currentHour >= 11 && currentHour < 14) {
    if (location === "Kalaram Temple") {
      return "increasing";
    }
    if (location === "Ramkund") {
      return "decreasing";
    }
  }
  
  // Evening trend (4 PM - 7 PM)
  if (currentHour >= 16 && currentHour < 19) {
    if (location === "Godavari Ghat" || location === "Ramkund") {
      return "increasing";
    }
    if (location === "Tapovan") {
      return "decreasing";
    }
  }
  
  // Night trend (after 7 PM)
  if (currentHour >= 19 || currentHour < 5) {
    return "decreasing";
  }
  
  return "stable";
};

// Generate crowd forecast for next few hours based on current crowd level and time of day
const generateHourlyForecast = (level: CrowdLevel, currentHour: number): CrowdForecast[] => {
  const forecasts: CrowdForecast[] = [];
  const trend = getEstimatedTrend(level.location, currentHour);
  const currentPercentage = level.currentCount / level.capacity * 100;
  
  // Generate forecasts for the next 6 hours
  for (let i = 1; i <= 6; i++) {
    const hour = (currentHour + i) % 24;
    let percentage = currentPercentage;
    
    // Apply trend-based adjustments
    if (trend === "increasing") {
      percentage += (5 * i); // Increase by 5% per hour
    } else if (trend === "decreasing") {
      percentage -= (7 * i); // Decrease by 7% per hour
    } else {
      // If stable, add some minor fluctuations
      percentage += (Math.random() * 6 - 3);
    }
    
    // Apply time-of-day adjustments
    if (hour >= 6 && hour < 9) { // Morning rush
      percentage += 10;
    } else if (hour >= 16 && hour < 19) { // Evening rush
      percentage += 15;
    } else if (hour >= 22 || hour < 5) { // Late night
      percentage -= 20;
    }
    
    // Cap percentage between 0 and 100
    percentage = Math.max(0, Math.min(100, percentage));
    
    // Determine status based on percentage
    let status = "safe";
    if (percentage > 85) status = "overcrowded";
    else if (percentage > 65) status = "crowded";
    else if (percentage > 35) status = "moderate";
    
    forecasts.push({ hour, percentage, status });
  }
  
  return forecasts;
};

// Get time of day
const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 16) return "afternoon";
  if (hour >= 16 && hour < 20) return "evening";
  return "night";
};

// Get best time suggestion based on forecasts
const getBestTimeSuggestion = (forecasts: CrowdForecast[]): string => {
  const bestTimeIndex = forecasts.findIndex(f => f.status === "safe" || f.status === "moderate");
  
  if (bestTimeIndex !== -1) {
    const bestTime = forecasts[bestTimeIndex];
    const hourFormatted = bestTime.hour % 12 || 12;
    const ampm = bestTime.hour >= 12 ? "PM" : "AM";
    return `Best time to visit: around ${hourFormatted} ${ampm}`;
  }
  
  return "Consider visiting another day or early morning";
};

export function CrowdLevelIndicator() {
  const { t } = useTranslation();
  const [selectedView, setSelectedView] = useState<"list" | "details">("list");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  const { data: crowdLevels, isLoading, refetch } = useQuery<CrowdLevel[]>({
    queryKey: ["/api/crowd-levels"],
    refetchInterval: 10000, // Refresh every 10 seconds
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (crowdLevels && crowdLevels.length > 0 && !selectedLocation) {
      // Select the first location by default
      setSelectedLocation(crowdLevels[0].location);
    }
    
    if (crowdLevels) {
      setLastRefreshed(new Date());
    }
  }, [crowdLevels]);

  // Get current hour for forecasting
  const currentHour = new Date().getHours();
  const currentTimeOfDay = getTimeOfDay(currentHour);
  
  // Generate forecasts for the selected location
  const selectedLocationForecasts = useMemo(() => {
    if (!crowdLevels || !selectedLocation) return [];
    
    const selectedLevel = crowdLevels.find(level => level.location === selectedLocation);
    if (!selectedLevel) return [];
    
    return generateHourlyForecast(selectedLevel, currentHour);
  }, [crowdLevels, selectedLocation, currentHour]);
  
  // Get estimated average wait time based on crowd percentage
  const getEstimatedWaitTime = (percentage: number): string => {
    if (percentage > 90) return "60+ min";
    if (percentage > 75) return "45-60 min";
    if (percentage > 60) return "30-45 min";
    if (percentage > 40) return "15-30 min";
    if (percentage > 20) return "5-15 min";
    return "< 5 min";
  };

  if (isLoading) {
    return (
      <Card className="w-full overflow-hidden shadow-md border-none">
        <div className="bg-gray-100 p-4 h-48 animate-pulse flex items-center justify-center">
          <span className="text-gray-400">Loading crowd data...</span>
        </div>
      </Card>
    );
  }

  if (!crowdLevels) return null;

  // Find the selected location data
  const selectedData = selectedLocation 
    ? crowdLevels.find(level => level.location === selectedLocation) 
    : null;
    


  return (
    <Card className="w-full h-full overflow-hidden shadow-md border-none card-hover flex flex-col">
      <div className="bg-gradient-to-r from-[#138808]/80 to-[#138808]/90 p-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h3 className="font-semibold">{t("Live Crowd Status")}</h3>
          </div>
          <div className="flex items-center text-xs gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>Live Updates</span>
          </div>
        </div>
      </div>
      
      {/* Tab navigation for view modes */}
      <div className="border-b">
        <div className="flex w-full">
          <button 
            className={`flex-1 py-2 text-sm font-medium ${selectedView === 'list' ? 'border-b-2 border-[#138808] text-[#138808]' : 'text-gray-500'}`}
            onClick={() => setSelectedView("list")}
          >
            List View
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium ${selectedView === 'details' ? 'border-b-2 border-[#138808] text-[#138808]' : 'text-gray-500'}`}
            onClick={() => setSelectedView("details")}
          >
            Detailed View
          </button>
        </div>
      </div>
      
      {/* List view (shows all locations) */}
      {selectedView === "list" && (
        <div className="divide-y divide-gray-100 flex-grow overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {crowdLevels.map((level) => {
            // Calculate crowd percentage with safety checks
            const crowdPercentage = level.currentCount && level.capacity
              ? Math.min((level.currentCount / level.capacity) * 100, 100) // Cap at 100%
              : 0;
              
            const trend = getEstimatedTrend(level.location, currentHour);
            const statusBgColor = getStatusColor(level.status);
            const statusTextColor = getStatusTextColor(level.status);
            
            return (
              <div 
                key={level.id} 
                className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedLocation(level.location);
                  setSelectedView("details");
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusBgColor}`}></div>
                    <span className="font-medium text-sm">{level.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(trend)}
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBgColor} text-white`}>
                      {level.status.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                {/* Critical warning for crowded areas with children */}
                {(level.location === "Tapovan" || level.location === "Ramkund") && 
                 (level.status === "crowded" || level.status === "overcrowded") && (
                  <div className="mb-2 p-1.5 bg-red-50 border-l-2 border-red-500 text-xs text-red-700 flex items-center rounded-r-sm">
                    <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>Hold children's hands tightly in this area</span>
                  </div>
                )}
                
                {/* Crowd meter with trend indicator */}
                <div className="space-y-1 mb-2">
                  <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${statusBgColor} transition-all duration-500 ease-in-out`} 
                      style={{ width: `${crowdPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Current: {level.currentCount ? level.currentCount.toLocaleString() : 'N/A'}</span>
                    <span>Est. Wait: {getEstimatedWaitTime(crowdPercentage)}</span>
                  </div>
                </div>
                
                {/* Recommendations */}
                <div className="flex items-start gap-2 text-xs text-gray-600 mb-1">
                  {getStatusIcon(level.status)}
                  <p className="leading-tight">{level.recommendations}</p>
                </div>
                
                {/* Last updated timestamp */}
                <div className="flex items-center gap-1 text-xs text-gray-400 justify-end">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(level.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            );
          })}
          <div className="p-2 text-xs text-center text-gray-400">
            Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </div>
        </div>
      )}
      
      {/* Detailed view (shows selected location with forecasts) */}
      {selectedView === "details" && selectedData && (
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {/* Location header with back button */}
          <div className="p-3 border-b flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs flex items-center gap-1 px-2 py-1" 
              onClick={() => setSelectedView("list")}
            >
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              <span>Back to list</span>
            </Button>
            <span className="text-sm font-medium">{selectedData.location}</span>
          </div>
          
          {/* Current status card */}
          <div className="p-4">
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#138808]" />
                  <h4 className="font-medium">{selectedData.location}</h4>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedData.status)} text-white`}>
                  {selectedData.status.toUpperCase()}
                </div>
              </div>
              
              {/* Current crowd metrics */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-white p-2 rounded shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">Current crowd</div>
                  <div className="text-lg font-bold">
                    {selectedData.currentCount.toLocaleString()}
                    <span className="text-xs text-gray-500 ml-1">people</span>
                  </div>
                </div>
                <div className="bg-white p-2 rounded shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">Capacity</div>
                  <div className="text-lg font-bold">
                    {selectedData.capacity.toLocaleString()}
                    <span className="text-xs text-gray-500 ml-1">max</span>
                  </div>
                </div>
              </div>
              
              {/* Crowd percentage bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Occupancy</span>
                  <span>
                    {Math.round((selectedData.currentCount / selectedData.capacity) * 100)}%
                  </span>
                </div>
                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getStatusColor(selectedData.status)} transition-all duration-500 ease-in-out`} 
                    style={{ width: `${Math.min((selectedData.currentCount / selectedData.capacity) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Wait time estimate */}
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-medium">Estimated wait time:</span>
                <span className="font-bold">
                  {getEstimatedWaitTime(Math.min((selectedData.currentCount / selectedData.capacity) * 100, 100))}
                </span>
              </div>
              
              {/* Critical warnings if needed */}
              {(selectedData.location === "Tapovan" || selectedData.location === "Ramkund") && 
               (selectedData.status === "crowded" || selectedData.status === "overcrowded") && (
                <div className="mb-3 p-2 bg-red-50 border-l-2 border-red-500 text-sm text-red-700 flex items-center rounded-r-sm">
                  <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Safety Alert</p>
                    <p className="text-xs">Hold children's hands tightly and be aware of your surroundings</p>
                  </div>
                </div>
              )}
              
              {/* Trend indicator */}
              <div className="text-sm flex items-center gap-1 mb-2">
                <span className="font-medium">Current trend:</span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(getEstimatedTrend(selectedData.location, currentHour))}
                  <span className={getStatusTextColor(selectedData.status)}>
                    {getEstimatedTrend(selectedData.location, currentHour) === "increasing" ? "Filling up" : 
                     getEstimatedTrend(selectedData.location, currentHour) === "decreasing" ? "Clearing out" : "Stable"}
                  </span>
                </div>
              </div>
              
              {/* Recommendations */}
              <div className="bg-blue-50 p-2 rounded-sm border border-blue-100 text-sm text-blue-800 flex items-start gap-2 mb-3">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                <div>
                  <p className="font-medium">Recommendation</p>
                  <p className="text-xs">{selectedData.recommendations}</p>
                  <p className="text-xs font-medium mt-1">{getBestTimeSuggestion(selectedLocationForecasts)}</p>
                </div>
              </div>
              
              {/* Last updated timestamp */}
              <div className="flex items-center gap-1 text-xs text-gray-400 justify-end">
                <Clock className="h-3 w-3" />
                <span>
                  {new Date(selectedData.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
            
            {/* Forecast section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-[#138808]" />
                <h4 className="text-sm font-medium">Crowd Forecast</h4>
              </div>
              
              <div className="space-y-3">
                {selectedLocationForecasts.map((forecast, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(forecast.status)}`}></div>
                      <span className="text-sm">
                        {forecast.hour % 12 || 12} {forecast.hour >= 12 ? "PM" : "AM"}
                      </span>
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getStatusColor(forecast.status)}`} 
                          style={{ width: `${forecast.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-xs ${getStatusTextColor(forecast.status)}`}>
                      {Math.round(forecast.percentage)}%
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-xs text-center text-gray-400 italic">
                Forecasts based on historical patterns and current trends
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}