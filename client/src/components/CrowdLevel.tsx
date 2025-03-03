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
    return <Card className="w-full h-48 animate-pulse" />;
  }

  if (!crowdLevels) return null;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between py-2">
        <Users className="h-5 w-5 text-[#138808]" />
        <span className="font-medium">{t("crowdLevel")}</span>
      </CardHeader>
      <CardContent className="space-y-6">
        {crowdLevels.map((level) => (
          <div key={level.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{level.location}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(level.status)} text-white`}>
                {level.status.toUpperCase()}
              </span>
            </div>
            {(level.location === "Tapovan" || level.location === "Ramkund") && level.status === "crowded" && (
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
              <Progress 
                value={(level.currentCount / level.capacity) * 100} 
                className={getStatusColor(level.status)}
              />
            </div>
            <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
              {getStatusIcon(level.status)}
              <p>{level.recommendations}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span className="relative">
                Last updated: {new Date(level.lastUpdated).toLocaleTimeString()}
                <span className="absolute -left-2 top-1/2 transform -translate-y-1/2 h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}