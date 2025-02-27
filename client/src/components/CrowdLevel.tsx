import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CrowdLevel } from "@shared/schema";

export function CrowdLevelIndicator() {
  const { t } = useTranslation();
  const { data: crowdLevels } = useQuery<CrowdLevel[]>({
    queryKey: ["/api/crowd-levels"],
  });

  if (!crowdLevels) return null;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between py-2">
        <Users className="h-5 w-5 text-[#138808]" />
        <span className="font-medium">{t("crowdLevel")}</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {crowdLevels.map((level) => (
          <div key={level.id} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>{level.location}</span>
              <span>{level.level}/5</span>
            </div>
            <Progress value={(level.level / 5) * 100} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
