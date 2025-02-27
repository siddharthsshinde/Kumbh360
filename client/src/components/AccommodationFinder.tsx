
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Sample accommodation data
const accommodations = [
  {
    id: 1,
    name: "Ganga View Hotel",
    type: "Hotel",
    distance: 0.8,
    price: "₹3,500 - ₹5,000",
    amenities: ["AC", "Free WiFi", "Restaurant", "24/7 Reception"],
    availability: "Limited",
    contact: "+91 9876543210",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    name: "Kumbh Dharamshala",
    type: "Dharamshala",
    distance: 0.5,
    price: "₹800 - ₹1,200",
    amenities: ["Free Meals", "Dormitory", "Locker"],
    availability: "Available",
    contact: "+91 9876543211",
    image: "https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    name: "Tapovan Tent City",
    type: "Tent",
    distance: 0.3,
    price: "₹1,500 - ₹2,000",
    amenities: ["Bedding", "Security", "Common Bathroom"],
    availability: "High",
    contact: "+91 9876543212",
    image: "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    name: "Godavari Luxury Resort",
    type: "Hotel",
    distance: 2.5,
    price: "₹7,000 - ₹12,000",
    amenities: ["AC", "Pool", "Spa", "Restaurant", "Free WiFi", "Room Service"],
    availability: "Available",
    contact: "+91 9876543213",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    name: "Nashik Ashram",
    type: "Ashram",
    distance: 1.0,
    price: "₹500 - ₹800",
    amenities: ["Meditation Hall", "Simple Food", "Shared Rooms"],
    availability: "Limited",
    contact: "+91 9876543214",
    image: "https://images.unsplash.com/photo-1554226980-4f93fd8ca9af?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 6,
    name: "Pilgrim's Budget Inn",
    type: "Hotel",
    distance: 1.2,
    price: "₹1,200 - ₹2,500",
    amenities: ["Fan", "TV", "Hot Water"],
    availability: "High",
    contact: "+91 9876543215",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
  }
];

export function AccommodationFinder() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<string | null>(null);

  // Filter accommodations based on search term and filters
  const filteredAccommodations = accommodations.filter((accommodation) => {
    // Filter by search term
    const matchesSearch = accommodation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          accommodation.amenities.some(amenity => amenity.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by type
    const matchesType = !selectedType || accommodation.type === selectedType;
    
    // Filter by price range
    let matchesPrice = true;
    if (priceRange === "budget" && !accommodation.price.includes("₹500") && !accommodation.price.includes("₹800") && !accommodation.price.includes("₹1,200")) {
      matchesPrice = false;
    } else if (priceRange === "mid" && !accommodation.price.includes("₹1,500") && !accommodation.price.includes("₹2,000") && !accommodation.price.includes("₹2,500")) {
      matchesPrice = false;
    } else if (priceRange === "premium" && !accommodation.price.includes("₹3,500") && !accommodation.price.includes("₹5,000") && !accommodation.price.includes("₹7,000") && !accommodation.price.includes("₹12,000")) {
      matchesPrice = false;
    }
    
    return matchesSearch && matchesType && matchesPrice;
  });

  return (
    <Card className="w-full bg-white shadow-md mb-6">
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-4 text-[#FF7F00] flex items-center">
          <span className="mr-2">🏨</span>
          Accommodation Finder
        </h2>
        
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
              Mid-Range (₹1,500-₹2,500)
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
                    src={accommodation.image} 
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
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{accommodation.name}</h3>
                    <span className="text-sm text-gray-500">{accommodation.distance} km</span>
                  </div>
                  <p className="text-gray-600 text-sm">{accommodation.type}</p>
                  <p className="font-medium mt-1">{accommodation.price} / night</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {accommodation.amenities.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{amenity}</Badge>
                    ))}
                    {accommodation.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{accommodation.amenities.length - 3} more</Badge>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t">
                    <Button size="sm" className="w-full bg-[#FF7F00] hover:bg-[#E67300] text-white">
                      Contact: {accommodation.contact}
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
