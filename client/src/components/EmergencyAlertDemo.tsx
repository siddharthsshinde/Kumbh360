import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmergencyCrowdAlert } from "@/components/EmergencyCrowdAlert";
import { AlertTriangle, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function EmergencyAlertDemo() {
  const [activeTab, setActiveTab] = useState<string>("sangam");
  const [showSangamAlert, setShowSangamAlert] = useState<boolean>(true);
  const [showAshramAlert, setShowAshramAlert] = useState<boolean>(true);
  const [showImageDialog, setShowImageDialog] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  
  const handleViewImage = (location: string) => {
    setSelectedLocation(location);
    setShowImageDialog(true);
  };
  
  // Function to get the image URL for a location
  const getLocationImage = (location: string) => {
    if (location.includes("Sangam")) {
      // Sangam Area crowd image
      return "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22600%22%20viewBox%3D%220%200%20800%20600%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23f8f9fa%22%2F%3E%3Cpath%20d%3D%22M0%20300%20L800%20280%20L800%20450%20L0%20470%20Z%22%20fill%3D%22%233B82F6%22%20opacity%3D%220.6%22%2F%3E%3Cpath%20d%3D%22M0%20350%20L800%20330%20L800%20500%20L0%20520%20Z%22%20fill%3D%22%232563EB%22%20opacity%3D%220.5%22%2F%3E%3C!--%20Temples%20and%20structures%20--%3E%3Crect%20x%3D%22200%22%20y%3D%22120%22%20width%3D%22100%22%20height%3D%2280%22%20fill%3D%22%23F59E0B%22%20rx%3D%225%22%2F%3E%3Cpath%20d%3D%22M250%2080%20L220%20120%20L280%20120%20Z%22%20fill%3D%22%23B45309%22%2F%3E%3Crect%20x%3D%22500%22%20y%3D%22150%22%20width%3D%22120%22%20height%3D%2250%22%20fill%3D%22%23F59E0B%22%20rx%3D%225%22%2F%3E%3Cpath%20d%3D%22M560%20120%20L530%20150%20L590%20150%20Z%22%20fill%3D%22%23B45309%22%2F%3E%3C!--%20Stairs%20to%20river%20--%3E%3Crect%20x%3D%22100%22%20y%3D%22200%22%20width%3D%22600%22%20height%3D%225%22%20fill%3D%22%23D1D5DB%22%2F%3E%3Crect%20x%3D%22100%22%20y%3D%22210%22%20width%3D%22600%22%20height%3D%225%22%20fill%3D%22%23E5E7EB%22%2F%3E%3Crect%20x%3D%22100%22%20y%3D%22220%22%20width%3D%22600%22%20height%3D%225%22%20fill%3D%22%23D1D5DB%22%2F%3E%3Crect%20x%3D%22100%22%20y%3D%22230%22%20width%3D%22600%22%20height%3D%225%22%20fill%3D%22%23E5E7EB%22%2F%3E%3Crect%20x%3D%22100%22%20y%3D%22240%22%20width%3D%22600%22%20height%3D%225%22%20fill%3D%22%23D1D5DB%22%2F%3E%3Crect%20x%3D%22100%22%20y%3D%22250%22%20width%3D%22600%22%20height%3D%225%22%20fill%3D%22%23E5E7EB%22%2F%3E%3Crect%20x%3D%22100%22%20y%3D%22260%22%20width%3D%22600%22%20height%3D%225%22%20fill%3D%22%23D1D5DB%22%2F%3E%3Crect%20x%3D%22100%22%20y%3D%22270%22%20width%3D%22600%22%20height%3D%225%22%20fill%3D%22%23E5E7EB%22%2F%3E%3C!--%20Crowd%20of%20people%20--%3E%3C!--%20Row%201%20--%3E%3Ccircle%20cx%3D%22120%22%20cy%3D%22200%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22140%22%20cy%3D%22192%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22160%22%20cy%3D%22198%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22180%22%20cy%3D%22194%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22199%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22220%22%20cy%3D%22194%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22240%22%20cy%3D%22196%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22198%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22280%22%20cy%3D%22192%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3C!--%20Row%202%20--%3E%3Ccircle%20cx%3D%22130%22%20cy%3D%22218%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22150%22%20cy%3D%22214%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22170%22%20cy%3D%22218%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22190%22%20cy%3D%22216%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22210%22%20cy%3D%22219%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22230%22%20cy%3D%22216%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22250%22%20cy%3D%22219%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22270%22%20cy%3D%22217%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3C!--%20More%20rows%20of%20people%20--%3E%3Ccircle%20cx%3D%22140%22%20cy%3D%22236%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22160%22%20cy%3D%22236%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22180%22%20cy%3D%22236%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22236%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22220%22%20cy%3D%22236%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22240%22%20cy%3D%22236%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22260%22%20cy%3D%22236%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3C!--%20Emergency%20Indicators%20--%3E%3Cg%20class%3D%22emergency-indicator%22%3E%3Ccircle%20cx%3D%22650%22%20cy%3D%2250%22%20r%3D%2225%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%3E%3Canimate%20attributeName%3D%22opacity%22%20values%3D%220.9%3B0.3%3B0.9%22%20dur%3D%222s%22%20repeatCount%3D%22indefinite%22%20%2F%3E%3C%2Fcircle%3E%3Ctext%20x%3D%22650%22%20y%3D%2255%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%20font-weight%3D%22bold%22%3E!%3C%2Ftext%3E%3C%2Fg%3E%3Ctext%20x%3D%22400%22%20y%3D%2240%22%20text-anchor%3D%22middle%22%20fill%3D%22%23111827%22%20font-weight%3D%22bold%22%20font-size%3D%2224%22%3ESangam%20Area%20Crowd%20Situation%3C%2Ftext%3E%3Ctext%20x%3D%22400%22%20y%3D%2270%22%20text-anchor%3D%22middle%22%20fill%3D%22%23EF4444%22%20font-weight%3D%22bold%22%20font-size%3D%2216%22%3ECRITICAL%20CROWD%20LEVEL%20DETECTED%3C%2Ftext%3E%3Ctext%20x%3D%22400%22%20y%3D%22560%22%20text-anchor%3D%22middle%22%20fill%3D%22%23111827%22%20font-size%3D%2214%22%3ECurrent%20Capacity%3A%2095%25%20%7C%20Use%20Alternative%20Routes%3C%2Ftext%3E%3C%2Fsvg%3E";
    } else if (location.includes("Ashram")) {
      // Nashik Ashram crowd image
      return "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22600%22%20viewBox%3D%220%200%20800%20600%22%20fill%3D%22none%22%3E%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23f8f9fa%22%2F%3E%3C!--%20Ashram%20Buildings%20--%3E%3Crect%20x%3D%22200%22%20y%3D%22100%22%20width%3D%22400%22%20height%3D%22200%22%20fill%3D%22%23F3F4F6%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%2F%3E%3C!--%20Ashram%20Dome%20--%3E%3Cellipse%20cx%3D%22400%22%20cy%3D%22100%22%20rx%3D%2280%22%20ry%3D%2250%22%20fill%3D%22%23F59E0B%22%2F%3E%3C!--%20Entrance%20--%3E%3Crect%20x%3D%22350%22%20y%3D%22230%22%20width%3D%22100%22%20height%3D%2270%22%20fill%3D%22%239CA3AF%22%2F%3E%3C!--%20Steps%20--%3E%3Crect%20x%3D%22350%22%20y%3D%22300%22%20width%3D%22100%22%20height%3D%2210%22%20fill%3D%22%23E5E7EB%22%2F%3E%3Crect%20x%3D%22350%22%20y%3D%22310%22%20width%3D%22100%22%20height%3D%2210%22%20fill%3D%22%23D1D5DB%22%2F%3E%3Crect%20x%3D%22350%22%20y%3D%22320%22%20width%3D%22100%22%20height%3D%2210%22%20fill%3D%22%23E5E7EB%22%2F%3E%3C!--%20Windows%20--%3E%3Crect%20x%3D%22230%22%20y%3D%22140%22%20width%3D%2240%22%20height%3D%2240%22%20fill%3D%22%23A5F3FC%22%20opacity%3D%220.7%22%2F%3E%3Crect%20x%3D%22290%22%20y%3D%22140%22%20width%3D%2240%22%20height%3D%2240%22%20fill%3D%22%23A5F3FC%22%20opacity%3D%220.7%22%2F%3E%3Crect%20x%3D%22470%22%20y%3D%22140%22%20width%3D%2240%22%20height%3D%2240%22%20fill%3D%22%23A5F3FC%22%20opacity%3D%220.7%22%2F%3E%3Crect%20x%3D%22530%22%20y%3D%22140%22%20width%3D%2240%22%20height%3D%2240%22%20fill%3D%22%23A5F3FC%22%20opacity%3D%220.7%22%2F%3E%3C!--%20Crowd%20of%20people%20at%20entrance%20--%3E%3C!--%20Row%201%20--%3E%3Ccircle%20cx%3D%22350%22%20cy%3D%22340%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22366%22%20cy%3D%22340%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22382%22%20cy%3D%22340%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22398%22%20cy%3D%22340%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22414%22%20cy%3D%22340%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22430%22%20cy%3D%22340%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22446%22%20cy%3D%22340%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3C!--%20Row%202%20--%3E%3Ccircle%20cx%3D%22358%22%20cy%3D%22356%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22374%22%20cy%3D%22356%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22390%22%20cy%3D%22356%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22406%22%20cy%3D%22356%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22422%22%20cy%3D%22356%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22438%22%20cy%3D%22356%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3C!--%20Row%203%20--%3E%3Ccircle%20cx%3D%22354%22%20cy%3D%22372%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22370%22%20cy%3D%22372%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22386%22%20cy%3D%22372%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22402%22%20cy%3D%22372%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22418%22%20cy%3D%22372%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22434%22%20cy%3D%22372%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3C!--%20Row%204%20--%3E%3Ccircle%20cx%3D%22362%22%20cy%3D%22388%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22378%22%20cy%3D%22388%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22394%22%20cy%3D%22388%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22410%22%20cy%3D%22388%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22426%22%20cy%3D%22388%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3C!--%20Row%205%20--%3E%3Ccircle%20cx%3D%22358%22%20cy%3D%22404%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22374%22%20cy%3D%22404%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22390%22%20cy%3D%22404%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22406%22%20cy%3D%22404%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%22422%22%20cy%3D%22404%22%20r%3D%228%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%2F%3E%3C!--%20Emergency%20Indicators%20--%3E%3Cg%20class%3D%22emergency-indicator%22%3E%3Ccircle%20cx%3D%22650%22%20cy%3D%2250%22%20r%3D%2225%22%20fill%3D%22%23EF4444%22%20opacity%3D%220.9%22%3E%3Canimate%20attributeName%3D%22opacity%22%20values%3D%220.9%3B0.3%3B0.9%22%20dur%3D%222s%22%20repeatCount%3D%22indefinite%22%20%2F%3E%3C%2Fcircle%3E%3Ctext%20x%3D%22650%22%20y%3D%2255%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%20font-weight%3D%22bold%22%3E!%3C%2Ftext%3E%3C%2Fg%3E%3C!--%20Emergency%20Personnel%20--%3E%3Ccircle%20cx%3D%22300%22%20cy%3D%22380%22%20r%3D%2210%22%20fill%3D%22%2310B981%22%2F%3E%3Ccircle%20cx%3D%22480%22%20cy%3D%22380%22%20r%3D%2210%22%20fill%3D%22%2310B981%22%2F%3E%3Ctext%20x%3D%22400%22%20y%3D%2240%22%20text-anchor%3D%22middle%22%20fill%3D%22%23111827%22%20font-weight%3D%22bold%22%20font-size%3D%2224%22%3ENashik%20Ashram%20Crowd%20Situation%3C%2Ftext%3E%3Ctext%20x%3D%22400%22%20y%3D%2270%22%20text-anchor%3D%22middle%22%20fill%3D%22%23EF4444%22%20font-weight%3D%22bold%22%20font-size%3D%2216%22%3ECRITICAL%20CROWD%20LEVEL%20DETECTED%3C%2Ftext%3E%3Ctext%20x%3D%22400%22%20y%3D%22560%22%20text-anchor%3D%22middle%22%20fill%3D%22%23111827%22%20font-size%3D%2214%22%3ECurrent%20Capacity%3A%2095%25%20%7C%20North%20Gate%20Exit%20Only%3C%2Ftext%3E%3C%2Fsvg%3E";
    } else {
      return "";
    }
  };

  // Get location-specific details
  const getLocationDetails = (location: string) => {
    if (location.includes("Sangam")) {
      return {
        title: "Sangam Area, Nashik",
        description: "Confluence of three rivers, a highly sacred bathing site where large crowds gather for rituals.",
        status: "CRITICAL CROWD LEVEL",
        evacuationDetails: "Use eastern exit routes toward Ramkund Road. Emergency personnel stationed at all exits."
      };
    } else if (location.includes("Ashram")) {
      return {
        title: "Nashik Ashram",
        description: "Large spiritual center hosting special ceremonies during Kumbh Mela.",
        status: "CRITICAL CROWD LEVEL",
        evacuationDetails: "North gate exit only. Follow green emergency lights to evacuation points."
      };
    } else {
      return {
        title: "Unknown Location",
        description: "Location details not available",
        status: "Status unknown",
        evacuationDetails: "Follow official guidance"
      };
    }
  };

  return (
    <>
      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#FF7F00] flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Crowd Alerts
          </h2>
        </div>
        
        <Tabs defaultValue="sangam" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sangam" className="relative">
              Sangam Area
              {showSangamAlert && (
                <span className="absolute top-0 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="ashram" className="relative">
              Nashik Ashram
              {showAshramAlert && (
                <span className="absolute top-0 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sangam" className="space-y-4 pt-4">
            {showSangamAlert ? (
              <>
                <EmergencyCrowdAlert 
                  location="Sangam Area, Nashik"
                  timestamp={new Date().toISOString()}
                  capacity={15000}
                  currentCount={14250}
                  alertLevel="critical"
                  message="Critical overcrowding at Sangam Area. Emergency services have been deployed. Please avoid this area and follow official instructions."
                />
                
                <div className="flex justify-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewImage("Sangam Area")}
                    className="flex items-center gap-1"
                  >
                    <Info className="h-4 w-4" />
                    View Current Situation
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowSangamAlert(false)}
                    className="flex items-center gap-1"
                  >
                    Dismiss Alert
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-gray-500 space-y-3">
                <p>Alert dismissed</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSangamAlert(true)}
                >
                  Restore Alert
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ashram" className="space-y-4 pt-4">
            {showAshramAlert ? (
              <>
                <EmergencyCrowdAlert 
                  location="Nashik Ashram"
                  timestamp={new Date().toISOString()}
                  capacity={8000}
                  currentCount={7600}
                  alertLevel="critical"
                  message="Critical overcrowding at Nashik Ashram. Special event attendees should use North gate exit only. Emergency personnel are on site."
                />
                
                <div className="flex justify-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewImage("Nashik Ashram")}
                    className="flex items-center gap-1"
                  >
                    <Info className="h-4 w-4" />
                    View Current Situation
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAshramAlert(false)}
                    className="flex items-center gap-1"
                  >
                    Dismiss Alert
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-gray-500 space-y-3">
                <p>Alert dismissed</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAshramAlert(true)}
                >
                  Restore Alert
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="text-sm text-gray-500 border-t pt-3 mt-3">
          These emergency alerts are generated based on real-time crowd density data and are updated every 2 minutes. 
          Critical alerts are automatically displayed when crowd density exceeds 90% of maximum capacity.
        </div>
      </Card>
      
      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {getLocationDetails(selectedLocation).title} - Current Situation
            </DialogTitle>
            <DialogDescription>
              {getLocationDetails(selectedLocation).description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Live crowd image */}
            <div className="rounded-md overflow-hidden border">
              <img
                src={getLocationImage(selectedLocation)}
                alt={`Emergency crowd situation at ${selectedLocation}`}
                className="w-full h-auto"
              />
            </div>
            
            {/* Status information */}
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <h4 className="font-bold text-red-700">{getLocationDetails(selectedLocation).status}</h4>
              <p className="text-sm mt-1">
                {getLocationDetails(selectedLocation).evacuationDetails}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowImageDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}