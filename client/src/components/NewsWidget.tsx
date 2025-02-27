
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  language: string;
  timestamp: string;
}

export function NewsWidget() {
  const { i18n } = useTranslation();
  const { data: newsItems } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Filter news by current language
  const filteredNews = newsItems?.filter(
    item => item.language === i18n.language || item.language === "all"
  ) || [];

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="p-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold px-2">
            {i18n.language === "en" && "Latest Updates"}
            {i18n.language === "hi" && "ताज़ा समाचार"}
            {i18n.language === "mr" && "ताजी बातम्या"}
          </h3>
          <div className="flex text-xs text-orange-600 animate-pulse px-2">
            {i18n.language === "en" && "LIVE"}
            {i18n.language === "hi" && "लाइव"}
            {i18n.language === "mr" && "लाईव्ह"}
          </div>
        </div>
        
        {filteredNews.length > 0 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {filteredNews.map((item) => (
                <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2 border rounded-lg">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{item.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
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
