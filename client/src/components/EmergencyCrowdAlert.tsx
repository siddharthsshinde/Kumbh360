import { useState, useEffect } from "react";
import { AlertTriangle, MapPin, Users, ArrowRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { DialogContent, Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// SVG emergency crowd visualization component
const CrowdVisualizationSVG = ({ location }: { location: string }) => {
  // Generate a location-specific SVG crowd visualization
  return (
    <svg
      width="100%"
      height="180"
      viewBox="0 0 400 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mb-2"
    >
      {/* Background with location-specific elements */}
      <rect width="400" height="180" fill="#FEE2E2" rx="4" />
      
      {/* Location-specific elements */}
      {location.includes("Sangam") && (
        <>
          {/* River shapes for Sangam area */}
          <path d="M0 80 L400 65 L400 110 L0 125 Z" fill="#3B82F6" opacity="0.6" />
          <path d="M0 100 L400 90 L400 140 L0 150 Z" fill="#2563EB" opacity="0.5" />
          
          {/* Crowd dots in critical areas */}
          {[...Array(80)].map((_, i) => (
            <circle 
              key={`crowd-dot-${i}`} 
              cx={50 + Math.random() * 300} 
              cy={40 + Math.random() * 40} 
              r={2 + Math.random() * 3}
              fill="#EF4444"
              opacity={0.8 + Math.random() * 0.2}
            />
          ))}
          
          {/* Key landmarks */}
          <rect x="100" y="20" width="40" height="20" fill="#FB923C" rx="2" />
          <rect x="260" y="25" width="50" height="15" fill="#FB923C" rx="2" />
        </>
      )}
      
      {location.includes("Ashram") && (
        <>
          {/* Ashram building shapes */}
          <rect x="120" y="30" width="160" height="60" fill="#FB923C" rx="2" />
          <rect x="140" y="30" width="120" height="30" fill="#F97316" rx="2" />
          <rect x="170" y="10" width="60" height="20" fill="#F97316" rx="2" />
          
          {/* Crowd dots in critical areas */}
          {[...Array(100)].map((_, i) => (
            <circle 
              key={`crowd-dot-${i}`} 
              cx={50 + Math.random() * 300} 
              cy={110 + Math.random() * 50} 
              r={2 + Math.random() * 3}
              fill="#EF4444"
              opacity={0.8 + Math.random() * 0.2}
            />
          ))}
          
          {/* Pathway */}
          <path d="M100 180 L150 100 L250 100 L300 180" fill="#D1D5DB" opacity="0.6" />
        </>
      )}
      
      {location.includes("Nashik") && !location.includes("Ashram") && (
        <>
          {/* Nashik general shapes */}
          <rect x="50" y="40" width="300" height="100" fill="#D1D5DB" opacity="0.2" rx="2" />
          
          {/* City layout */}
          {[...Array(8)].map((_, i) => (
            <rect 
              key={`building-${i}`}
              x={70 + i * 40} 
              y={50} 
              width="30" 
              height="30" 
              fill="#FB923C" 
              opacity={0.7 + Math.random() * 0.3}
              rx="2"
            />
          ))}
          
          {/* Crowd dots in critical areas */}
          {[...Array(60)].map((_, i) => (
            <circle 
              key={`crowd-dot-${i}`} 
              cx={90 + Math.random() * 220} 
              cy={100 + Math.random() * 60} 
              r={2 + Math.random() * 3}
              fill="#EF4444"
              opacity={0.8 + Math.random() * 0.2}
            />
          ))}
        </>
      )}
      
      {/* Emergency indicators */}
      <g className="emergency-indicator">
        <circle cx="30" cy="30" r="15" fill="#EF4444" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite" />
        </circle>
        <path d="M30 20 L30 35 M30 40 L30 40" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </g>
      
      <g className="emergency-indicator">
        <circle cx="370" cy="30" r="15" fill="#EF4444" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite" />
        </circle>
        <path d="M370 20 L370 35 M370 40 L370 40" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </g>
      
      {/* Caption */}
      <text x="200" y="175" textAnchor="middle" fill="#7F1D1D" fontSize="12" fontWeight="bold">
        CRITICAL CROWD LEVEL
      </text>
    </svg>
  );
};

// Map visualization component
const MapVisualization = ({ location }: { location: string }) => {
  // Map coordinates for different locations
  const getCoordinates = () => {
    if (location.includes("Sangam")) {
      return { lat: 20.0059, lng: 73.7913 };
    } else if (location.includes("Ashram")) {
      return { lat: 20.0116, lng: 73.7938 };
    } else {
      return { lat: 19.9975, lng: 73.7898 };
    }
  };
  
  // Simplified map visualization using SVG
  return (
    <svg
      width="100%"
      height="120"
      viewBox="0 0 300 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mt-3 mb-2"
    >
      {/* Map background */}
      <rect width="300" height="120" fill="#F3F4F6" rx="4" />
      
      {/* River or road */}
      <path d="M50 60 C100 50, 200 70, 250 60" stroke="#3B82F6" strokeWidth="10" opacity="0.5" strokeLinecap="round" />
      
      {/* Main areas */}
      <circle cx="150" cy="60" r="15" fill="#FEF2F2" stroke="#EF4444" strokeWidth="2" />
      <circle cx="150" cy="60" r="10" fill="#EF4444">
        <animate attributeName="r" values="10;12;10" dur="2s" repeatCount="indefinite" />
      </circle>
      
      {/* Alternative routes */}
      <path d="M150 60 L180 40" stroke="#D1D5DB" strokeWidth="2" strokeDasharray="2" />
      <path d="M150 60 L180 80" stroke="#D1D5DB" strokeWidth="2" strokeDasharray="2" />
      <path d="M150 60 L120 40" stroke="#10B981" strokeWidth="2" />
      <path d="M150 60 L120 80" stroke="#10B981" strokeWidth="2" />
      
      <circle cx="120" cy="40" r="5" fill="#10B981" />
      <circle cx="120" cy="80" r="5" fill="#10B981" />
      <circle cx="180" cy="40" r="5" fill="#D1D5DB" />
      <circle cx="180" cy="80" r="5" fill="#D1D5DB" />
      
      {/* Location pin at hotspot */}
      <path d="M150 45 L150 60" stroke="#EF4444" strokeWidth="2" />
      <circle cx="150" cy="45" r="5" fill="#EF4444" />
      
      {/* Caption */}
      <text x="150" y="20" textAnchor="middle" fill="#1F2937" fontSize="10" fontWeight="bold">
        {location}
      </text>
      <text x="120" cy="40" textAnchor="middle" fill="#047857" fontSize="8">
        Safe Route
      </text>
      <text x="120" cy="110" textAnchor="middle" fill="#1F2937" fontSize="8">
        {`${getCoordinates().lat.toFixed(4)}, ${getCoordinates().lng.toFixed(4)}`}
      </text>
    </svg>
  );
};

interface EmergencyCrowdAlertProps {
  location: string;
  timestamp?: string;
  capacity?: number;
  currentCount?: number;
  alertLevel?: 'warning' | 'critical';
  message?: string;
}

export function EmergencyCrowdAlert({
  location,
  timestamp = new Date().toISOString(),
  capacity = 10000,
  currentCount = 9500,
  alertLevel = 'critical',
  message
}: EmergencyCrowdAlertProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Auto-open the alert when it first renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Format timestamp to readable format
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "Just now";
    }
  };
  
  // Calculate occupancy percentage
  const occupancyPercent = Math.min(100, Math.round((currentCount / capacity) * 100));
  
  // Derive status text and colors
  const getStatusDetails = () => {
    if (alertLevel === 'critical') {
      return {
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-500',
        statusText: 'CRITICAL',
        description: message || `Extreme overcrowding at ${location}. Area is unsafe and reaching maximum capacity. Emergency protocols have been activated.`
      };
    } else {
      return {
        color: 'bg-amber-500',
        textColor: 'text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-500',
        statusText: 'WARNING',
        description: message || `High crowd density at ${location}. Consider alternative routes.`
      };
    }
  };
  
  const { color, textColor, bgColor, borderColor, statusText, description } = getStatusDetails();
  
  return (
    <>
      {/* Main Alert Card */}
      <Card className={`${bgColor} border ${borderColor} shadow-lg mb-4`}>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${textColor}`} />
              <div className="font-bold text-lg">EMERGENCY: Crowd Alert</div>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${color} text-white`}>
              {statusText}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">{location}</span>
            </div>
            
            <p className={`text-sm ${textColor}`}>{description}</p>
            
            {/* Crowd visualization */}
            <CrowdVisualizationSVG location={location} />
            
            {/* Occupancy meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Current Crowd</span>
                <span className={`font-semibold ${textColor}`}>{occupancyPercent}% Full</span>
              </div>
              <Progress 
                value={occupancyPercent} 
                max={100}
                className={`h-2 bg-gray-200 [&>div]:${color}`}
              />
            </div>
            
            {/* Actions */}
            <div className="flex justify-between gap-2 pt-1">
              <Button 
                variant="outline" 
                size="sm"
                className={`${textColor} border-current hover:bg-red-100`}
                onClick={() => setShowDetails(true)}
              >
                View Details
              </Button>
              <div className="text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Updated {formatTime(timestamp)}
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Detailed Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className={`${bgColor} border ${borderColor}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${textColor}`} />
              Crowd Emergency at {location}
            </DialogTitle>
            <DialogDescription className={textColor}>
              Critical crowd situation detected. Please follow safety instructions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Current stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white bg-opacity-50 p-3 rounded-md">
                <div className="text-xs text-gray-500">Current Count</div>
                <div className="text-lg font-bold">{currentCount.toLocaleString()}</div>
              </div>
              <div className="bg-white bg-opacity-50 p-3 rounded-md">
                <div className="text-xs text-gray-500">Capacity</div>
                <div className="text-lg font-bold">{capacity.toLocaleString()}</div>
              </div>
            </div>
            
            {/* Map visualization */}
            <MapVisualization location={location} />
            
            {/* Safety instructions */}
            <div className="bg-white bg-opacity-60 p-3 rounded-md space-y-2">
              <h4 className="font-semibold">Safety Instructions:</h4>
              <ul className="text-sm space-y-1 pl-5 list-disc">
                <li>Remain calm and follow officials' directions</li>
                <li>Use designated alternative routes shown in green</li>
                <li>Hold children's hands firmly at all times</li>
                <li>Move against the flow of crowd if possible</li>
                <li>Keep your valuables and identification secure</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setShowDetails(false)}
            >
              Close
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                window.open('tel:108', '_blank');
                setShowDetails(false);
              }}
            >
              Emergency Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Alert popup for critical situations */}
      <Dialog open={isOpen && alertLevel === 'critical'} onOpenChange={setIsOpen}>
        <DialogContent className="bg-red-50 border-2 border-red-500">
          <DialogHeader>
            <DialogTitle className="text-red-700 text-center text-lg flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              EMERGENCY ALERT
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            <p className="text-center font-bold text-red-700">
              Critical crowd situation at:
            </p>
            <p className="text-center text-lg font-bold">{location}</p>
            
            <div className="p-2 bg-white bg-opacity-75 rounded-md text-center text-sm">
              This area has reached unsafe crowd levels. Please use alternative routes and follow official guidance.
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={() => setIsOpen(false)}
            >
              Acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}