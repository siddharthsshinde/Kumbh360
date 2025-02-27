import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { NewsItem } from "shared/types";
import { Badge } from "@/components/ui/badge";
import { 
  Carousel, 
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Autoplay from "embla-carousel-autoplay";
import { Clock } from "lucide-react"; // Added from original code


export default function NewsWidget() {
  const { t, i18n } = useTranslation();
  const [parent] = useAutoAnimate();
  const { data: news, isLoading } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
  });

  // Custom Prayagraj Kumbh Mela news based on language
  const prayagrajNews = {
    en: [
      {
        id: 101,
        title: "Grand Shahi Snan Schedule Announced",
        content: "The schedule for five Shahi Snans (royal baths) in Prayagraj Kumbh Mela has been announced. The first Shahi Snan will be on Makar Sankranti.",
        language: "en",
        timestamp: new Date().toISOString(),
        category: "Event"
      },
      {
        id: 102,
        title: "New Pontoon Bridges Open for Devotees",
        content: "Three new pontoon bridges have been opened to manage the increased flow of pilgrims between Sangam and the mela area.",
        language: "en",
        timestamp: new Date().toISOString(),
        category: "Transport"
      },
      {
        id: 103,
        title: "Prime Minister to Visit Kumbh on February 12th",
        content: "The Prime Minister will visit Prayagraj Kumbh on February 12th and will participate in a special Ganga Pujan ceremony.",
        language: "en",
        timestamp: new Date().toISOString(),
        category: "Event"
      }
    ],
    hi: [
      {
        id: 104,
        title: "शाही स्नान कार्यक्रम की घोषणा",
        content: "प्रयागराज कुंभ मेला में पांच शाही स्नान (रॉयल बाथ) के कार्यक्रम की घोषणा कर दी गई है। पहला शाही स्नान मकर संक्रांति पर होगा।",
        language: "hi",
        timestamp: new Date().toISOString(),
        category: "Event"
      },
      {
        id: 105,
        title: "श्रद्धालुओं के लिए नए पोंटून पुल खुले",
        content: "संगम और मेला क्षेत्र के बीच तीर्थयात्रियों के बढ़ते प्रवाह को प्रबंधित करने के लिए तीन नए पोंटून पुल खोले गए हैं।",
        language: "hi",
        timestamp: new Date().toISOString(),
        category: "Transport"
      }
    ],
    mr: [
      {
        id: 106,
        title: "आपत्कालीन सूचना: गर्दी टाळण्यासाठी मार्गदर्शन",
        content: "कुंभ मेळामध्ये अधिक गर्दी असल्याने, भाविकांना सुरक्षा सूचनांचे पालन करण्याचा सल्ला देण्यात आला आहे.",
        language: "mr",
        timestamp: new Date().toISOString(),
        category: "Emergency"
      }
    ]
  };

  // Add news based on selected language
  const filteredNews = news?.filter(item => 
    item.language === i18n.language || item.language === "en"
  ) || [];

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

  const getBadgeColor = (category: string) => {
    switch (category) {
      case "Emergency": return "bg-red-500 hover:bg-red-600";
      case "Event": return "bg-blue-500 hover:bg-blue-600";
      case "Transport": return "bg-green-500 hover:bg-green-600";
      case "Culture": return "bg-purple-500 hover:bg-purple-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  // Create a flat list of all news for carousel
  const allNewsFlat = categories.flatMap(category => 
    groupedNews[category].map(news => ({...news, category}))
  );

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4 text-[#FF7F00] flex items-center">
        <span className="mr-2">📰</span>
        {t("news_widget.latest_news")}
      </h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7F00]"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <Carousel 
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[plugin.current]}
            className="w-full"
          >
            <CarouselContent>
              {allNewsFlat.map(news => (
                <CarouselItem key={news.id} className="md:basis-1/2">
                  <div className="bg-gray-50 p-4 rounded-lg h-full">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{news.title}</h3>
                      <Badge className={`${getBadgeColor(news.category)} text-white text-xs`}>
                        {news.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{news.content}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span className="relative">
                        {new Date(news.timestamp).toLocaleTimeString()}
                        <span className="absolute -left-2 top-1/2 transform -translate-y-1/2 h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                      </span>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-end space-x-2 mt-2">
              <CarouselPrevious className="static transform-none" />
              <CarouselNext className="static transform-none" />
            </div>
          </Carousel>
        </div>
      )}
    </div>
  );
}