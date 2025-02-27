
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  language: string;
  timestamp: string;
}

export function NewsWidget() {
  const { i18n, t } = useTranslation();
  const { data: newsItems, isLoading } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Filter news by current language
  const filteredNews = newsItems?.filter(
    item => item.language === i18n.language || item.language === "all"
  ) || [];

  // Add Prayagraj Kumbh Mela news
  const prayagrajNews = {
    en: [
      {
        id: 101,
        title: "Prayagraj Kumbh Mela 2025 Preparations Begin",
        content: "Officials have started preparations for the grand Prayagraj Kumbh Mela 2025. New bathing ghats and improved infrastructure are being planned.",
        language: "en",
        timestamp: new Date().toISOString()
      },
      {
        id: 102,
        title: "Special Train Services for Prayagraj Kumbh",
        content: "Indian Railways has announced special train services connecting major cities to Prayagraj for the upcoming Kumbh Mela in 2025.",
        language: "en",
        timestamp: new Date().toISOString()
      },
      {
        id: 103,
        title: "Cultural Programs Planned for Prayagraj Kumbh",
        content: "A series of cultural programs showcasing India's diverse heritage will be organized during the Prayagraj Kumbh Mela 2025.",
        language: "en",
        timestamp: new Date().toISOString()
      }
    ],
    hi: [
      {
        id: 104,
        title: "प्रयागराज कुंभ मेला 2025 की तैयारियां शुरू",
        content: "अधिकारियों ने भव्य प्रयागराज कुंभ मेला 2025 की तैयारियां शुरू कर दी हैं। नए स्नान घाट और बेहतर बुनियादी ढांचे की योजना बनाई जा रही है।",
        language: "hi",
        timestamp: new Date().toISOString()
      },
      {
        id: 105,
        title: "प्रयागराज कुंभ के लिए विशेष ट्रेन सेवाएं",
        content: "भारतीय रेलवे ने 2025 में होने वाले कुंभ मेले के लिए प्रमुख शहरों को प्रयागराज से जोड़ने वाली विशेष ट्रेन सेवाओं की घोषणा की है।",
        language: "hi",
        timestamp: new Date().toISOString()
      }
    ],
    mr: [
      {
        id: 106,
        title: "प्रयागराज कुंभ मेळा 2025 ची तयारी सुरू",
        content: "अधिकाऱ्यांनी भव्य प्रयागराज कुंभ मेळा 2025 च्या तयारीला सुरुवात केली आहे. नवीन स्नान घाट आणि सुधारित पायाभूत सुविधांचे नियोजन केले जात आहे.",
        language: "mr",
        timestamp: new Date().toISOString()
      },
      {
        id: 107,
        title: "प्रयागराज कुंभ मेळ्यासाठी विशेष रेल्वे सेवा",
        content: "भारतीय रेल्वेने आगामी कुंभ मेळासाठी प्रमुख शहरांना प्रयागराज शी जोडणाऱ्या विशेष ट्रेन सेवांची घोषणा केली आहे.",
        language: "mr",
        timestamp: new Date().toISOString()
      }
    ]
  };

  // Add Prayagraj news based on current language
  const currentLangPrayagrajNews = prayagrajNews[i18n.language as keyof typeof prayagrajNews] || [];
  const allNews = [...filteredNews, ...currentLangPrayagrajNews];

  return (
    <Card className="w-full shadow-md border-t-4 border-t-[#FF7F00]">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-4">
          {i18n.language === "en" && "Latest News from Kumbh Mela"}
          {i18n.language === "hi" && "कुंभ मेला से ताज़ा खबरें"}
          {i18n.language === "mr" && "कुंभ मेळ्याच्या ताज्या बातम्या"}
        </h2>
        
        {!isLoading && allNews.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {allNews.map((news) => (
                <CarouselItem key={news.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-bold">{news.title}</h3>
                      <p className="text-sm text-gray-600 mt-2">{news.content}</p>
                      <p className="text-xs text-gray-400 mt-3">
                        {new Date(news.timestamp).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        ) : (
          <div className="text-center p-4 text-sm text-gray-500">
            {i18n.language === "en" && "Loading news updates..."}
            {i18n.language === "hi" && "समाचार लोड हो रहे हैं..."}
            {i18n.language === "mr" && "बातम्या लोड होत आहेत..."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
