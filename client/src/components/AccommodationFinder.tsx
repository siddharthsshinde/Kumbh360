
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Phone, Star, MapPin, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { tripAdvisorApiClient, TripAdvisorHotel } from "@/lib/tripAdvisorApi";
import { ask_secrets } from "@/lib/secrets";

// Sample accommodation data for fallback/demo purposes
const sampleAccommodations: TripAdvisorHotel[] = [
  {
    id: "1",
    name: "Ganga View Hotel",
    type: "Hotel",
    location: {
      id: "loc1",
      name: "Ganga View Hotel",
      latitude: 20.006,
      longitude: 73.791,
      address: "123 River Road, Nashik",
      city: "Nashik",
      country: "India"
    },
    distance: 0.8,
    price: {
      from: 3500,
      to: 5000,
      currency: "INR",
      displayPrice: "₹3,500 - ₹5,000"
    },
    rating: 4.2,
    amenities: ["AC", "Free WiFi", "Restaurant", "24/7 Reception"],
    availability: "Limited",
    contact: "+91 9876543210",
    images: [
      {
        small: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
        large: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
      }
    ],
    description: "A comfortable hotel overlooking the Godavari River with modern amenities and convenient access to all major Kumbh Mela sites."
  },
  {
    id: "2",
    name: "Kumbh Dharamshala",
    type: "Dharamshala",
    location: {
      id: "loc2",
      name: "Kumbh Dharamshala",
      latitude: 20.003,
      longitude: 73.789,
      address: "45 Temple Street, Nashik",
      city: "Nashik",
      country: "India"
    },
    distance: 0.5,
    price: {
      from: 800,
      to: 1200,
      currency: "INR",
      displayPrice: "₹800 - ₹1,200"
    },
    rating: 3.8,
    amenities: ["Free Meals", "Dormitory", "Locker"],
    availability: "Available",
    contact: "+91 9876543211",
    images: [
      {
        small: "https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?auto=format&fit=crop&w=400&q=80",
        large: "https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?auto=format&fit=crop&w=800&q=80"
      }
    ],
    description: "Traditional dharamshala offering simple accommodations with free meals, perfect for pilgrims visiting Kumbh Mela on a budget."
  },
  {
    id: "3",
    name: "Tapovan Tent City",
    type: "Tent",
    location: {
      id: "loc3",
      name: "Tapovan Tent City",
      latitude: 20.012,
      longitude: 73.794,
      address: "Tapovan Area, Nashik",
      city: "Nashik",
      country: "India"
    },
    distance: 0.3,
    price: {
      from: 1500,
      to: 2000,
      currency: "INR",
      displayPrice: "₹1,500 - ₹2,000"
    },
    rating: 4.0,
    amenities: ["Bedding", "Security", "Common Bathroom"],
    availability: "High",
    contact: "+91 9876543212",
    images: [
      {
        small: "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?auto=format&fit=crop&w=400&q=80",
        large: "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?auto=format&fit=crop&w=800&q=80"
      }
    ],
    description: "Spacious tents with basic amenities, located in the heart of the Kumbh Mela action at Tapovan."
  },
  {
    id: "4",
    name: "Godavari Luxury Resort",
    type: "Hotel",
    location: {
      id: "loc4",
      name: "Godavari Luxury Resort",
      latitude: 19.985,
      longitude: 73.770,
      address: "Mumbai-Agra Highway, Nashik",
      city: "Nashik",
      country: "India"
    },
    distance: 2.5,
    price: {
      from: 7000,
      to: 12000,
      currency: "INR",
      displayPrice: "₹7,000 - ₹12,000"
    },
    rating: 4.7,
    amenities: ["AC", "Pool", "Spa", "Restaurant", "Free WiFi", "Room Service"],
    availability: "Available",
    contact: "+91 9876543213",
    images: [
      {
        small: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=400&q=80",
        large: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80"
      }
    ],
    description: "Premium luxury resort with all modern amenities, offering a peaceful retreat while still accessible to Kumbh Mela festivities."
  },
  {
    id: "5",
    name: "Nashik Ashram",
    type: "Ashram",
    location: {
      id: "loc5",
      name: "Nashik Ashram",
      latitude: 20.001,
      longitude: 73.785,
      address: "Panchavati, Nashik",
      city: "Nashik",
      country: "India"
    },
    distance: 1.0,
    price: {
      from: 500,
      to: 800,
      currency: "INR",
      displayPrice: "₹500 - ₹800"
    },
    rating: 3.5,
    amenities: ["Meditation Hall", "Simple Food", "Shared Rooms"],
    availability: "Limited",
    contact: "+91 9876543214",
    images: [
      {
        small: "https://images.unsplash.com/photo-1554226980-4f93fd8ca9af?auto=format&fit=crop&w=400&q=80",
        large: "https://images.unsplash.com/photo-1554226980-4f93fd8ca9af?auto=format&fit=crop&w=800&q=80"
      }
    ],
    description: "Traditional ashram offering a spiritual atmosphere with meditation facilities and simple accommodations."
  },
  {
    id: "6",
    name: "Pilgrim's Budget Inn",
    type: "Hotel",
    location: {
      id: "loc6",
      name: "Pilgrim's Budget Inn",
      latitude: 19.995,
      longitude: 73.780,
      address: "College Road, Nashik",
      city: "Nashik",
      country: "India"
    },
    distance: 1.2,
    price: {
      from: 1200,
      to: 2500,
      currency: "INR",
      displayPrice: "₹1,200 - ₹2,500"
    },
    rating: 3.9,
    amenities: ["Fan", "TV", "Hot Water"],
    availability: "High",
    contact: "+91 9876543215",
    images: [
      {
        small: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=400&q=80",
        large: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
      }
    ],
    description: "Affordable hotel with basic amenities, perfect for pilgrims looking for comfortable accommodations on a budget."
  }
];

