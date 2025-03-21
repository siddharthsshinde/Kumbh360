import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from './ui/select';
import { 
  Coffee, Droplet, ShieldCheck, AlertCircle, Search,
  MapPin, Clock, Star, Info, ThumbsUp, Filter, RefreshCw,
  IndianRupee
} from 'lucide-react';

// Food stall interface
interface FoodStall {
  id: string;
  name: string;
  location: string;
  foodType: string[];
  inspectionStatus: 'passed' | 'pending' | 'failed';
  lastInspected: string;
  rating: number;
  specialty: string;
  openHours: string;
  coordinates: { lat: number; lng: number };
}

// Water source interface
interface WaterSource {
  id: string;
  location: string;
  type: 'municipal' | 'filtered' | 'bottled';
  qualityLevel: 'excellent' | 'good' | 'fair' | 'poor';
  lastTested: string;
  available: boolean;
  coordinates: { lat: number; lng: number };
}

// Food availability interface
interface FoodAvailability {
  id: string;
  itemName: string;
  locations: string[];
  availabilityStatus: 'high' | 'medium' | 'low';
  price: string;
  dietaryInfo: string[];
  updatedAt: string;
}

// Mock data for food stalls - in a real app, this would come from an API
const FOOD_STALLS: FoodStall[] = [
  {
    id: "FS1",
    name: "Annapurna Bhojanalay",
    location: "Near Ramkund",
    foodType: ["Maharashtrian", "Vegetarian"],
    inspectionStatus: "passed",
    lastInspected: "2025-03-20",
    rating: 4.6,
    specialty: "Puran Poli",
    openHours: "6:00 AM - 10:00 PM",
    coordinates: { lat: 20.0055, lng: 73.7910 }
  },
  {
    id: "FS2",
    name: "Ganga Prasad",
    location: "Panchavati",
    foodType: ["North Indian", "Vegetarian"],
    inspectionStatus: "passed",
    lastInspected: "2025-03-19",
    rating: 4.3,
    specialty: "Chole Bhature",
    openHours: "7:00 AM - 11:00 PM",
    coordinates: { lat: 20.0062, lng: 73.7901 }
  },
  {
    id: "FS3",
    name: "Kumbh Snacks Center",
    location: "Tapovan",
    foodType: ["Snacks", "Street Food"],
    inspectionStatus: "pending",
    lastInspected: "2025-03-15",
    rating: 4.1,
    specialty: "Vada Pav",
    openHours: "8:00 AM - 10:00 PM",
    coordinates: { lat: 20.0110, lng: 73.7935 }
  },
  {
    id: "FS4",
    name: "Godavari Sweets",
    location: "Kalaram Temple Road",
    foodType: ["Sweets", "Vegetarian"],
    inspectionStatus: "passed",
    lastInspected: "2025-03-18",
    rating: 4.7,
    specialty: "Modak & Ladoo",
    openHours: "7:00 AM - 9:00 PM",
    coordinates: { lat: 20.0060, lng: 73.7900 }
  },
  {
    id: "FS5",
    name: "Triveni Fast Food",
    location: "Near Godavari Ghat",
    foodType: ["South Indian", "Chinese"],
    inspectionStatus: "failed",
    lastInspected: "2025-03-17",
    rating: 3.8,
    specialty: "Dosa & Noodles",
    openHours: "8:00 AM - 11:00 PM",
    coordinates: { lat: 19.9970, lng: 73.7760 }
  }
];

// Mock data for water sources - in a real app, this would come from an API
const WATER_SOURCES: WaterSource[] = [
  {
    id: "WS1",
    location: "Ramkund Main Entrance",
    type: "filtered",
    qualityLevel: "excellent",
    lastTested: "2025-03-21",
    available: true,
    coordinates: { lat: 20.0057, lng: 73.7915 }
  },
  {
    id: "WS2",
    location: "Panchavati Circle",
    type: "municipal",
    qualityLevel: "good",
    lastTested: "2025-03-20",
    available: true,
    coordinates: { lat: 20.0065, lng: 73.7905 }
  },
  {
    id: "WS3",
    location: "Tapovan Facilities",
    type: "filtered",
    qualityLevel: "excellent",
    lastTested: "2025-03-21",
    available: true,
    coordinates: { lat: 20.0115, lng: 73.7940 }
  },
  {
    id: "WS4",
    location: "Kalaram Temple Entrance",
    type: "bottled",
    qualityLevel: "excellent",
    lastTested: "2025-03-21",
    available: true,
    coordinates: { lat: 20.0063, lng: 73.7903 }
  },
  {
    id: "WS5",
    location: "Godavari Ghat North",
    type: "municipal",
    qualityLevel: "fair",
    lastTested: "2025-03-19",
    available: false,
    coordinates: { lat: 19.9980, lng: 73.7770 }
  }
];

