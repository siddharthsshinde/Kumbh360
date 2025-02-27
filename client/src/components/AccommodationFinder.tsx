
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Slider
} from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BedIcon, 
  HomeIcon, 
  Hotel, 
  TentIcon, 
  MapPinIcon, 
  PhoneIcon,
  CalendarIcon,
  UsersIcon,
  CreditCardIcon,
  FilterIcon
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Accommodation {
  id: number;
  name: string;
  type: "hotel" | "guesthouse" | "dharamshala" | "tent_city" | "ashram";
  address: string;
  distance: string;
  contactNumber: string;
  price: string;
  availability: "high" | "medium" | "low";
  amenities: string[];
  image: string;
  rating: number;
  reviews: number;
}

export function AccommodationFinder() {
  const { i18n } = useTranslation();
  const [accommodationType, setAccommodationType] = useState<string>("");
  const [distance, setDistance] = useState<number[]>([10]);
  const [priceRange, setPriceRange] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Accommodation[] | null>(null);
  
  // Sample accommodation data
  const accommodations: Accommodation[] = [
    {
      id: 1,
      name: i18n.language === "en" ? "Hotel Ganga View" : 
            i18n.language === "hi" ? "होटल गंगा व्यू" : 
            "हॉटेल गंगा व्ह्यू",
      type: "hotel",
      address: i18n.language === "en" ? "Near Ramkund, Godavari Bank, Nashik" : 
              i18n.language === "hi" ? "रामकुंड के पास, गोदावरी बैंक, नासिक" : 
              "रामकुंड जवळ, गोदावरी बँक, नाशिक",
      distance: "0.5 km",
      contactNumber: "+91 98765 43210",
      price: "₹3,500 - ₹6,000",
      availability: "low",
      amenities: ["WiFi", "AC", "Restaurant", "Parking"],
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG90ZWx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      rating: 4.2,
      reviews: 156
    },
    {
      id: 2,
      name: i18n.language === "en" ? "Kumbh Tent City" : 
            i18n.language === "hi" ? "कुंभ टेंट सिटी" : 
            "कुंभ टेंट सिटी",
      type: "tent_city",
      address: i18n.language === "en" ? "Tapovan Area, Nashik" : 
              i18n.language === "hi" ? "तपोवन क्षेत्र, नासिक" : 
              "तपोवन क्षेत्र, नाशिक",
      distance: "2 km",
      contactNumber: "+91 98765 12345",
      price: "₹800 - ₹1,500",
      availability: "high",
      amenities: ["Shared Bathroom", "Food Available", "Security"],
      image: "https://images.unsplash.com/photo-1531722569936-825d3dd91b15?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dGVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
      rating: 3.8,
      reviews: 89
    },
    {
      id: 3,
      name: i18n.language === "en" ? "Sadhana Ashram" : 
            i18n.language === "hi" ? "साधना आश्रम" : 
            "साधना आश्रम",
      type: "ashram",
      address: i18n.language === "en" ? "Panchavati, Nashik" : 
              i18n.language === "hi" ? "पंचवटी, नासिक" : 
              "पंचवटी, नाशिक",
      distance: "1.2 km",
      contactNumber: "+91 76543 21098",
      price: "₹500 - ₹1,000",
      availability: "medium",
      amenities: ["Meditation Hall", "Yoga Classes", "Vegetarian Food"],
      image: "https://images.unsplash.com/photo-1603468620905-8de7d86b781e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXNocmFtfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
      rating: 4.7,
      reviews: 215
    },
    {
      id: 4,
      name: i18n.language === "en" ? "Pilgrim's Dharamshala" : 
            i18n.language === "hi" ? "यात्री धर्मशाला" : 
            "यात्रेकरू धर्मशाळा",
      type: "dharamshala",
      address: i18n.language === "en" ? "Near Kalaram Temple, Nashik" : 
              i18n.language === "hi" ? "कालाराम मंदिर के पास, नासिक" : 
              "काळाराम मंदिराजवळ, नाशिक",
      distance: "0.8 km",
      contactNumber: "+91 87654 32109",
      price: "₹300 - ₹700",
      availability: "high",
      amenities: ["Shared Rooms", "Free Food", "Lockers"],
      image: "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9ybWl0b3J5fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
      rating: 3.5,
      reviews: 120
    },
    {
      id: 5,
      name: i18n.language === "en" ? "Godavari Guest House" : 
            i18n.language === "hi" ? "गोदावरी गेस्ट हाउस" : 
            "गोदावरी गेस्ट हाउस",
      type: "guesthouse",
      address: i18n.language === "en" ? "Godavari Bank Road, Nashik" : 
              i18n.language === "hi" ? "गोदावरी बैंक रोड, नासिक" : 
              "गोदावरी बँक रोड, नाशिक",
      distance: "0.7 km",
      contactNumber: "+91 76540 98765",
      price: "₹1,200 - ₹2,500",
      availability: "medium",
      amenities: ["WiFi", "Breakfast", "Laundry"],
      image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3Vlc3QlMjBob3VzZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
      rating: 4.0,
      reviews: 95
    }
  ];

  const typeOptions = [
    { value: "", label: i18n.language === "en" ? "All Types" : i18n.language === "hi" ? "सभी प्रकार" : "सर्व प्रकार" },
    { value: "hotel", label: i18n.language === "en" ? "Hotel" : i18n.language === "hi" ? "होटल" : "हॉटेल" },
    { value: "guesthouse", label: i18n.language === "en" ? "Guest House" : i18n.language === "hi" ? "गेस्ट हाउस" : "गेस्ट हाउस" },
    { value: "dharamshala", label: i18n.language === "en" ? "Dharamshala" : i18n.language === "hi" ? "धर्मशाला" : "धर्मशाळा" },
    { value: "tent_city", label: i18n.language === "en" ? "Tent City" : i18n.language === "hi" ? "टेंट सिटी" : "टेंट सिटी" },
    { value: "ashram", label: i18n.language === "en" ? "Ashram" : i18n.language === "hi" ? "आश्रम" : "आश्रम" }
  ];

  const priceOptions = [
    { value: "", label: i18n.language === "en" ? "All Prices" : i18n.language === "hi" ? "सभी कीमतें" : "सर्व किंमती" },
    { value: "low", label: i18n.language === "en" ? "Budget (< ₹1,000)" : i18n.language === "hi" ? "बजट (< ₹1,000)" : "बजेट (< ₹1,000)" },
    { value: "medium", label: i18n.language === "en" ? "Mid-range (₹1,000 - ₹3,000)" : i18n.language === "hi" ? "मध्यम श्रेणी (₹1,000 - ₹3,000)" : "मध्यम श्रेणी (₹1,000 - ₹3,000)" },
    { value: "high", label: i18n.language === "en" ? "Premium (> ₹3,000)" : i18n.language === "hi" ? "प्रीमियम (> ₹3,000)" : "प्रीमियम (> ₹3,000)" }
  ];

  const handleSearch = () => {
    // Filter accommodations based on selected criteria
    let results = [...accommodations];
    
    if (accommodationType) {
      results = results.filter(acc => acc.type === accommodationType);
    }
    
    if (distance[0] < 10) {
      results = results.filter(acc => parseFloat(acc.distance.split(' ')[0]) <= distance[0]);
    }
    
    if (priceRange) {
      switch(priceRange) {
        case "low":
          results = results.filter(acc => parseInt(acc.price.split(' - ')[0].replace(/[^\d]/g, '')) < 1000);
          break;
        case "medium":
          results = results.filter(acc => {
            const minPrice = parseInt(acc.price.split(' - ')[0].replace(/[^\d]/g, ''));
            return minPrice >= 1000 && minPrice <= 3000;
          });
          break;
        case "high":
          results = results.filter(acc => parseInt(acc.price.split(' - ')[0].replace(/[^\d]/g, '')) > 3000);
          break;
      }
    }
    
    setSearchResults(results);
  };

  const resetFilters = () => {
    setAccommodationType("");
    setDistance([10]);
    setPriceRange("");
    setSearchResults(null);
  };

  // Function to get availability badge color
  const getAvailabilityColor = (availability: string) => {
    switch(availability) {
      case "high": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get availability text
  const getAvailabilityText = (availability: string) => {
    switch(availability) {
      case "high":
        return i18n.language === "en" ? "High Availability" : 
               i18n.language === "hi" ? "अधिक उपलब्धता" : 
               "जास्त उपलब्धता";
      case "medium":
        return i18n.language === "en" ? "Limited Availability" : 
               i18n.language === "hi" ? "सीमित उपलब्धता" : 
               "मर्यादित उपलब्धता";
      case "low":
        return i18n.language === "en" ? "Few Rooms Left" : 
               i18n.language === "hi" ? "कुछ ही कमरे बचे हैं" : 
               "काही खोल्या शिल्लक";
      default:
        return i18n.language === "en" ? "Unknown" : 
               i18n.language === "hi" ? "अज्ञात" : 
               "अज्ञात";
    }
  };

  // Function to render accommodation type icon
  const renderTypeIcon = (type: string) => {
    switch(type) {
      case "hotel": return <Hotel className="w-4 h-4" />;
      case "guesthouse": return <HomeIcon className="w-4 h-4" />;
      case "dharamshala": return <BedIcon className="w-4 h-4" />;
      case "tent_city": return <TentIcon className="w-4 h-4" />;
      case "ashram": return <HomeIcon className="w-4 h-4" />;
      default: return <BedIcon className="w-4 h-4" />;
    }
  };

  // Function to get type text
  const getTypeText = (type: string) => {
    switch(type) {
      case "hotel":
        return i18n.language === "en" ? "Hotel" : 
               i18n.language === "hi" ? "होटल" : 
               "हॉटेल";
      case "guesthouse":
        return i18n.language === "en" ? "Guest House" : 
               i18n.language === "hi" ? "गेस्ट हाउस" : 
               "गेस्ट हाउस";
      case "dharamshala":
        return i18n.language === "en" ? "Dharamshala" : 
               i18n.language === "hi" ? "धर्मशाला" : 
               "धर्मशाळा";
      case "tent_city":
        return i18n.language === "en" ? "Tent City" : 
               i18n.language === "hi" ? "टेंट सिटी" : 
               "टेंट सिटी";
      case "ashram":
        return i18n.language === "en" ? "Ashram" : 
               i18n.language === "hi" ? "आश्रम" : 
               "आश्रम";
      default:
        return type;
    }
  };

  // Translated labels
  const labels = {
    title: i18n.language === "en" ? "Accommodation Finder" : 
           i18n.language === "hi" ? "आवास खोजक" : 
           "निवास शोधक",
    distance: i18n.language === "en" ? "Distance from main site" : 
              i18n.language === "hi" ? "मुख्य स्थल से दूरी" : 
              "मुख्य स्थळापासून अंतर",
    search: i18n.language === "en" ? "Search" : 
            i18n.language === "hi" ? "खोजें" : 
            "शोधा",
    reset: i18n.language === "en" ? "Reset" : 
           i18n.language === "hi" ? "रीसेट" : 
           "रीसेट",
    km: i18n.language === "en" ? "km" : 
        i18n.language === "hi" ? "किमी" : 
        "किमी",
    results: i18n.language === "en" ? "Results" : 
             i18n.language === "hi" ? "परिणाम" : 
             "परिणाम",
    noResults: i18n.language === "en" ? "No accommodations found matching your criteria. Try adjusting your filters." : 
               i18n.language === "hi" ? "आपके मानदंडों से मिलते-जुलते कोई आवास नहीं मिला। अपने फ़िल्टर समायोजित करने का प्रयास करें।" : 
               "तुमच्या निकषांशी जुळणारे कोणतेही निवासस्थान आढळले नाही. तुमचे फिल्टर समायोजित करण्याचा प्रयत्न करा.",
    searchFirst: i18n.language === "en" ? "Search for accommodations using the filters above." : 
                 i18n.language === "hi" ? "ऊपर दिए गए फ़िल्टर का उपयोग करके आवास खोजें।" : 
                 "वरील फिल्टर वापरून निवासस्थानांचा शोध घ्या.",
    book: i18n.language === "en" ? "Book Now" : 
          i18n.language === "hi" ? "अभी बुक करें" : 
          "आता बुक करा",
    bookingTitle: i18n.language === "en" ? "Booking Request" : 
                  i18n.language === "hi" ? "बुकिंग अनुरोध" : 
                  "बुकिंग विनंती",
    checkIn: i18n.language === "en" ? "Check-in Date" : 
             i18n.language === "hi" ? "चेक-इन दिनांक" : 
             "चेक-इन तारीख",
    checkOut: i18n.language === "en" ? "Check-out Date" : 
              i18n.language === "hi" ? "चेक-आउट दिनांक" : 
              "चेक-आउट तारीख",
    guests: i18n.language === "en" ? "Number of Guests" : 
            i18n.language === "hi" ? "मेहमानों की संख्या" : 
            "अतिथींची संख्या",
    specialRequests: i18n.language === "en" ? "Special Requests" : 
                     i18n.language === "hi" ? "विशेष अनुरोध" : 
                     "विशेष विनंत्या",
    submit: i18n.language === "en" ? "Submit Request" : 
            i18n.language === "hi" ? "अनुरोध जमा करें" : 
            "विनंती सबमिट करा",
    cancel: i18n.language === "en" ? "Cancel" : 
            i18n.language === "hi" ? "रद्द करें" : 
            "रद्द करा"
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-[#FF7F00]/10">
        <CardTitle className="text-xl font-semibold text-[#FF7F00] flex items-center">
          <BedIcon className="w-5 h-5 mr-2" />
          {labels.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {i18n.language === "en" ? "Accommodation Type" : 
                 i18n.language === "hi" ? "आवास प्रकार" : 
                 "निवास प्रकार"}
              </label>
              <Select value={accommodationType} onValueChange={setAccommodationType}>
                <SelectTrigger>
                  <SelectValue placeholder={i18n.language === "en" ? "Select type" : 
                                           i18n.language === "hi" ? "प्रकार चुनें" : 
                                           "प्रकार निवडा"} />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">
                {labels.distance} ({distance[0]} {labels.km})
              </label>
              <Slider
                value={distance}
                onValueChange={setDistance}
                max={10}
                step={0.5}
                className="py-4"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">
                {i18n.language === "en" ? "Price Range" : 
                 i18n.language === "hi" ? "मूल्य श्रेणी" : 
                 "किंमत श्रेणी"}
              </label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder={i18n.language === "en" ? "Select price range" : 
                                           i18n.language === "hi" ? "मूल्य श्रेणी चुनें" : 
                                           "किंमत श्रेणी निवडा"} />
                </SelectTrigger>
                <SelectContent>
                  {priceOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={resetFilters}>
              {labels.reset}
            </Button>
            <Button className="bg-[#FF7F00] hover:bg-[#FF7F00]/80" onClick={handleSearch}>
              {labels.search}
            </Button>
          </div>
        </div>
        
        {searchResults ? (
          <div className="mt-6">
            <h3 className="font-medium text-lg mb-4">
              {labels.results} ({searchResults.length})
            </h3>
            
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {labels.noResults}
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map(accommodation => (
                  <Card key={accommodation.id} className="overflow-hidden border border-gray-200 hover:border-[#FF7F00]/50 transition-all">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 h-48 md:h-auto overflow-hidden bg-gray-100">
                        <img 
                          src={accommodation.image} 
                          alt={accommodation.name}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                      <div className="p-4 md:w-2/3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{accommodation.name}</h3>
                            <div className="flex items-center gap-1 mt-1">
                              {renderTypeIcon(accommodation.type)}
                              <span className="text-sm text-gray-600">{getTypeText(accommodation.type)}</span>
                            </div>
                          </div>
                          <Badge className={getAvailabilityColor(accommodation.availability)}>
                            {getAvailabilityText(accommodation.availability)}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            <span className="line-clamp-1">{accommodation.address}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <PhoneIcon className="w-4 h-4 mr-1" />
                            {accommodation.contactNumber}
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center">
                          <div className="bg-yellow-50 px-2 py-1 rounded text-yellow-700 text-sm font-medium">
                            {accommodation.rating} ★
                          </div>
                          <span className="text-xs text-gray-500 ml-2">
                            ({accommodation.reviews} {i18n.language === "en" ? "reviews" : 
                                                    i18n.language === "hi" ? "समीक्षाएँ" : 
                                                    "पुनरावलोकने"})
                          </span>
                          <div className="ml-3 flex-grow text-right">
                            <span className="font-semibold">{accommodation.price}</span>
                            <span className="text-xs text-gray-500 ml-1">
                              / {i18n.language === "en" ? "night" : 
                                 i18n.language === "hi" ? "रात" : 
                                 "रात्र"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-1">
                          {accommodation.amenities.map((amenity, index) => (
                            <span key={index} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs text-gray-700">
                              {amenity}
                            </span>
                          ))}
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            <MapPinIcon className="w-4 h-4 inline mr-1" />
                            {i18n.language === "en" ? "Distance from main site: " : 
                             i18n.language === "hi" ? "मुख्य स्थल से दूरी: " : 
                             "मुख्य स्थळापासून अंतर: "}
                            {accommodation.distance}
                          </div>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="bg-[#FF7F00] hover:bg-[#FF7F00]/80">
                                {labels.book}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{labels.bookingTitle}</DialogTitle>
                                <DialogDescription>
                                  {accommodation.name}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="checkIn" className="text-right">
                                    <CalendarIcon className="w-4 h-4 inline mr-1" />
                                    {labels.checkIn}
                                  </Label>
                                  <Input id="checkIn" type="date" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="checkOut" className="text-right">
                                    <CalendarIcon className="w-4 h-4 inline mr-1" />
                                    {labels.checkOut}
                                  </Label>
                                  <Input id="checkOut" type="date" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="guests" className="text-right">
                                    <UsersIcon className="w-4 h-4 inline mr-1" />
                                    {labels.guests}
                                  </Label>
                                  <Input id="guests" type="number" min="1" defaultValue="2" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="requests" className="text-right">
                                    {labels.specialRequests}
                                  </Label>
                                  <textarea id="requests" className="col-span-3 border rounded p-2"></textarea>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <div></div>
                                  <div className="flex items-center space-x-2 col-span-3">
                                    <Checkbox id="terms" />
                                    <label htmlFor="terms" className="text-sm text-gray-600">
                                      {i18n.language === "en" ? "I agree to the booking terms and conditions" : 
                                       i18n.language === "hi" ? "मैं बुकिंग नियमों और शर्तों से सहमत हूं" : 
                                       "मी बुकिंग नियम आणि अटींशी सहमत आहे"}
                                    </label>
                                  </div>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button variant="outline" className="mr-2">
                                  {labels.cancel}
                                </Button>
                                <Button className="bg-[#FF7F00] hover:bg-[#FF7F00]/80">
                                  <CreditCardIcon className="w-4 h-4 mr-1" />
                                  {labels.submit}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 mt-4">
            {labels.searchFirst}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
