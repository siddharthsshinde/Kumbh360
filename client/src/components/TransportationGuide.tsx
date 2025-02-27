
import { useTranslation } from "react-i18next";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrainIcon, 
  BusIcon, 
  CarIcon, 
  PlaneIcon,
  Clock,
  MapPinIcon,
  InfoIcon,
  AlertTriangleIcon
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function TransportationGuide() {
  const { i18n } = useTranslation();

  const transportInfo = {
    train: {
      title: i18n.language === "en" ? "By Train" : 
             i18n.language === "hi" ? "ट्रेन द्वारा" : "ट्रेनद्वारे",
      stations: [
        {
          name: i18n.language === "en" ? "Nashik Road Railway Station" : 
                i18n.language === "hi" ? "नासिक रोड रेलवे स्टेशन" : "नाशिक रोड रेल्वे स्टेशन",
          description: i18n.language === "en" ? "Main railway station connected to major cities" : 
                       i18n.language === "hi" ? "प्रमुख शहरों से जुड़ा मुख्य रेलवे स्टेशन" : 
                       "प्रमुख शहरांशी जोडलेले मुख्य रेल्वे स्टेशन",
          special: i18n.language === "en" ? "Special Kumbh Mela trains will run from Delhi, Mumbai, Kolkata, and Bengaluru" : 
                   i18n.language === "hi" ? "दिल्ली, मुंबई, कोलकाता और बेंगलुरु से विशेष कुंभ मेला ट्रेनें चलेंगी" : 
                   "दिल्ली, मुंबई, कोलकाता आणि बेंगळुरू येथून विशेष कुंभ मेळा ट्रेन चालतील",
          distance: "2.5 km"
        },
        {
          name: i18n.language === "en" ? "Devlali Railway Station" : 
                i18n.language === "hi" ? "देवलाली रेलवे स्टेशन" : "देवळाली रेल्वे स्टेशन",
          description: i18n.language === "en" ? "Secondary station with fewer connections" : 
                       i18n.language === "hi" ? "कम कनेक्शन वाला द्वितीयक स्टेशन" : 
                       "कमी कनेक्शन असलेले दुय्यम स्टेशन",
          distance: "8 km"
        }
      ]
    },
    bus: {
      title: i18n.language === "en" ? "By Bus" : 
             i18n.language === "hi" ? "बस द्वारा" : "बसद्वारे",
      stations: [
        {
          name: i18n.language === "en" ? "Nashik Central Bus Station" : 
                i18n.language === "hi" ? "नासिक सेंट्रल बस स्टेशन" : "नाशिक सेंट्रल बस स्टेशन",
          description: i18n.language === "en" ? "Main bus terminus with connections to all nearby cities" : 
                       i18n.language === "hi" ? "सभी निकटवर्ती शहरों से जुड़ा मुख्य बस टर्मिनस" : 
                       "सर्व जवळपासच्या शहरांशी जोडलेले मुख्य बस टर्मिनस",
          special: i18n.language === "en" ? "Extra buses will operate during peak Kumbh days" : 
                   i18n.language === "hi" ? "कुंभ के चरम दिनों के दौरान अतिरिक्त बसें चलेंगी" : 
                   "कुंभ मेळ्याच्या गर्दीच्या दिवसांमध्ये अतिरिक्त बस चालतील",
          distance: "1 km"
        },
        {
          name: i18n.language === "en" ? "Nashik Road Bus Stand" : 
                i18n.language === "hi" ? "नासिक रोड बस स्टैंड" : "नाशिक रोड बस स्टँड",
          description: i18n.language === "en" ? "Located near the railway station" : 
                       i18n.language === "hi" ? "रेलवे स्टेशन के पास स्थित" : 
                       "रेल्वे स्टेशनजवळ स्थित",
          distance: "2.8 km"
        }
      ]
    },
    car: {
      title: i18n.language === "en" ? "By Car" : 
             i18n.language === "hi" ? "कार द्वारा" : "कारद्वारे",
      routes: [
        {
          from: i18n.language === "en" ? "Mumbai to Nashik" : 
                i18n.language === "hi" ? "मुंबई से नासिक" : "मुंबई ते नाशिक",
          distance: "165 km",
          time: "3.5 hours",
          route: i18n.language === "en" ? "Mumbai-Nashik Highway (NH 160)" : 
                 i18n.language === "hi" ? "मुंबई-नासिक हाईवे (NH 160)" : 
                 "मुंबई-नाशिक महामार्ग (NH 160)",
          advisory: i18n.language === "en" ? "Heavy traffic expected during festival days" : 
                    i18n.language === "hi" ? "त्योहार के दिनों में भारी यातायात की उम्मीद है" : 
                    "सणाच्या दिवसांमध्ये जास्त वाहतूक अपेक्षित आहे"
        },
        {
          from: i18n.language === "en" ? "Pune to Nashik" : 
                i18n.language === "hi" ? "पुणे से नासिक" : "पुणे ते नाशिक",
          distance: "210 km",
          time: "4 hours",
          route: i18n.language === "en" ? "Pune-Nashik Highway (NH 60)" : 
                 i18n.language === "hi" ? "पुणे-नासिक हाईवे (NH 60)" : 
                 "पुणे-नाशिक महामार्ग (NH 60)"
        },
        {
          from: i18n.language === "en" ? "Aurangabad to Nashik" : 
                i18n.language === "hi" ? "औरंगाबाद से नासिक" : "औरंगाबाद ते नाशिक",
          distance: "225 km",
          time: "4.5 hours",
          route: i18n.language === "en" ? "Aurangabad-Nashik Highway" : 
                 i18n.language === "hi" ? "औरंगाबाद-नासिक हाईवे" : 
                 "औरंगाबाद-नाशिक महामार्ग"
        }
      ],
      parking: [
        {
          name: i18n.language === "en" ? "Main Kumbh Mela Parking Area" : 
                i18n.language === "hi" ? "मुख्य कुंभ मेला पार्किंग क्षेत्र" : 
                "मुख्य कुंभ मेळा पार्किंग क्षेत्र",
          capacity: "5000 vehicles",
          rate: i18n.language === "en" ? "₹100 per day" : "₹100 प्रति दिन",
          distance: i18n.language === "en" ? "1.5 km from main site" : 
                    i18n.language === "hi" ? "मुख्य स्थल से 1.5 किमी" : 
                    "मुख्य स्थळापासून 1.5 किमी"
        },
        {
          name: i18n.language === "en" ? "Satellite Parking - Zone 1" : 
                i18n.language === "hi" ? "सैटेलाइट पार्किंग - ज़ोन 1" : 
                "सॅटेलाइट पार्किंग - झोन 1",
          capacity: "3000 vehicles",
          rate: i18n.language === "en" ? "₹80 per day" : "₹80 प्रति दिन",
          distance: i18n.language === "en" ? "3 km from main site (with shuttle service)" : 
                    i18n.language === "hi" ? "मुख्य स्थल से 3 किमी (शटल सेवा के साथ)" : 
                    "मुख्य स्थळापासून 3 किमी (शटल सेवेसह)"
        }
      ]
    },
    air: {
      title: i18n.language === "en" ? "By Air" : 
             i18n.language === "hi" ? "हवाई मार्ग द्वारा" : "विमानाद्वारे",
      airports: [
        {
          name: i18n.language === "en" ? "Nashik Airport (Ozar Airport)" : 
                i18n.language === "hi" ? "नासिक हवाई अड्डा (ओझर हवाई अड्डा)" : 
                "नाशिक विमानतळ (ओझर विमानतळ)",
          description: i18n.language === "en" ? "Small domestic airport with limited flights" : 
                       i18n.language === "hi" ? "सीमित उड़ानों वाला छोटा घरेलू हवाई अड्डा" : 
                       "मर्यादित उड्डाणे असलेले छोटे देशांतर्गत विमानतळ",
          connections: i18n.language === "en" ? "Flights from Mumbai, Delhi (limited)" : 
                       i18n.language === "hi" ? "मुंबई, दिल्ली से उड़ानें (सीमित)" : 
                       "मुंबई, दिल्ली येथून उड्डाणे (मर्यादित)",
          distance: "20 km"
        },
        {
          name: i18n.language === "en" ? "Mumbai Airport" : 
                i18n.language === "hi" ? "मुंबई हवाई अड्डा" : "मुंबई विमानतळ",
          description: i18n.language === "en" ? "Major international airport" : 
                       i18n.language === "hi" ? "प्रमुख अंतरराष्ट्रीय हवाई अड्डा" : 
                       "प्रमुख आंतरराष्ट्रीय विमानतळ",
          connections: i18n.language === "en" ? "Connected to most major cities worldwide" : 
                       i18n.language === "hi" ? "दुनिया भर के अधिकांश प्रमुख शहरों से जुड़ा हुआ" : 
                       "जगभरातील बहुतेक प्रमुख शहरांशी जोडलेले",
          distance: "165 km"
        }
      ]
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-[#FF7F00]/10">
        <CardTitle className="text-xl font-semibold text-[#FF7F00] flex items-center">
          <BusIcon className="w-5 h-5 mr-2" />
          {i18n.language === "en" ? "Transportation Guide" : 
           i18n.language === "hi" ? "परिवहन मार्गदर्शिका" : 
           "वाहतूक मार्गदर्शक"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="train">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="train" className="flex items-center gap-1">
              <TrainIcon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {i18n.language === "en" ? "Train" : 
                 i18n.language === "hi" ? "ट्रेन" : "ट्रेन"}
              </span>
            </TabsTrigger>
            <TabsTrigger value="bus" className="flex items-center gap-1">
              <BusIcon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {i18n.language === "en" ? "Bus" : 
                 i18n.language === "hi" ? "बस" : "बस"}
              </span>
            </TabsTrigger>
            <TabsTrigger value="car" className="flex items-center gap-1">
              <CarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {i18n.language === "en" ? "Car" : 
                 i18n.language === "hi" ? "कार" : "कार"}
              </span>
            </TabsTrigger>
            <TabsTrigger value="air" className="flex items-center gap-1">
              <PlaneIcon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {i18n.language === "en" ? "Air" : 
                 i18n.language === "hi" ? "हवाई" : "विमान"}
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="train">
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200 flex items-start">
                <InfoIcon className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                <p className="text-sm text-blue-700">
                  {i18n.language === "en" ? "Special Kumbh Mela trains will operate with increased frequency. Book tickets in advance." : 
                   i18n.language === "hi" ? "विशेष कुंभ मेला ट्रेनें बढ़ी हुई आवृत्ति के साथ चलेंगी। अग्रिम टिकट बुक करें।" : 
                   "विशेष कुंभ मेळा ट्रेन वाढीव वारंवारतेसह चालतील. तिकिटे आधी बुक करा."}
                </p>
              </div>
              
              {transportInfo.train.stations.map((station, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{station.name}</h3>
                    <p className="text-gray-600 mb-3">{station.description}</p>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      <span>
                        {i18n.language === "en" ? "Distance to Kumbh site: " : 
                         i18n.language === "hi" ? "कुंभ स्थल से दूरी: " : 
                         "कुंभ स्थळापासून अंतर: "}
                        {station.distance}
                      </span>
                    </div>
                    {station.special && (
                      <div className="mt-3 bg-green-50 p-2 rounded-md border border-green-200">
                        <p className="text-sm text-green-700">{station.special}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="bus">
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200 flex items-start">
                <InfoIcon className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                <p className="text-sm text-blue-700">
                  {i18n.language === "en" ? "State transport and private buses will operate special services during Kumbh Mela." : 
                   i18n.language === "hi" ? "राज्य परिवहन और निजी बसें कुंभ मेले के दौरान विशेष सेवाएं चलाएंगी।" : 
                   "राज्य परिवहन आणि खाजगी बस कुंभ मेळ्यादरम्यान विशेष सेवा चालवतील."}
                </p>
              </div>
              
              {transportInfo.bus.stations.map((station, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{station.name}</h3>
                    <p className="text-gray-600 mb-3">{station.description}</p>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      <span>
                        {i18n.language === "en" ? "Distance to Kumbh site: " : 
                         i18n.language === "hi" ? "कुंभ स्थल से दूरी: " : 
                         "कुंभ स्थळापासून अंतर: "}
                        {station.distance}
                      </span>
                    </div>
                    {station.special && (
                      <div className="mt-3 bg-green-50 p-2 rounded-md border border-green-200">
                        <p className="text-sm text-green-700">{station.special}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="car">
            <div className="space-y-4">
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 flex items-start">
                <AlertTriangleIcon className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  {i18n.language === "en" ? "Traffic restrictions will be in place during peak days. Consider public transport for easier access." : 
                   i18n.language === "hi" ? "चरम दिनों के दौरान यातायात प्रतिबंध लागू होंगे। आसान पहुंच के लिए सार्वजनिक परिवहन पर विचार करें।" : 
                   "गर्दीच्या दिवसांमध्ये वाहतूक प्रतिबंध असतील. सोप्या प्रवेशासाठी सार्वजनिक वाहतूक वापरण्याचा विचार करा."}
                </p>
              </div>
              
              <Accordion type="single" collapsible>
                <AccordionItem value="routes">
                  <AccordionTrigger>
                    {i18n.language === "en" ? "Major Routes to Nashik" : 
                     i18n.language === "hi" ? "नासिक के लिए प्रमुख मार्ग" : 
                     "नाशिकला जाण्याचे प्रमुख मार्ग"}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {transportInfo.car.routes.map((route, index) => (
                        <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                          <h4 className="font-medium">{route.from}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm">
                            <div className="flex items-center text-gray-600">
                              <MapPinIcon className="w-4 h-4 mr-2" />
                              {route.route}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              {route.time}
                            </div>
                          </div>
                          <div className="text-gray-600 text-sm mt-1">
                            {i18n.language === "en" ? "Distance: " : 
                             i18n.language === "hi" ? "दूरी: " : 
                             "अंतर: "}
                            {route.distance}
                          </div>
                          {route.advisory && (
                            <div className="mt-2 bg-amber-50 p-2 rounded-md text-sm text-amber-700">
                              {route.advisory}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="parking">
                  <AccordionTrigger>
                    {i18n.language === "en" ? "Parking Information" : 
                     i18n.language === "hi" ? "पार्किंग जानकारी" : 
                     "पार्किंग माहिती"}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {transportInfo.car.parking.map((parking, index) => (
                        <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                          <h4 className="font-medium">{parking.name}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm">
                            <div className="flex items-center text-gray-600">
                              <InfoIcon className="w-4 h-4 mr-2" />
                              {i18n.language === "en" ? "Capacity: " : 
                               i18n.language === "hi" ? "क्षमता: " : 
                               "क्षमता: "}
                              {parking.capacity}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <MapPinIcon className="w-4 h-4 mr-2" />
                              {parking.distance}
                            </div>
                          </div>
                          <div className="text-gray-600 text-sm mt-1">
                            {i18n.language === "en" ? "Rate: " : 
                             i18n.language === "hi" ? "दर: " : 
                             "दर: "}
                            {parking.rate}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
          
          <TabsContent value="air">
            <div className="space-y-4">
              {transportInfo.air.airports.map((airport, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{airport.name}</h3>
                    <p className="text-gray-600 mb-3">{airport.description}</p>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      <span>
                        {i18n.language === "en" ? "Distance to Nashik city center: " : 
                         i18n.language === "hi" ? "नासिक शहर केंद्र से दूरी: " : 
                         "नाशिक शहर केंद्रापासून अंतर: "}
                        {airport.distance}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <PlaneIcon className="w-4 h-4 mr-2" />
                      <span>{airport.connections}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