// Mock data for food availability - in a real app, this would come from an API
const FOOD_AVAILABILITY: FoodAvailability[] = [
  {
    id: "FA1",
    itemName: "Prasad Boxes",
    locations: ["Ramkund Temple", "Kalaram Temple", "Panchavati"],
    availabilityStatus: "high",
    price: "₹50-₹200",
    dietaryInfo: ["Vegetarian", "Sattvic"],
    updatedAt: "2025-03-21 10:30 AM"
  },
  {
    id: "FA2",
    itemName: "Bottled Water",
    locations: ["All major locations", "Mobile vendors"],
    availabilityStatus: "high",
    price: "₹20-₹40",
    dietaryInfo: [],
    updatedAt: "2025-03-21 11:15 AM"
  },
  {
    id: "FA3",
    itemName: "Fresh Fruits",
    locations: ["Fruit markets near Panchavati", "Mobile carts"],
    availabilityStatus: "medium",
    price: "₹40-₹100 per kg",
    dietaryInfo: ["Vegetarian", "Fresh"],
    updatedAt: "2025-03-21 09:00 AM"
  },
  {
    id: "FA4",
    itemName: "Langar Meals",
    locations: ["Community halls", "Near Ramkund"],
    availabilityStatus: "high",
    price: "Free",
    dietaryInfo: ["Vegetarian", "Sattvic"],
    updatedAt: "2025-03-21 12:00 PM"
  },
  {
    id: "FA5",
    itemName: "Special Khichdi",
    locations: ["Tapovan", "Godavari Ghat"],
    availabilityStatus: "low",
    price: "₹30-₹50",
    dietaryInfo: ["Vegetarian", "Sattvic"],
    updatedAt: "2025-03-21 08:45 AM"
  }
];

