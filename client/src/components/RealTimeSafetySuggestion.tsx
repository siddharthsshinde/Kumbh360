
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function RealTimeSafetySuggestion() {
  const { t } = useTranslation();
  const [suggestion, setSuggestion] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Suggestions for child safety in crowded areas
  const suggestions = [
    "⚠️ Tapovan is currently crowded. Hold children's hands tightly.",
    "⚠️ Crowd alert: Maintain physical contact with children at all times.",
    "⚠️ Safety tip: Use child identification wristbands available at info kiosks.",
    "⚠️ High crowd density at Ramkund. Keep children close to you.",
    "⚠️ Take a photo of your child each day to remember their clothing.",
  ];

  // Simulate real-time suggestions
  useEffect(() => {
    // Show suggestion after 5 seconds
    const timer = setTimeout(() => {
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      setSuggestion(randomSuggestion);
      setIsVisible(true);
    }, 5000);

    // Hide after 10 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 15000);

    // Set up periodic suggestions
    const intervalTimer = setInterval(() => {
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      setSuggestion(randomSuggestion);
      setIsVisible(true);
      
      // Hide after 10 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 10000);
    }, 45000); // Show a new suggestion every 45 seconds

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <Card className="w-full bg-amber-50 border-amber-300 mb-4 animate-pulse">
      <CardContent className="p-3 flex items-center space-x-2">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
        <span className="text-amber-800 text-sm font-medium">{suggestion}</span>
      </CardContent>
    </Card>
  );
}
