
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  language: string;
  timestamp: string;
  category?: string;
}

export function NewsWidget() {
  const { i18n, t } = useTranslation();
  const { data: newsItems, isLoading } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Filter news by current language
  const filteredNews = newsItems?.filter(
    (item) => item.language === i18n.language || item.language === "all"
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
        category: "Event"
      },
      {
        id: 102,
        title: "Special Train Services for Prayagraj Kumbh",
        content: "Indian Railways has announced special train services connecting major cities to Prayagraj for the upcoming Kumbh Mela in 2025.",
        language: "en",
        timestamp: new Date().toISOString(),
        category: "Transport"
      },
      {
        id: 103,
        title: "Cultural Programs Planned for Prayagraj Kumbh",
        content: "A series of cultural programs showcasing India's diverse heritage will be organized during the Prayagraj Kumbh Mela 2025.",
        language: "en",
        timestamp: new Date().toISOString(),
        category: "Culture"
      },
      {
        id: 104,
        title: "EMERGENCY: Crowd Management Alert at Sangam Area",
        content: "Authorities have issued a crowd management alert for the Sangam area due to unexpected high turnout. Visitors are advised to follow official instructions.",
        language: "en",
        timestamp: new Date().toISOString(),
        category: "Emergency"
      }
    ],
    hi: [
      {
        id: 105,
        title: "प्रयागराज कुंभ मेला 2025 की तैयारियां शुरू",
        content: "अधिकारियों ने भव्य प्रयागराज कुंभ मेला 2025 की तैयारियां शुरू कर दी हैं। नए स्नान घाट और बेहतर बुनियादी ढांचे की योजना बनाई जा रही है।",
        language: "hi",
        timestamp: new Date().toISOString(),
        category: "Event"
      },
      {
        id: 106,
        title: "प्रयागराज कुंभ के लिए विशेष ट्रेन सेवाएं",
        content: "भारतीय रेलवे ने आगामी कुंभ मेले के लिए प्रमुख शहरों को प्रयागराज से जोड़ने वाली विशेष ट्रेन सेवाओं की घोषणा की है।",
        language: "hi",
        timestamp: new Date().toISOString(),
        category: "Transport"
      },
      {
        id: 107,
        title: "आपातकालीन: संगम क्षेत्र में भीड़ प्रबंधन अलर्ट",
        content: "अप्रत्याशित अधिक भीड़ के कारण अधिकारियों ने संगम क्षेत्र के लिए भीड़ प्रबंधन अलर्ट जारी किया है। आगंतुकों को आधिकारिक निर्देशों का पालन करने की सलाह दी गई है।",
        language: "hi",
        timestamp: new Date().toISOString(),
        category: "Emergency"
      }
    ],
    mr: [
      {
        id: 108,
        title: "प्रयागराज कुंभ मेळा 2025 ची तयारी सुरू",
        content: "अधिकाऱ्यांनी भव्य प्रयागराज कुंभ मेळा 2025 च्या तयारीला सुरुवात केली आहे. नवीन स्नान घाट आणि सुधारित पायाभूत सुविधांचे नियोजन केले जात आहे.",
        language: "mr",
        timestamp: new Date().toISOString(),
        category: "Event"
      },
      {
        id: 109,
        title: "आपत्कालीन: संगम क्षेत्रात गर्दी व्यवस्थापन सतर्कता",
        content: "अनपेक्षित अधिक गर्दीमुळे अधिकाऱ्यांनी संगम क्षेत्रासाठी गर्दी व्यवस्थापन सतर्कता जारी केली आहे. भेट देणाऱ्यांना अधिकृत सूचनांचे पालन करण्याचा सल्ला देण्यात आला आहे.",
        language: "mr",
        timestamp: new Date().toISOString(),
        category: "Emergency"
      }
    ]
  };

  // Add news based on selected language
  const allNews = [...filteredNews, ...(prayagrajNews[i18n.language as keyof typeof prayagrajNews] || [])].slice(0, 5);

  // Configure autoplay for carousel
  const autoplayOptions = {
    delay: 4000,
    stopOnInteraction: false,
    rootNode: (emblaRoot: any) => emblaRoot.parentElement,
  };

  // Initialize carousel with autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay(autoplayOptions)]);

  // Get badge color based on category
  const getBadgeColor = (category: string) => {
    switch (category) {
      case "Emergency": return "bg-red-500 hover:bg-red-600";
      case "Event": return "bg-blue-500 hover:bg-blue-600";
      case "Transport": return "bg-green-500 hover:bg-green-600";
      case "Culture": return "bg-purple-500 hover:bg-purple-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4 text-[#FF7F00] flex items-center">
        <span className="mr-2">📰</span>
        Live News
      </h2>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      ) : allNews.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          No news available in your selected language.
        </div>
      ) : (
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {allNews.map((news) => (
              <div key={news.id} className="flex-[0_0_100%] min-w-0">
                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{news.title}</h3>
                      {news.category && (
                        <Badge className={`ml-2 ${getBadgeColor(news.category)}`}>
                          {news.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{news.content}</p>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(news.timestamp).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
