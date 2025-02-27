
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Info, 
  MapPin, 
  History, 
  Camera, 
  Route, 
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface VirtualTourLocation {
  id: string;
  name: string;
  description: string;
  significance: string;
  history: string;
  location: string;
  images: string[];
  panorama?: string;
}

export function VirtualTours() {
  const { i18n } = useTranslation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);

  // Sample data for virtual tours
  const tourLocations: VirtualTourLocation[] = [
    {
      id: "ramkund",
      name: i18n.language === "en" ? "Ramkund" : 
            i18n.language === "hi" ? "रामकुंड" : "रामकुंड",
      description: i18n.language === "en" ? "Ramkund is a sacred bathing ghat on the Godavari river, believed to be where Lord Ram bathed during his exile." : 
                   i18n.language === "hi" ? "रामकुंड गोदावरी नदी पर एक पवित्र स्नान घाट है, जहां माना जाता है कि भगवान राम ने अपने वनवास के दौरान स्नान किया था।" : 
                   "रामकुंड गोदावरी नदीवरील एक पवित्र स्नान घाट आहे, जिथे भगवान रामाने त्यांच्या वनवासादरम्यान स्नान केले असे मानले जाते.",
      significance: i18n.language === "en" ? "Ramkund is of great religious importance for Hindus, especially during Kumbh Mela. It is believed that taking a dip in Ramkund washes away sins." : 
                    i18n.language === "hi" ? "रामकुंड हिंदुओं के लिए, विशेष रूप से कुंभ मेले के दौरान, बड़े धार्मिक महत्व का है। माना जाता है कि रामकुंड में डुबकी लगाने से पाप धुल जाते हैं।" : 
                    "रामकुंड हिंदूंसाठी, विशेषतः कुंभ मेळ्यादरम्यान, मोठ्या धार्मिक महत्त्वाचे आहे. रामकुंड मध्ये स्नान केल्याने पाप धुतले जातात असे मानले जाते.",
      history: i18n.language === "en" ? "The history of Ramkund dates back to ancient times, and it is mentioned in several Hindu scriptures. It has been a central site for the Kumbh Mela for centuries." : 
               i18n.language === "hi" ? "रामकुंड का इतिहास प्राचीन काल से है, और इसका उल्लेख कई हिंदू शास्त्रों में किया गया है। यह सदियों से कुंभ मेले के लिए एक केंद्रीय स्थल रहा है।" : 
               "रामकुंडचा इतिहास प्राचीन काळापासून आहे, आणि अनेक हिंदू शास्त्रांमध्ये याचा उल्लेख आहे. हे शतकानुशतके कुंभ मेळ्यासाठी एक केंद्रीय स्थळ राहिले आहे.",
      location: i18n.language === "en" ? "Located in the heart of Nashik, on the banks of Godavari river" : 
                i18n.language === "hi" ? "नासिक के मध्य में, गोदावरी नदी के तट पर स्थित" : 
                "नाशिकच्या मध्यभागी, गोदावरी नदीच्या तीरावर स्थित",
      images: [
        "https://images.unsplash.com/photo-1623422725733-5f33f1a27b6d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFta3VuZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1626196340527-2a41e6b6a0f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmFzaGlrfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1626196231716-fd0224c5e475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bmFzaGlrfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
      ],
      panorama: "https://images.unsplash.com/photo-1626196340527-2a41e6b6a0f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmFzaGlrfGVufDB8fDB8fHww&auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: "trimbakeshwar",
      name: i18n.language === "en" ? "Trimbakeshwar Temple" : 
            i18n.language === "hi" ? "त्र्यंबकेश्वर मंदिर" : "त्र्यंबकेश्वर मंदिर",
      description: i18n.language === "en" ? "Trimbakeshwar is an ancient Hindu temple dedicated to Lord Shiva and is one of the 12 Jyotirlingas." : 
                   i18n.language === "hi" ? "त्र्यंबकेश्वर भगवान शिव को समर्पित एक प्राचीन हिंदू मंदिर है और 12 ज्योतिर्लिंगों में से एक है।" : 
                   "त्र्यंबकेश्वर भगवान शिवाला समर्पित एक प्राचीन हिंदू मंदिर आहे आणि 12 ज्योतिर्लिंगांपैकी एक आहे.",
      significance: i18n.language === "en" ? "Trimbakeshwar is considered one of the holiest Shiva temples in India. The Godavari River originates near this temple." : 
                    i18n.language === "hi" ? "त्र्यंबकेश्वर को भारत के सबसे पवित्र शिव मंदिरों में से एक माना जाता है। गोदावरी नदी इस मंदिर के पास से निकलती है।" : 
                    "त्र्यंबकेश्वर भारतातील सर्वात पवित्र शिव मंदिरांपैकी एक मानले जाते. गोदावरी नदी या मंदिराजवळून उगम पावते.",
      history: i18n.language === "en" ? "The temple was built during the Peshwa rule in the 18th century, though the original structure is believed to be much older. It has black stone architecture and a unique three-faced Shiva lingam." : 
               i18n.language === "hi" ? "मंदिर का निर्माण 18वीं शताब्दी में पेशवा शासन के दौरान हुआ था, हालांकि मूल संरचना बहुत पुरानी मानी जाती है। इसमें काले पत्थर की वास्तुकला और एक अनोखा तीन-मुखी शिव लिंगम है।" : 
               "मंदिर 18 व्या शतकात पेशवा राजवटीत बांधले गेले, जरी मूळ संरचना खूप जुनी असल्याचे मानले जाते. त्यात काळ्या दगडाची वास्तुकला आणि एक अनोखी तीन-मुखी शिवलिंग आहे.",
      location: i18n.language === "en" ? "Located in Trimbak, about 30 km from Nashik city" : 
                i18n.language === "hi" ? "त्र्यंबक में स्थित, नासिक शहर से लगभग 30 किमी दूर" : 
                "त्र्यंबक येथे, नाशिक शहरापासून सुमारे 30 किमी अंतरावर स्थित",
      images: [
        "https://images.unsplash.com/photo-1626196231478-22353a606fc1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bmFzaGlrfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1622397445690-b3580e1ddceb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dHJpbWJha2VzaHdhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1625301840055-7b4f6e6ae1d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHJpbWJha2VzaHdhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
      ],
      panorama: "https://images.unsplash.com/photo-1622397445690-b3580e1ddceb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dHJpbWJha2VzaHdhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: "panchavati",
      name: i18n.language === "en" ? "Panchavati" : 
            i18n.language === "hi" ? "पंचवटी" : "पंचवटी",
      description: i18n.language === "en" ? "Panchavati is a sacred area in Nashik where Lord Ram, Sita, and Laxman stayed during their exile. It features five banyan trees." : 
                   i18n.language === "hi" ? "पंचवटी नासिक का एक पवित्र क्षेत्र है जहां भगवान राम, सीता और लक्ष्मण अपने वनवास के दौरान रहे थे। इसमें पांच बरगद के पेड़ हैं।" : 
                   "पंचवटी नाशिकचा एक पवित्र भाग आहे जिथे भगवान राम, सीता आणि लक्ष्मण त्यांच्या वनवासादरम्यान राहिले होते. यात पाच वडाची झाडे आहेत.",
      significance: i18n.language === "en" ? "Panchavati is of immense religious importance as it is mentioned in the Ramayana and is considered the place where Sita was abducted by Ravana." : 
                    i18n.language === "hi" ? "पंचवटी का अत्यधिक धार्मिक महत्व है क्योंकि इसका उल्लेख रामायण में है और इसे वह स्थान माना जाता है जहां रावण ने सीता का अपहरण किया था।" : 
                    "पंचवटीचे अत्यंत धार्मिक महत्त्व आहे कारण रामायणात याचा उल्लेख आहे आणि सीतेचे रावणाने अपहरण केलेल्या जागा म्हणून हे ओळखले जाते.",
      history: i18n.language === "en" ? "Panchavati's association with the Ramayana makes it one of the most ancient pilgrimage sites in India. The area gets its name from the five banyan trees that are said to have existed during Lord Rama's time." : 
               i18n.language === "hi" ? "रामायण के साथ पंचवटी का संबंध इसे भारत के सबसे प्राचीन तीर्थ स्थलों में से एक बनाता है। इस क्षेत्र का नाम पांच बरगद के पेड़ों से पड़ा है जो भगवान राम के समय में मौजूद थे।" : 
               "रामायणाशी पंचवटीचा संबंध याला भारतातील सर्वात प्राचीन तीर्थक्षेत्रांपैकी एक बनवतो. भगवान रामाच्या काळात अस्तित्वात असलेल्या पाच वडाच्या झाडांवरून या क्षेत्राचे नाव पडले आहे.",
      location: i18n.language === "en" ? "Located on the banks of the Godavari river in Nashik" : 
                i18n.language === "hi" ? "नासिक में गोदावरी नदी के तट पर स्थित" : 
                "नाशिकमध्ये गोदावरी नदीच्या तीरावर स्थित",
      images: [
        "https://images.unsplash.com/photo-1626196230397-4d5120ea4d91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG5hc2hpa3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1532555838504-caf1894e1b6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fG5hc2hpa3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1626196231418-de2f25537747?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fG5hc2hpa3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
      ],
      panorama: "https://images.unsplash.com/photo-1626196230397-4d5120ea4d91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG5hc2hpa3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=1200&q=80"
    }
  ];

  // Navigation for image gallery
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev === tourLocations[activeTab].images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? tourLocations[activeTab].images.length - 1 : prev - 1));
  };

  // Set default active tab
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-[#FF7F00]/10">
        <CardTitle className="text-xl font-semibold text-[#FF7F00] flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          {i18n.language === "en" ? "Virtual Tours of Holy Sites" : 
           i18n.language === "hi" ? "पवित्र स्थलों के आभासी भ्रमण" : 
           "पवित्र स्थळांचे आभासी दौरे"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue={tourLocations[0].id} onValueChange={(value) => {
          const index = tourLocations.findIndex(loc => loc.id === value);
          setActiveTab(index);
          setActiveImageIndex(0);
        }}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            {tourLocations.map((location) => (
              <TabsTrigger key={location.id} value={location.id}>
                {location.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {tourLocations.map((location, index) => (
            <TabsContent key={location.id} value={location.id}>
              <div className="space-y-4">
                {/* Image Gallery */}
                <div className="relative">
                  <div className="aspect-video bg-gray-100 overflow-hidden rounded-lg relative">
                    <img 
                      src={showFullImage ? location.panorama || location.images[activeImageIndex] : location.images[activeImageIndex]} 
                      alt={location.name}
                      className={`w-full h-full object-cover transition-transform ${showFullImage ? 'cursor-zoom-out' : 'cursor-zoom-in hover:scale-105'}`}
                      onClick={() => setShowFullImage(!showFullImage)}
                    />
                    {!showFullImage && (
                      <>
                        <Button 
                          variant="ghost" 
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 h-auto bg-white/80 hover:bg-white/90 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto bg-white/80 hover:bg-white/90 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                          {i18n.language === "en" ? "Click to view 360° panorama" : 
                           i18n.language === "hi" ? "360° पैनोरमा देखने के लिए क्लिक करें" : 
                           "360° पॅनोरमा पाहण्यासाठी क्लिक करा"}
                        </div>
                      </>
                    )}
                    {showFullImage && (
                      <Button 
                        variant="outline" 
                        className="absolute top-2 right-2 bg-white/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFullImage(false);
                        }}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        {i18n.language === "en" ? "Exit 360° View" : 
                         i18n.language === "hi" ? "360° दृश्य से बाहर निकलें" : 
                         "360° दृश्य मधून बाहेर पडा"}
                      </Button>
                    )}
                  </div>
                  
                  {/* Thumbnail navigation */}
                  <div className="flex justify-center mt-2 space-x-2">
                    {location.images.map((image, imgIndex) => (
                      <div 
                        key={imgIndex}
                        className={`w-12 h-12 rounded-md overflow-hidden cursor-pointer border-2 ${activeImageIndex === imgIndex ? 'border-[#FF7F00]' : 'border-transparent'}`}
                        onClick={() => setActiveImageIndex(imgIndex)}
                      >
                        <img 
                          src={image} 
                          alt={`${location.name} thumbnail ${imgIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Information Tabs */}
                <Tabs defaultValue="overview" className="mt-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview" className="flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {i18n.language === "en" ? "Overview" : 
                         i18n.language === "hi" ? "अवलोकन" : 
                         "विहंगावलोकन"}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="significance" className="flex items-center gap-1">
                      <Route className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {i18n.language === "en" ? "Significance" : 
                         i18n.language === "hi" ? "महत्व" : 
                         "महत्त्व"}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-1">
                      <History className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {i18n.language === "en" ? "History" : 
                         i18n.language === "hi" ? "इतिहास" : 
                         "इतिहास"}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="visit" className="flex items-center gap-1">
                      <Camera className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {i18n.language === "en" ? "Visit" : 
                         i18n.language === "hi" ? "यात्रा" : 
                         "भेट"}
                      </span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="p-4 bg-gray-50 rounded-md mt-2">
                    <h3 className="font-semibold text-lg mb-2">{location.name}</h3>
                    <p>{location.description}</p>
                    <div className="mt-3 flex items-start">
                      <MapPin className="w-5 h-5 mr-2 mt-0.5 text-gray-600" />
                      <p className="text-gray-600">{location.location}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="significance" className="p-4 bg-gray-50 rounded-md mt-2">
                    <h3 className="font-semibold text-lg mb-2">
                      {i18n.language === "en" ? "Religious Significance" : 
                       i18n.language === "hi" ? "धार्मिक महत्व" : 
                       "धार्मिक महत्त्व"}
                    </h3>
                    <p>{location.significance}</p>
                  </TabsContent>
                  
                  <TabsContent value="history" className="p-4 bg-gray-50 rounded-md mt-2">
                    <h3 className="font-semibold text-lg mb-2">
                      {i18n.language === "en" ? "Historical Background" : 
                       i18n.language === "hi" ? "ऐतिहासिक पृष्ठभूमि" : 
                       "ऐतिहासिक पार्श्वभूमी"}
                    </h3>
                    <p>{location.history}</p>
                  </TabsContent>
                  
                  <TabsContent value="visit" className="p-4 bg-gray-50 rounded-md mt-2">
                    <h3 className="font-semibold text-lg mb-2">
                      {i18n.language === "en" ? "Visiting Information" : 
                       i18n.language === "hi" ? "यात्रा जानकारी" : 
                       "भेटीची माहिती"}
                    </h3>
                    <ul className="space-y-2 mt-2">
                      <li className="flex items-start">
                        <span className="text-[#FF7F00] font-bold mr-2">•</span>
                        <span>
                          {i18n.language === "en" ? "Best time to visit: During morning or evening, especially during non-peak Kumbh days" : 
                           i18n.language === "hi" ? "यात्रा का सबसे अच्छा समय: सुबह या शाम के दौरान, विशेष रूप से गैर-शिखर कुंभ दिनों के दौरान" : 
                           "भेट देण्याचा सर्वोत्तम वेळ: सकाळी किंवा संध्याकाळी, विशेषतः कुंभाच्या गर्दीच्या दिवसांशिवाय"}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#FF7F00] font-bold mr-2">•</span>
                        <span>
                          {i18n.language === "en" ? "Dress code: Modest attire is recommended. Shorts and sleeveless tops are discouraged." : 
                           i18n.language === "hi" ? "पोशाक संहिता: सादे परिधान की सिफारिश की जाती है। शॉर्ट्स और बिना बाजू के टॉप की अनुशंसा नहीं की जाती है।" : 
                           "पोशाख संहिता: साधी पोशाख करण्याची शिफारस केली जाते. शॉर्ट्स आणि बिनबाह्यांचे टॉप चुकीचे मानले जातात."}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#FF7F00] font-bold mr-2">•</span>
                        <span>
                          {i18n.language === "en" ? "Photography: Usually allowed in outer areas, but may be restricted in certain sacred spots" : 
                           i18n.language === "hi" ? "फोटोग्राफी: आमतौर पर बाहरी क्षेत्रों में अनुमति दी जाती है, लेकिन कुछ पवित्र स्थानों में प्रतिबंधित हो सकती है" : 
                           "फोटोग्राफी: सामान्यतः बाहेरील भागात परवानगी आहे, परंतु काही पवित्र ठिकाणी मर्यादित असू शकते"}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#FF7F00] font-bold mr-2">•</span>
                        <span>
                          {i18n.language === "en" ? "Special arrangements: During Kumbh Mela 2025, additional facilities will be available" : 
                           i18n.language === "hi" ? "विशेष व्यवस्था: कुंभ मेला 2025 के दौरान, अतिरिक्त सुविधाएं उपलब्ध होंगी" : 
                           "विशेष व्यवस्था: कुंभ मेळा 2025 दरम्यान, अतिरिक्त सुविधा उपलब्ध असतील"}
                        </span>
                      </li>
                    </ul>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
