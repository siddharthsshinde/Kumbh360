
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

import type { NewsItem } from "@shared/types";

export function NewsWidget() {
  const { i18n, t } = useTranslation();
  const { data: newsItems, isLoading } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Filter news by current language
  const filteredNews = newsItems?.filter(
    item => item.language === i18n.language || item.language === "all"
  ) || [];

  // Add Prayagraj Kumbh Mela news with categories
  const prayagrajNews = {
    en: [
      {
        id: 101,
        title: "Prayagraj Kumbh Mela 2025 Preparations Begin",
        content: "Officials have started preparations for the grand Prayagraj Kumbh Mela 2025. New bathing ghats and improved infrastructure are being planned.",
        language: "en",
        timestamp: new Date().toISOString(),
        category: "Event",
        imageUrl: "https://images.unsplash.com/photo-1623067228220-44c899ffa5d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2400&q=80"
      },
      {
        id: 102,
        title: "Special Train Services for Prayagraj Kumbh",
        content: "Indian Railways has announced special train services connecting major cities to Prayagraj for the upcoming Kumbh Mela in the year 2025.",
        language: "en",
        timestamp: new Date().toISOString(),
        category: "Transport",
        imageUrl: "https://images.unsplash.com/photo-1535535112387-56ffe8db21ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2400&q=80"
      },
      {
        id: 103,
        title: "Cultural Programs Planned for Prayagraj Kumbh",
        content: "A series of cultural programs showcasing India's diverse heritage will be organized during the Prayagraj Kumbh Mela 2025.",
        language: "en",
        timestamp: new Date().toISOString(),
        category: "Culture",
        imageUrl: "https://images.unsplash.com/photo-1577427401259-1bbae47dce6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2400&q=80"
      },
      {
        id: 104,
        title: "EMERGENCY: Crowd Management Alert at Sangam Area",
        content: "Authorities have issued a crowd management alert for the Sangam area due to unexpected high turnout. Visitors are advised to follow official instructions.",
        language: "en",
        timestamp: new Date().toISOString(),
        category: "Emergency",
        imageUrl: "https://images.unsplash.com/photo-1621958435240-9cfccb117779?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2400&q=80"
      }
    ],
    hi: [
      {
        id: 105,
        title: "प्रयागराज कुंभ मेला 2025 की तैयारियां शुरू",
        content: "अधिकारियों ने भव्य प्रयागराज कुंभ मेला 2025 की तैयारियां शुरू कर दी हैं। नए स्नान घाट और बेहतर बुनियादी ढांचे की योजना बनाई जा रही है।",
        language: "hi",
        timestamp: new Date().toISOString(),
        category: "Event",
        imageUrl: "https://images.unsplash.com/photo-1623067228220-44c899ffa5d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2400&q=80"
      },
      {
        id: 106,
        title: "प्रयागराज कुंभ के लिए विशेष ट्रेन सेवाएं",
        content: "भारतीय रेलवे ने आगामी कुंभ मेले के लिए प्रमुख शहरों को प्रयागराज से जोड़ने वाली विशेष ट्रेन सेवाओं की घोषणा की है।",
        language: "hi",
        timestamp: new Date().toISOString(),
        category: "Transport",
        imageUrl: "https://images.unsplash.com/photo-1535535112387-56ffe8db21ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2400&q=80"
      },
      {
        id: 107,
        title: "आपातकालीन: संगम क्षेत्र में भीड़ प्रबंधन अलर्ट",
        content: "अप्रत्याशित अधिक भीड़ के कारण अधिकारियों ने संगम क्षेत्र के लिए भीड़ प्रबंधन अलर्ट जारी किया है। आगंतुकों को आधिकारिक निर्देशों का पालन करने की सलाह दी जाती है।",
        language: "hi",
        timestamp: new Date().toISOString(),
        category: "Emergency",
        imageUrl: "https://images.unsplash.com/photo-1621958435240-9cfccb117779?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2400&q=80"
      }
    ],
    mr: [
      {
        id: 108,
        title: "प्रयागराज कुंभ मेळा 2025 ची तयारी सुरू",
        content: "अधिकाऱ्यांनी भव्य प्रयागराज कुंभ मेळा 2025 च्या तयारीला सुरुवात केली आहे. नवीन स्नान घाट आणि सुधारित पायाभूत सुविधांचे नियोजन केले जात आहे.",
        language: "mr",
        timestamp: new Date().toISOString(),
        category: "Event",
        imageUrl: "https://images.unsplash.com/photo-1623067228220-44c899ffa5d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2400&q=80"
      },
      {
        id: 109,
        title: "आपत्कालीन: संगम क्षेत्रात गर्दी व्यवस्थापन सतर्कता",
        content: "अनपेक्षित अधिक गर्दीमुळे अधिकाऱ्यांनी संगम क्षेत्रासाठी गर्दी व्यवस्थापन सतर्कता जारी केली आहे. भेट देणाऱ्यांना अधिकृत सूचनांचे पालन करण्याचा सल्ला देण्यात आला आहे.",
        language: "mr",
        timestamp: new Date().toISOString(),
        category: "Emergency",
        imageUrl: "https://images.unsplash.com/photo-1621958435240-9cfccb117779?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2400&q=80"
      }
    ]
  };

  // Add news based on selected language
  const allNews = [...filteredNews, ...(prayagrajNews[i18n.language as keyof typeof prayagrajNews] || [])];

  // Group news by category
  const groupedNews = allNews.reduce((acc, news) => {
    const category = news.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(news);
    return acc;
  }, {} as Record<string, NewsItem[]>);

  // Emergency news should always be first
  const categories = Object.keys(groupedNews).sort((a, b) => {
    if (a === "Emergency") return -1;
    if (b === "Emergency") return 1;
    return 0;
  });

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "Emergency": 
        return { 
          bg: "bg-gradient-to-r from-red-600 to-red-500",
          text: "text-red-600",
          border: "border-red-200",
          icon: "🚨",
          cardBg: "bg-red-50"
        };
      case "Event": 
        return { 
          bg: "bg-gradient-to-r from-blue-600 to-blue-500",
          text: "text-blue-600",
          border: "border-blue-200",
          icon: "🎪",
          cardBg: "bg-blue-50"
        };
      case "Transport": 
        return { 
          bg: "bg-gradient-to-r from-green-600 to-green-500",
          text: "text-green-600",
          border: "border-green-200",
          icon: "🚆",
          cardBg: "bg-green-50"
        };
      case "Culture": 
        return { 
          bg: "bg-gradient-to-r from-purple-600 to-purple-500",
          text: "text-purple-600",
          border: "border-purple-200",
          icon: "🎭",
          cardBg: "bg-purple-50"
        };
      default: 
        return { 
          bg: "bg-gradient-to-r from-gray-600 to-gray-500",
          text: "text-gray-600",
          border: "border-gray-200",
          icon: "📰",
          cardBg: "bg-gray-50"
        };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden border-none card-hover">
      <div className="bg-gradient-to-r from-[#FF7F00] to-[#E3A018] p-3 text-white">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="mr-2">📣</span>
          {t("Kumbh Mela News Updates")}
        </h2>
        <p className="text-xs opacity-90">{t("Latest information and alerts")}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7F00]"></div>
        </div>
      ) : (
        <div className="p-2 sm:p-4">
          {categories.map(category => {
            const { bg, text, border, icon, cardBg } = getCategoryStyles(category);
            
            return (
              <div key={category} className="mb-6 last:mb-0">
                <div className="flex items-center mb-2">
                  <Badge className={`${bg} text-white px-3 py-1`}>
                    <span className="mr-1">{icon}</span>
                    {category}
                  </Badge>
                </div>
                
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {groupedNews[category].map((item) => (
                      <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3 px-2">
                        <Card className={`border ${border} shadow-sm overflow-hidden h-full ${cardBg}`}>
                          {item.imageUrl && (
                            <div className="relative w-full h-32 overflow-hidden">
                              <img 
                                src={item.imageUrl} 
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform hover:scale-105" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                              <Badge className={`${bg} absolute top-2 right-2 z-10 text-white text-xs`}>
                                {category}
                              </Badge>
                            </div>
                          )}
                          <CardContent className={`p-4 ${!item.imageUrl ? 'pt-3' : ''}`}>
                            <h3 className={`font-bold mb-2 ${text} line-clamp-2`}>
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                              {item.content}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 justify-end">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimestamp(item.timestamp)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="hidden sm:block">
                    <CarouselPrevious className="-left-2 bg-white/80 hover:bg-white border border-gray-200" />
                    <CarouselNext className="-right-2 bg-white/80 hover:bg-white border border-gray-200" />
                  </div>
                </Carousel>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
