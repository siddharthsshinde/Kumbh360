import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, AlertTriangle, Clock, Info, TrendingUp, TrendingDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CrowdLevel } from "@shared/schema";

const getStatusColor = (status: string) => {
  switch (status) {
    case "safe": return "bg-green-500";
    case "moderate": return "bg-yellow-500";
    case "crowded": return "bg-orange-500";
    case "overcrowded": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

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

interface CrowdTrend {
  location: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  previousCount: number;
}

export function CrowdLevelIndicator() {
  const { t } = useTranslation();
  const previousDataRef = useRef<CrowdLevel[]>([]);
  const [trends, setTrends] = useState<Record<string, CrowdTrend>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { data: crowdLevels, isLoading, dataUpdatedAt } = useQuery<CrowdLevel[]>({
    queryKey: ["/api/crowd-levels"],
    refetchInterval: 5000, // Refresh every 5 seconds
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (crowdLevels && previousDataRef.current.length > 0) {
      setIsUpdating(true);
      
      // Calculate trends for each location
      const newTrends: Record<string, CrowdTrend> = {};
      
      crowdLevels.forEach(current => {
        const previous = previousDataRef.current.find(p => p.location === current.location);
        
        if (previous) {
          let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
          
          if (current.currentCount > previous.currentCount) {
            trend = 'increasing';
          } else if (current.currentCount < previous.currentCount) {
            trend = 'decreasing';
          }
          
          newTrends[current.location] = {
            location: current.location,
            trend,
            previousCount: previous.currentCount
          };
        }
      });
      
      setTrends(newTrends);
      
      // Reset update indicator after a short delay
      setTimeout(() => {
        setIsUpdating(false);
      }, 1000);
    }
    
    previousDataRef.current = crowdLevels || [];
  }, [crowdLevels, dataUpdatedAt]);

  if (isLoading) {
    return <Card className="w-full h-48 animate-pulse" />;
  }

  if (!crowdLevels) return null;

  return (
    <Card className={`w-full ${isUpdating ? 'border-blue-500 shadow-blue-100 shadow-lg' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between py-2">
        <Users className={`h-5 w-5 text-[#138808] ${isUpdating ? 'animate-pulse' : ''}`} />
        <span className="font-medium">{t("crowdLevel")}</span>
      </CardHeader>
      <CardContent className="space-y-6">
        {crowdLevels.map((level) => {
          const trend = trends[level.location];
          const percentFull = (level.currentCount / level.capacity) * 100;
          const percentChange = trend ? 
            ((level.currentCount - trend.previousCount) / trend.previousCount * 100).toFixed(1) : null;

          return (
            <div key={level.id} className={`space-y-2 p-2 rounded-lg transition-all duration-300 ${
              isUpdating && trend ? 'bg-gray-50' : ''
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-medium">{level.location}</span>
                <div className="flex items-center gap-2">
                  {trend && trend.trend !== 'stable' && (
                    <span className={`flex items-center text-xs ${
                      trend.trend === 'increasing' ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {trend.trend === 'increasing' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {percentChange}%
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(level.status)} text-white ${
                    isUpdating ? 'animate-pulse' : ''
                  }`}>
                    {level.status.toUpperCase()}
                  </span>
                </div>
              </div>
              {(level.location === "Tapovan" || level.location === "Ramkund") && 
                (level.status === "crowded" || level.status === "overcrowded") && (
                <div className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Hold children's hands tightly in this area
                </div>
              )}
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Current: {level.currentCount.toLocaleString()}</span>
                  <span>Capacity: {level.capacity.toLocaleString()}</span>
                </div>
                <div className="relative pt-1">
                  <Progress 
                    value={percentFull} 
                    className={`${getStatusColor(level.status)} ${
                      isUpdating && trend && trend.trend !== 'stable' ? 'animate-pulse' : ''
                    }`}
                  />
                  {percentFull > 75 && (
                    <span className="absolute right-0 top-0 text-xs text-red-600 font-bold">
                      {percentFull.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
              {getStatusIcon(level.status)}
              <p className={isUpdating ? 'transition-all duration-300' : ''}>
                {level.recommendations}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span className="relative">
                Last updated: {new Date(level.lastUpdated).toLocaleTimeString()}
                <span className={`absolute -left-2 top-1/2 transform -translate-y-1/2 h-2 w-2 ${
                  isUpdating ? 'bg-blue-500 animate-ping' : 'bg-green-500 animate-pulse'
                } rounded-full`}></span>
              </span>
            </div>
          </div>
          );
        })}
      </CardContent>
    </Card>
  );
}