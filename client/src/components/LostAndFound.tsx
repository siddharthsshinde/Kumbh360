import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Clock, AlertTriangle, User, FileSearch, UserSearch } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Sample data for missing persons
const missingPersons = [
  {
    id: 1,
    name: "Rajesh Kumar",
    age: 42,
    gender: "Male",
    lastSeen: "Ramkund at 2:30 PM",
    description: "Wearing orange kurta, white dhoti. Height 5'8\". Speaks Hindi. Missing since March 19.",
    contactName: "Sunil Kumar (Son)",
    contactPhone: "+91 9876543210",
    lastLocation: "Ramkund",
    reportedAt: "March 19, 2025, 5:30 PM",
    photoUrl: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=150&h=150&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Priya Sharma",
    age: 28,
    gender: "Female",
    lastSeen: "Kalaram Temple at 11:15 AM",
    description: "Wearing yellow saree with red border. Height 5'4\". Speaks Hindi and English. Has a small birthmark on right hand.",
    contactName: "Vikram Sharma (Husband)",
    contactPhone: "+91 8765432109",
    lastLocation: "Kalaram Temple",
    reportedAt: "March 20, 2025, 1:20 PM",
    photoUrl: "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=150&h=150&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Arjun Patel",
    age: 65,
    gender: "Male",
    lastSeen: "Tapovan area at 9:45 AM",
    description: "Wearing white kurta pajama. Grey hair, glasses. Height 5'6\". Speaks Gujarati and Hindi. Has diabetes, needs medication.",
    contactName: "Meera Patel (Daughter)",
    contactPhone: "+91 7654321098",
    lastLocation: "Tapovan",
    reportedAt: "March 20, 2025, 11:10 AM",
    photoUrl: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=150&h=150&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Kavita Singh",
    age: 32,
    gender: "Female",
    lastSeen: "Food stalls near Godavari Ghat at 1:00 PM",
    description: "Wearing blue and white salwar kameez. Height 5'5\". Speaks Hindi. Was with her mother before separation.",
    contactName: "Ranjit Singh (Husband)",
    contactPhone: "+91 6543210987",
    lastLocation: "Godavari Ghat",
    reportedAt: "March 19, 2025, 4:15 PM",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&h=150&auto=format&fit=crop"
  }
];

// Sample data for found items
const foundItems = [
  {
    id: 1,
    itemType: "Mobile Phone",
    brand: "Samsung",
    location: "Ramkund Rest Area",
    foundTime: "March 20, 2025, 10:15 AM",
    description: "Black Samsung phone with red case",
    contactPoint: "Help Desk at Ramkund",
    status: "Unclaimed"
  },
  {
    id: 2,
    itemType: "Wallet",
    brand: "N/A",
    location: "Tapovan Food Court",
    foundTime: "March 19, 2025, 7:30 PM",
    description: "Brown leather wallet with some cash and ID cards",
    contactPoint: "Central Lost & Found Office",
    status: "Claimed"
  },
  {
    id: 3,
    itemType: "Bag",
    brand: "N/A",
    location: "Parking Area B",
    foundTime: "March 20, 2025, 11:45 AM",
    description: "Small red cloth bag with religious items",
    contactPoint: "Security Office at Parking Area B",
    status: "Unclaimed"
  },
  {
    id: 4,
    itemType: "Keys",
    brand: "N/A",
    location: "Kalaram Temple Entrance",
    foundTime: "March 20, 2025, 9:20 AM",
    description: "Set of 3 keys with a small Ganesha keychain",
    contactPoint: "Temple Office",
    status: "Unclaimed"
  }
];

// Information about lost and found centers
const helpCenters = [
  {
    id: 1,
    name: "Main Lost & Found Center",
    location: "Near Central Administration Block",
    coordinates: { lat: 19.9975, lng: 73.7898 },
    phone: "+91 253-2590761",
    timings: "24 hours",
    services: ["Item Registration", "Missing Persons", "Announcements"]
  },
  {
    id: 2,
    name: "Ramkund Help Desk",
    location: "Ramkund Rest Area",
    coordinates: { lat: 20.0041, lng: 73.7916 },
    phone: "+91 253-2590762",
    timings: "6 AM to 10 PM",
    services: ["Item Registration", "Missing Persons"]
  },
  {
    id: 3,
    name: "Tapovan Center",
    location: "Near Tapovan Police Outpost",
    coordinates: { lat: 19.9931, lng: 73.7741 },
    phone: "+91 253-2590763",
    timings: "6 AM to 9 PM",
    services: ["Item Registration", "Missing Persons"]
  },
  {
    id: 4,
    name: "Kalaram Temple Desk",
    location: "Temple Information Center",
    coordinates: { lat: 19.9967, lng: 73.7844 },
    phone: "+91 253-2590764",
    timings: "7 AM to 8 PM",
    services: ["Item Registration"]
  }
];

