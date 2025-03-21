import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Users, AlertTriangle, Clock, Info, ChevronUp, ChevronDown, 
  Minus, Calendar, Activity 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CrowdLevel } from "@shared/schema";

type TrendDirection = "increasing" | "decreasing" | "stable";
type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

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

// Get time of day
const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 16) return "afternoon";
  if (hour >= 16 && hour < 20) return "evening";
  return "night";
};

// Get estimated average wait time based on crowd percentage
const getEstimatedWaitTime = (percentage: number): string => {
  if (percentage > 90) return "60+ min";
  if (percentage > 75) return "45-60 min";
  if (percentage > 60) return "30-45 min";
  if (percentage > 40) return "15-30 min";
  if (percentage > 20) return "5-15 min";
  return "< 5 min";
};

export function CrowdLevelIndicator() {
  const { t } = useTranslation();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  const { data: crowdLevels, isLoading } = useQuery<CrowdLevel[]>({
    queryKey: ["/api/crowd-levels"],
    refetchInterval: 10000, // Refresh every 10 seconds
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (crowdLevels) {
      setLastRefreshed(new Date());
    }
  }, [crowdLevels]);

  // Get current hour for forecasting
  const currentHour = new Date().getHours();
  const currentTimeOfDay = getTimeOfDay(currentHour);

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

  return (
    <Card className="w-full h-full overflow-hidden shadow-md border-none flex flex-col">
      <div className="bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#000080]" />
            <h3 className="font-semibold text-[#000080]">{t("Live Crowd Status")}</h3>
          </div>
          <div className="flex items-center gap-1 bg-[#000080]/10 px-2 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9933] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF9933]"></span>
            </span>
            <span className="text-xs text-[#000080] font-medium">Live</span>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100 flex-grow overflow-y-auto bg-white" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {crowdLevels.map((level) => {
          // Calculate crowd percentage with safety checks
          const crowdPercentage = level.currentCount && level.capacity
            ? Math.min((level.currentCount / level.capacity) * 100, 100) // Cap at 100%
            : 0;
            
          const trend = getEstimatedTrend(level.location, currentHour);
          const statusBgColor = getStatusColor(level.status);
          const statusTextColor = getStatusTextColor(level.status);
          
          return (
            <div key={level.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusBgColor} ring-2 ring-opacity-30 ring-offset-1 ${statusBgColor}`}></div>
                  <span className="font-bold text-gray-800">{level.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon(trend)}
                    <span className={`text-xs ${statusTextColor}`}>
                      {trend === "increasing" ? "Rising" : trend === "decreasing" ? "Falling" : "Stable"}
                    </span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusBgColor} text-white ml-1`}>
                    {level.status.toUpperCase()}
                  </div>
                </div>
              </div>
              
              {/* Critical warning for crowded areas with children */}
              {(level.location === "Tapovan" || level.location === "Ramkund") && 
               (level.status === "crowded" || level.status === "overcrowded") && (
                <div className="mb-3 p-2 bg-red-50 border-l-3 border-red-500 text-xs text-red-700 flex items-center rounded-r-sm shadow-sm">
                  <AlertTriangle className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                  <span className="font-medium">Hold children's hands tightly in this area</span>
                </div>
              )}
              
              {/* Crowd meter with capacity info */}
              <div className="bg-gray-50 p-3 rounded-lg mb-3 shadow-sm">
                <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    <span className="font-medium">Crowd Level:</span>
                  </div>
                  <div className="font-bold">{Math.round(crowdPercentage)}% Full</div>
                </div>
                
                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full ${statusBgColor} transition-all duration-500 ease-in-out`} 
                    style={{ 
                      width: `${crowdPercentage}%`,
                      backgroundImage: crowdPercentage > 75 ? 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)' : 'none'
                    }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-white p-2 rounded shadow-sm border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Current crowd</div>
                    <div className="text-sm font-bold text-gray-800">
                      {level.currentCount.toLocaleString()}
                      <span className="text-xs text-gray-500 ml-1">people</span>
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Capacity</div>
                    <div className="text-sm font-bold text-gray-800">
                      {level.capacity.toLocaleString()}
                      <span className="text-xs text-gray-500 ml-1">max</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Wait time */}
              <div className="flex items-center gap-2 mb-3 bg-blue-50 p-2 rounded-md">
                <Clock className="h-4 w-4 text-blue-500" />
                <div className="text-sm">
                  <span className="font-medium text-blue-700">Estimated wait:</span>
                  <span className="ml-1 font-bold text-blue-800">{getEstimatedWaitTime(crowdPercentage)}</span>
                </div>
              </div>
              
              {/* Recommendations */}
              <div className="flex items-start gap-2 text-xs text-gray-700 mb-2 bg-gray-50 p-2 rounded-md">
                {getStatusIcon(level.status)}
                <p className="leading-tight font-medium">{level.recommendations}</p>
              </div>
              
              {/* Last updated timestamp */}
              <div className="flex items-center gap-1 text-xs text-gray-400 justify-end">
                <Clock className="h-3 w-3" />
                <span>
                  Updated at {new Date(level.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          );
        })}
        <div className="p-2 text-xs text-center text-gray-500 bg-gray-50 font-medium">
          Last refreshed: {lastRefreshed.toLocaleTimeString()}
        </div>
      </div>
    </Card>
  );
}