export function FoodWaterSafety() {
  const [activeTab, setActiveTab] = useState("food-stalls");
  const [searchQuery, setSearchQuery] = useState("");
  const [foodTypeFilter, setFoodTypeFilter] = useState<string>("all");
  const [waterTypeFilter, setWaterTypeFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  
  // Filter food stalls based on search and filters
  const filteredFoodStalls = FOOD_STALLS.filter(stall => {
    // Search filter
    const matchesSearch = 
      stall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stall.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stall.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Food type filter
    const matchesFoodType = 
      foodTypeFilter === "all" || 
      stall.foodType.some(type => type.toLowerCase() === foodTypeFilter.toLowerCase());
    
    return matchesSearch && matchesFoodType;
  });
  
  // Filter water sources based on search and filters
  const filteredWaterSources = WATER_SOURCES.filter(source => {
    // Search filter
    const matchesSearch = 
      source.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Water type filter
    const matchesWaterType = 
      waterTypeFilter === "all" || 
      source.type === waterTypeFilter;
    
    return matchesSearch && matchesWaterType;
  });
  
  // Filter food availability based on search and filters
  const filteredFoodAvailability = FOOD_AVAILABILITY.filter(item => {
    // Search filter
    const matchesSearch = 
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locations.some(loc => loc.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Availability filter
    const matchesAvailability = 
      availabilityFilter === "all" || 
      item.availabilityStatus === availabilityFilter;
    
    return matchesSearch && matchesAvailability;
  });
  
  // Status badge component
  const InspectionStatusBadge = ({ status }: { status: FoodStall['inspectionStatus'] }) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Passed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Failed</Badge>;
      default:
        return null;
    }
  };
  
  // Water quality badge component
  const WaterQualityBadge = ({ level }: { level: WaterSource['qualityLevel'] }) => {
    switch (level) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Good</Badge>;
      case 'fair':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Fair</Badge>;
      case 'poor':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Poor</Badge>;
      default:
        return null;
    }
  };
  
  // Availability badge component
  const AvailabilityBadge = ({ status }: { status: FoodAvailability['availabilityStatus'] }) => {
    switch (status) {
      case 'high':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">High Availability</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Medium Availability</Badge>;
      case 'low':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Low Availability</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          Food & Water Safety
        </CardTitle>
        <CardDescription>
          Find verified food stalls, check water quality, and get availability updates
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="food-stalls">
              <Coffee className="h-4 w-4 mr-2 hidden sm:inline" />
              Food Stalls
            </TabsTrigger>
            <TabsTrigger value="water-quality">
              <Droplet className="h-4 w-4 mr-2 hidden sm:inline" />
              Water Sources
            </TabsTrigger>
            <TabsTrigger value="food-availability">
              <Info className="h-4 w-4 mr-2 hidden sm:inline" />
              Availability
            </TabsTrigger>
          </TabsList>
          
          {/* Search and filter bar */}
          <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search by name, location..." 
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {activeTab === "food-stalls" && (
              <Select 
                value={foodTypeFilter} 
                onValueChange={setFoodTypeFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cuisines</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="maharashtrian">Maharashtrian</SelectItem>
                  <SelectItem value="north indian">North Indian</SelectItem>
                  <SelectItem value="south indian">South Indian</SelectItem>
                  <SelectItem value="snacks">Snacks</SelectItem>
                  <SelectItem value="sweets">Sweets</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            {activeTab === "water-quality" && (
              <Select 
                value={waterTypeFilter} 
                onValueChange={setWaterTypeFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="filtered">Filtered</SelectItem>
                  <SelectItem value="municipal">Municipal</SelectItem>
                  <SelectItem value="bottled">Bottled</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            {activeTab === "food-availability" && (
              <Select 
                value={availabilityFilter} 
                onValueChange={setAvailabilityFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All availability</SelectItem>
                  <SelectItem value="high">High availability</SelectItem>
                  <SelectItem value="medium">Medium availability</SelectItem>
                  <SelectItem value="low">Low availability</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Food Stalls Tab */}
          <TabsContent value="food-stalls" className="space-y-3">
            {filteredFoodStalls.length > 0 ? (
              filteredFoodStalls.map(stall => (
                <div 
                  key={stall.id} 
                  className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start flex-wrap sm:flex-nowrap gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-lg">{stall.name}</h3>
                        <InspectionStatusBadge status={stall.inspectionStatus} />
                      </div>
                      
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-green-600" /> 
                          <span>{stall.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Coffee className="h-3.5 w-3.5 text-green-600" /> 
                          <span>Specialty: {stall.specialty}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-green-600" /> 
                          <span>{stall.openHours}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 space-x-1">
                        {stall.foodType.map((type, index) => (
                          <Badge key={index} variant="outline" className="bg-green-50">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center">
                        <span className="font-bold text-amber-500 mr-1">{stall.rating}</span>
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      </div>
                      <div className="text-xs text-gray-500">
                        Last inspected: {stall.lastInspected}
                      </div>
                      <Button size="sm" variant="outline" className="mt-1">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <h3 className="font-medium">No food stalls found</h3>
                <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>

          {/* Water Quality Tab */}
          <TabsContent value="water-quality" className="space-y-3">
            {filteredWaterSources.length > 0 ? (
              filteredWaterSources.map(source => (
                <div 
                  key={source.id} 
                  className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start flex-wrap sm:flex-nowrap gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-lg">{source.location}</h3>
                        <WaterQualityBadge level={source.qualityLevel} />
                      </div>
                      
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Droplet className="h-3.5 w-3.5 text-blue-600" /> 
                          <span>Type: {source.type.charAt(0).toUpperCase() + source.type.slice(1)} Water</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-blue-600" /> 
                          <span>Last tested: {source.lastTested}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {source.available ? (
                        <Badge className="bg-green-100 text-green-800">Available</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Unavailable</Badge>
                      )}
                      <Button size="sm" variant="outline" className="mt-1">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        Directions
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <h3 className="font-medium">No water sources found</h3>
                <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>

          {/* Food Availability Tab */}
          <TabsContent value="food-availability" className="space-y-3">
            {filteredFoodAvailability.length > 0 ? (
              filteredFoodAvailability.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start flex-wrap sm:flex-nowrap gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-lg">{item.itemName}</h3>
                        <AvailabilityBadge status={item.availabilityStatus} />
                      </div>
                      
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" /> 
                          <span>Available at: {item.locations.join(", ")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <IndianRupee className="h-3.5 w-3.5 text-emerald-600" /> 
                          <span>Price range: {item.price}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-emerald-600" /> 
                          <span>Updated: {item.updatedAt}</span>
                        </div>
                      </div>
                      
                      {item.dietaryInfo.length > 0 && (
                        <div className="mt-2 space-x-1">
                          {item.dietaryInfo.map((info, index) => (
                            <Badge key={index} variant="outline" className="bg-green-50">
                              {info}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <h3 className="font-medium">No food items found</h3>
                <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 text-xs text-gray-600 flex justify-between items-center rounded-b-lg">
        <div className="flex items-center">
          <RefreshCw className="h-3.5 w-3.5 text-gray-500 mr-1" />
          Last updated: Today, 2:30 PM
        </div>
        <div className="flex items-center">
          <ThumbsUp className="h-3.5 w-3.5 text-green-600 mr-1" />
          Verified data from Kumbh Mela Health Department
        </div>
      </CardFooter>
    </Card>
  );
}