export function LostAndFound() {
  const [selectedTab, setSelectedTab] = useState("missing");
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-orange-600 to-yellow-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center">
              <UserSearch className="mr-2 h-6 w-6" />
              Lost and Found Services
            </CardTitle>
            <CardDescription className="text-white opacity-90 mt-1">
              Help reunite families and recover lost belongings during Kumbh Mela
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-white text-orange-700">24/7 Service</Badge>
        </div>
      </CardHeader>

      <Tabs defaultValue="missing" onValueChange={setSelectedTab} className="w-full">
        <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="missing" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Missing Persons</span>
            </TabsTrigger>
            <TabsTrigger value="found" className="flex items-center gap-1">
              <FileSearch className="h-4 w-4" />
              <span>Found Items</span>
            </TabsTrigger>
            <TabsTrigger value="centers" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Help Centers</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-4 px-6">
          <TabsContent value="missing" className="m-0">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missingPersons.map((person) => (
                  <div 
                    key={person.id} 
                    className="flex items-start border rounded-lg p-3 hover:bg-orange-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedPerson(person);
                      setDialogOpen(true);
                    }}
                  >
                    <Avatar className="h-16 w-16 border-2 border-orange-200 mr-4 flex-shrink-0">
                      <AvatarImage src={person.photoUrl} alt={person.name} />
                      <AvatarFallback className="bg-orange-100 text-orange-700">{person.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{person.name}</h3>
                          <p className="text-sm text-gray-500">
                            {person.age} years, {person.gender}
                          </p>
                        </div>
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          Missing
                        </Badge>
                      </div>
                      <p className="text-sm mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-500" /> 
                        Last seen: {person.lastSeen}
                      </p>
                      <p className="text-sm mt-1 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-500" /> 
                        Contact: {person.contactPhone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <h3 className="font-medium flex items-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                  Report a Missing Person
                </h3>
                <p className="text-sm mt-1">
                  Visit any Help Center or call the emergency hotline at <span className="font-semibold">+91 253-2590777</span> to report a missing person.
                  You can also approach any police personnel or volunteer with orange badge.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="found" className="m-0">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {foundItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{item.itemType}</h3>
                      <Badge className={item.status === "Unclaimed" ? 
                        "bg-green-100 text-green-800 border-green-200" : 
                        "bg-gray-100 text-gray-800 border-gray-200"
                      }>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-500" /> 
                        Found at: {item.location}
                      </p>
                      <p className="text-sm flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-500" /> 
                        {item.foundTime}
                      </p>
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-500" /> 
                        Claim at: {item.contactPoint}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium flex items-center">
                  <AlertTriangle className="h-4 w-4 text-blue-600 mr-2" />
                  Found an Item?
                </h3>
                <p className="text-sm mt-1">
                  Please submit any found items to the nearest Help Center or to security personnel.
                  Your honesty helps pilgrims recover their valuables.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="centers" className="m-0">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {helpCenters.map((center) => (
                  <div key={center.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{center.name}</h3>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {center.timings}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-gray-500" /> 
                      {center.location}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3 text-gray-500" /> 
                      {center.phone}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {center.services.map((service, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-50">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <h3 className="font-medium flex items-center">
                  <AlertTriangle className="h-4 w-4 text-emerald-600 mr-2" />
                  Emergency Contact
                </h3>
                <p className="text-sm mt-1">
                  For emergency situations, call the main helpline at <span className="font-semibold">+91 253-2590777</span> or
                  contact any police personnel or volunteer with orange badge.
                </p>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="border-t bg-gray-50 px-6 py-3">
        <p className="text-xs text-gray-500 w-full text-center">
          The Kumbh Mela administration is committed to helping reunite families and recover lost belongings.
          For urgent assistance, visit any help center or call the emergency hotline at <span className="font-semibold">+91 253-2590777</span>.
        </p>
      </CardFooter>

      {/* Detailed person dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Missing Person Details</DialogTitle>
            <DialogDescription>
              Please contact if you have any information
            </DialogDescription>
          </DialogHeader>
          
          {selectedPerson && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Avatar className="h-24 w-24 border-2 border-orange-200">
                  <AvatarImage src={selectedPerson.photoUrl} alt={selectedPerson.name} />
                  <AvatarFallback className="bg-orange-100 text-orange-700">{selectedPerson.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                
                <div className="text-center sm:text-left">
                  <h3 className="font-medium text-lg">{selectedPerson.name}</h3>
                  <p className="text-gray-500">
                    {selectedPerson.age} years, {selectedPerson.gender}
                  </p>
                  <Badge className="mt-2 bg-red-100 text-red-800 border-red-200">
                    Missing since {selectedPerson.reportedAt}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium">Description</div>
                <p className="text-sm text-gray-700">{selectedPerson.description}</p>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium">Last Seen</div>
                <p className="text-sm flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-500" /> 
                  {selectedPerson.lastSeen}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium">Contact Information</div>
                <p className="text-sm">{selectedPerson.contactName}</p>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 w-full justify-center" 
                  onClick={() => window.open(`tel:${selectedPerson.contactPhone}`)}
                >
                  <Phone className="h-4 w-4" />
                  {selectedPerson.contactPhone}
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-center gap-2 flex flex-col sm:flex-row">
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Report Information
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}