import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, AlertTriangle, Clock, Info } from "lucide-react";
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
    case "crowded":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-500" />;
  }
};

export function CrowdLevelIndicator() {
  const { t } = useTranslation();
  const { data: crowdLevels, isLoading } = useQuery<CrowdLevel[]>({
    queryKey: ["/api/crowd-levels"],
    refetchInterval: 10000, // Refresh every 10 seconds
    refetchOnWindowFocus: true,
  });

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
      
      <div className="divide-y divide-gray-100 flex-grow overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {crowdLevels.map((level) => {
          const crowdPercentage = (level.currentCount / level.capacity) * 100;
          let statusBgColor;
          
          switch(level.status) {
            case "safe": statusBgColor = "bg-green-500"; break;
            case "moderate": statusBgColor = "bg-yellow-500"; break;
            case "crowded": statusBgColor = "bg-orange-500"; break;
            case "overcrowded": statusBgColor = "bg-red-500"; break;
            default: statusBgColor = "bg-gray-500";
          }
          
          return (
            <div key={level.id} className="p-3 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusBgColor}`}></div>
                  <span className="font-medium text-sm">{level.location}</span>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBgColor} text-white`}>
                  {level.status.toUpperCase()}
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
              
              {/* Crowd meter */}
              <div className="space-y-1 mb-2">
                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${statusBgColor} transition-all duration-500 ease-in-out`} 
                    style={{ width: `${crowdPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Current: {level.currentCount.toLocaleString()}</span>
                  <span>Capacity: {level.capacity.toLocaleString()}</span>
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
      </div>
    </Card>
  );
}