// Nashik Kumbh Mela center coordinates
const KUMBH_MELA_CENTER = {
  latitude: 20.006,
  longitude: 73.791
};

export function AccommodationFinder() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [accommodations, setAccommodations] = useState<TripAdvisorHotel[]>([]);
  const [tab, setTab] = useState<'all' | 'nearby' | 'popular'>('all');
  
  // Sample data is already typed as TripAdvisorHotel[]

  useEffect(() => {
    // Check if API key is set when component loads
    checkForApiKey();
    
    // Load initial data
    loadAccommodations();
  }, []);
  
  // Check for TripAdvisor API key
  const checkForApiKey = async () => {
    try {
      const tripAdvisorApiKey = import.meta.env.VITE_TRIPADVISOR_API_KEY;
      
      if (tripAdvisorApiKey) {
        tripAdvisorApiClient.setApiKey(tripAdvisorApiKey);
        setHasApiKey(true);
      } else {
        setHasApiKey(false);
        requestApiKey();
      }
    } catch (error) {
      console.error('Error checking for TripAdvisor API key:', error);
      setHasApiKey(false);
    }
  };
  
  // Request API key from user
  const requestApiKey = async () => {
    const secretKeys = ["VITE_TRIPADVISOR_API_KEY"];
    const message = "A RapidAPI key with TripAdvisor API access is required to fetch real accommodation data near Kumbh Mela. Please visit RapidAPI, subscribe to the TripAdvisor API, and provide your RapidAPI key.";
    
    try {
      const success = await ask_secrets(secretKeys, message);
      if (success) {
        toast({
          title: "API Key Requested",
          description: "Once the RapidAPI TripAdvisor API key is set, real accommodation data will be displayed.",
          variant: "default"
        });
        
        // Check again after a delay to allow time for the key to be set
        setTimeout(() => {
          checkForApiKey();
        }, 2000);
      }
    } catch (error) {
      console.error('Error requesting API key:', error);
    }
  };
  
  // Load accommodations data, either from API or fallback to sample data
  const loadAccommodations = async () => {
    setIsLoading(true);
    
    try {
      if (hasApiKey) {
        // Try to load from TripAdvisor API
        try {
          const apiAccommodations = await tripAdvisorApiClient.getNearbyHotels(
            KUMBH_MELA_CENTER.latitude,
            KUMBH_MELA_CENTER.longitude,
            5, // 5km radius
            20 // 20 results max
          );
          
          setAccommodations(apiAccommodations);
          
          toast({
            title: "Live Data Loaded",
            description: "Showing real-time accommodation data from RapidAPI TripAdvisor",
            variant: "default"
          });
        } catch (apiError) {
          console.error('Error loading from TripAdvisor API:', apiError);
          
          // Fall back to sample data
          setAccommodations(sampleAccommodations);
          
          toast({
            title: "Using Sample Data",
            description: "Could not connect to TripAdvisor API. Showing sample accommodations.",
            variant: "destructive"
          });
        }
      } else {
        // Use sample data if no API key
        setAccommodations(sampleAccommodations);
      }
    } catch (error) {
      console.error('Error loading accommodations:', error);
      setAccommodations(sampleAccommodations);
      
      toast({
        title: "Error Loading Data",
        description: "There was a problem loading accommodation data. Showing sample data instead.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter accommodations based on search term and filters
  const filteredAccommodations = accommodations.filter((accommodation) => {
    // Apply tab filter
    let matchesTab = true;
    if (tab === 'nearby') {
      matchesTab = accommodation.distance !== undefined && accommodation.distance <= 1.0;
    } else if (tab === 'popular') {
      matchesTab = accommodation.rating >= 4.0;
    }
    
    // Filter by search term
    const matchesSearch = 
      accommodation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accommodation.amenities.some((amenity: string) => amenity.toLowerCase().includes(searchTerm.toLowerCase())) ||
      accommodation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (accommodation.description && accommodation.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by type
    const matchesType = !selectedType || accommodation.type === selectedType;
    
    // Filter by price range
    let matchesPrice = true;
    if (priceRange === "budget" && accommodation.price.from > 1200) {
      matchesPrice = false;
    } else if (priceRange === "mid" && (accommodation.price.from < 1200 || accommodation.price.from > 3500)) {
      matchesPrice = false;
    } else if (priceRange === "premium" && accommodation.price.from < 3500) {
      matchesPrice = false;
    }
    
    return matchesTab && matchesSearch && matchesType && matchesPrice;
  });

  return (
    <Card className="w-full bg-white shadow-md mb-6">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#FF7F00] flex items-center">
            <span className="mr-2">🏨</span>
            Accommodation Finder
            {!hasApiKey && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={requestApiKey} 
                className="ml-2 text-xs text-orange-600"
              >
                <Info className="h-3 w-3 mr-1" />
                Get RapidAPI Key
              </Button>
            )}
          </h2>
          
          {isLoading && (
            <div className="flex items-center text-sm text-gray-500">
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Loading...
            </div>
          )}
        </div>
        
        <Tabs defaultValue="all" className="mb-4" onValueChange={(value) => setTab(value as 'all' | 'nearby' | 'popular')}>
          <TabsList className="mb-2">
            <TabsTrigger value="all">All Accommodations</TabsTrigger>
            <TabsTrigger value="nearby">Nearby (≤ 1km)</TabsTrigger>
            <TabsTrigger value="popular">Popular (4★+)</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search for accommodations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />
          
          <div className="flex flex-wrap gap-2 mb-2">
            <Button 
              variant={selectedType === null ? "default" : "outline"} 
              size="sm" 
              onClick={() => setSelectedType(null)}
              className="text-xs"
            >
              All Types
            </Button>
            <Button 
              variant={selectedType === "Hotel" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setSelectedType("Hotel")}
              className="text-xs"
            >
              Hotels
            </Button>
            <Button 
              variant={selectedType === "Dharamshala" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setSelectedType("Dharamshala")}
              className="text-xs"
            >
              Dharamshalas
            </Button>
            <Button 
              variant={selectedType === "Tent" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setSelectedType("Tent")}
              className="text-xs"
            >
              Tents
            </Button>
            <Button 
              variant={selectedType === "Ashram" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setSelectedType("Ashram")}
              className="text-xs"
            >
              Ashrams
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={priceRange === null ? "default" : "outline"} 
              size="sm" 
              onClick={() => setPriceRange(null)}
              className="text-xs"
            >
              All Prices
            </Button>
            <Button 
              variant={priceRange === "budget" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setPriceRange("budget")}
              className="text-xs"
            >
              Budget (₹500-₹1,200)
            </Button>
            <Button 
              variant={priceRange === "mid" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setPriceRange("mid")}
              className="text-xs"
            >
              Mid-Range (₹1,500-₹3,500)
            </Button>
            <Button 
              variant={priceRange === "premium" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setPriceRange("premium")}
              className="text-xs"
            >
              Premium (₹3,500+)
            </Button>
          </div>
        </div>
        
        {filteredAccommodations.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            No accommodations found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAccommodations.map((accommodation) => (
              <div key={accommodation.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 overflow-hidden relative">
                  <img 
                    src={accommodation.images[0]?.large || accommodation.images[0]?.small} 
                    alt={accommodation.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={
                      accommodation.availability === "High" ? "default" :
                      accommodation.availability === "Available" ? "secondary" :
                      "destructive"
                    }>
                      {accommodation.availability}
                    </Badge>
                  </div>
                  {accommodation.rating && (
                    <div className="absolute bottom-2 right-2 bg-white rounded-full px-2 py-1 flex items-center text-xs font-medium shadow-sm">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" fill="currentColor" />
                      {accommodation.rating.toFixed(1)}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{accommodation.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      {accommodation.distance} km
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{accommodation.type}</p>
                  <p className="font-medium mt-1">{accommodation.price.displayPrice} / night</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {accommodation.amenities.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{amenity}</Badge>
                    ))}
                    {accommodation.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{accommodation.amenities.length - 3} more</Badge>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t">
                    <Button 
                      size="sm" 
                      className="w-full bg-[#FF7F00] hover:bg-[#E67300] text-white"
                      onClick={() => {
                        window.open(`tel:${accommodation.contact}`);
                      }}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      {accommodation.contact}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
