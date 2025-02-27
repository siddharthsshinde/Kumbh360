
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, MapPinIcon, UsersIcon, Clock } from "lucide-react";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  attendees?: string;
}

export function EventSchedule() {
  const { t, i18n } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState<string>("february");
  
  // Event data organized by month
  const eventData: Record<string, Event[]> = {
    february: [
      {
        id: 1,
        title: i18n.language === "en" ? "Makar Sankranti Holy Bath" : 
               i18n.language === "hi" ? "मकर संक्रांति स्नान" : "मकर संक्रांती स्नान",
        date: "14 February 2025",
        time: "05:00 - 13:00",
        location: "Ramkund",
        description: i18n.language === "en" ? "The first sacred bath of Kumbh Mela 2025" : 
                     i18n.language === "hi" ? "कुंभ मेला 2025 का पहला पवित्र स्नान" : 
                     "कुंभ मेळा 2025 चे पहिले पवित्र स्नान",
        category: "Major Bath",
        attendees: "500,000+"
      },
      {
        id: 2,
        title: i18n.language === "en" ? "Opening Ceremony" : 
               i18n.language === "hi" ? "उद्घाटन समारोह" : "उद्घाटन समारंभ",
        date: "12 February 2025",
        time: "10:00 - 12:00",
        location: "Main Stage",
        description: i18n.language === "en" ? "Official inauguration of Kumbh Mela 2025" : 
                     i18n.language === "hi" ? "कुंभ मेला 2025 का आधिकारिक उद्घाटन" : 
                     "कुंभ मेळा 2025 चे अधिकृत उद्घाटन",
        category: "Ceremony"
      },
      {
        id: 3,
        title: i18n.language === "en" ? "Devotional Music Night" : 
               i18n.language === "hi" ? "भक्ति संगीत रात्रि" : "भक्ती संगीत रात्र",
        date: "18 February 2025",
        time: "19:00 - 22:00",
        location: "Cultural Pavilion",
        description: i18n.language === "en" ? "An evening of devotional songs and music" : 
                     i18n.language === "hi" ? "भक्ति गीतों और संगीत की शाम" : 
                     "भक्ती गीत आणि संगीताची संध्याकाळ",
        category: "Cultural"
      }
    ],
    march: [
      {
        id: 4,
        title: i18n.language === "en" ? "Paush Purnima Snan" : 
               i18n.language === "hi" ? "पौष पूर्णिमा स्नान" : "पौष पौर्णिमा स्नान",
        date: "05 March 2025",
        time: "04:00 - 12:00",
        location: "Godavari Ghat",
        description: i18n.language === "en" ? "Second major sacred bath of Kumbh Mela" : 
                     i18n.language === "hi" ? "कुंभ मेला का दूसरा बड़ा पवित्र स्नान" : 
                     "कुंभ मेळाचे दुसरे मोठे पवित्र स्नान",
        category: "Major Bath",
        attendees: "800,000+"
      },
      {
        id: 5,
        title: i18n.language === "en" ? "Akharas Procession" : 
               i18n.language === "hi" ? "अखाड़ों की शोभायात्रा" : "अखाड्यांची मिरवणूक",
        date: "10 March 2025",
        time: "09:00 - 14:00",
        location: "Main Road",
        description: i18n.language === "en" ? "Grand procession of different Akharas" : 
                     i18n.language === "hi" ? "विभिन्न अखाड़ों की भव्य शोभायात्रा" : 
                     "विविध अखाड्यांची भव्य मिरवणूक",
        category: "Procession"
      }
    ],
    april: [
      {
        id: 6,
        title: i18n.language === "en" ? "Maha Shivratri Snan" : 
               i18n.language === "hi" ? "महा शिवरात्रि स्नान" : "महा शिवरात्री स्नान",
        date: "10 April 2025",
        time: "03:00 - 15:00",
        location: "All Ghats",
        description: i18n.language === "en" ? "Most auspicious bath during Maha Shivratri" : 
                     i18n.language === "hi" ? "महा शिवरात्रि के दौरान सबसे शुभ स्नान" : 
                     "महा शिवरात्री दरम्यान सर्वात शुभ स्नान",
        category: "Major Bath",
        attendees: "1,200,000+"
      },
      {
        id: 7,
        title: i18n.language === "en" ? "Spiritual Discourse Series" : 
               i18n.language === "hi" ? "आध्यात्मिक प्रवचन श्रृंखला" : "आध्यात्मिक प्रवचन मालिका",
        date: "15-20 April 2025",
        time: "10:00 - 12:00",
        location: "Knowledge Tent",
        description: i18n.language === "en" ? "Daily spiritual talks by renowned saints" : 
                     i18n.language === "hi" ? "प्रसिद्ध संतों द्वारा दैनिक आध्यात्मिक वार्ता" : 
                     "प्रसिद्ध संतांद्वारे दैनिक आध्यात्मिक व्याख्याने",
        category: "Spiritual"
      }
    ]
  };

  // Get events for the selected month
  const events = eventData[selectedMonth] || [];

  // Group events by category
  const eventsByCategory: Record<string, Event[]> = {};
  events.forEach(event => {
    if (!eventsByCategory[event.category]) {
      eventsByCategory[event.category] = [];
    }
    eventsByCategory[event.category].push(event);
  });

  const categories = Object.keys(eventsByCategory);

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-[#FF7F00]/10">
        <CardTitle className="text-xl font-semibold text-[#FF7F00] flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2" />
          {i18n.language === "en" ? "Kumbh Mela Events Schedule" : 
           i18n.language === "hi" ? "कुंभ मेला कार्यक्रम अनुसूची" : 
           "कुंभ मेळा कार्यक्रम वेळापत्रक"}
        </CardTitle>
        <div className="mt-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="february">
                {i18n.language === "en" ? "February 2025" : 
                 i18n.language === "hi" ? "फरवरी 2025" : 
                 "फेब्रुवारी 2025"}
              </SelectItem>
              <SelectItem value="march">
                {i18n.language === "en" ? "March 2025" : 
                 i18n.language === "hi" ? "मार्च 2025" : 
                 "मार्च 2025"}
              </SelectItem>
              <SelectItem value="april">
                {i18n.language === "en" ? "April 2025" : 
                 i18n.language === "hi" ? "अप्रैल 2025" : 
                 "एप्रिल 2025"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {events.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            {i18n.language === "en" ? "No events scheduled for this month" : 
             i18n.language === "hi" ? "इस महीने के लिए कोई कार्यक्रम निर्धारित नहीं है" : 
             "या महिन्यासाठी कोणतेही कार्यक्रम निर्धारित केलेले नाहीत"}
          </div>
        ) : (
          <Tabs defaultValue={categories[0]}>
            <TabsList className="w-full flex overflow-x-auto mb-4">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="flex-shrink-0">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map(category => (
              <TabsContent key={category} value={category}>
                <div className="space-y-4">
                  {eventsByCategory[category].map(event => (
                    <Card key={event.id} className="border border-gray-200 hover:border-[#FF7F00]/50 transition-colors">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {event.date}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {event.time}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPinIcon className="w-4 h-4 mr-2" />
                            {event.location}
                          </div>
                          {event.attendees && (
                            <div className="flex items-center text-gray-600">
                              <UsersIcon className="w-4 h-4 mr-2" />
                              {event.attendees}
                            </div>
                          )}
                        </div>
                        <p className="mt-3 text-gray-700">{event.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
