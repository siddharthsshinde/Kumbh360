
import React, { useEffect, useState } from 'react';
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Slider } from "./ui/slider";
import { Toggle } from "./ui/toggle";
import { Sun, Moon, Palette } from "lucide-react";
import { ThemeConfig, THEME_VARIANTS, FESTIVAL_THEMES, getCurrentTheme, setTheme } from '@/lib/themeManager';

export function ThemeSettings() {
  const [theme, setCurrentTheme] = useState<ThemeConfig | null>(null);
  const [selectedTab, setSelectedTab] = useState('general');

  useEffect(() => {
    getCurrentTheme().then(themeData => {
      setCurrentTheme(themeData);
    });
  }, []);

  if (!theme) return <div>Loading theme settings...</div>;

  const handleToggleAppearance = () => {
    const newTheme = {
      ...theme,
      appearance: (theme.appearance === 'light' ? 'dark' : 'light') as 'light' | 'dark'
    };
    setCurrentTheme(newTheme);
    setTheme(newTheme);
  };

  const handleVariantChange = (variant: string) => {
    const newTheme = { ...theme, variant };
    setCurrentTheme(newTheme);
    setTheme(newTheme);
  };

  const handleBorderRadiusChange = (value: number[]) => {
    const newTheme = { ...theme, radius: value[0] };
    setCurrentTheme(newTheme);
    setTheme(newTheme);
  };

  const applyFestivalTheme = (festivalKey: keyof typeof FESTIVAL_THEMES) => {
    const festival = FESTIVAL_THEMES[festivalKey];
    const newTheme = {
      ...theme,
      primary: festival.primary,
      colors: festival.colors
    };
    setCurrentTheme(newTheme);
    setTheme(newTheme);
  };

  return (
    <Card className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Theme Settings</h2>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="festivals">Festival Themes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Appearance</span>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Toggle 
                  pressed={theme.appearance === 'dark'} 
                  onPressedChange={handleToggleAppearance}
                  aria-label="Toggle theme"
                >
                  <span className="sr-only">Toggle theme</span>
                </Toggle>
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Border Radius</span>
                <span>{theme.radius}rem</span>
              </div>
              <Slider
                defaultValue={[theme.radius]}
                max={2}
                step={0.125}
                onValueChange={handleBorderRadiusChange}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="variants" className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {THEME_VARIANTS.map((variant) => (
              <button
                key={variant}
                className={`p-4 border rounded-md text-center ${
                  theme.variant === variant ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => handleVariantChange(variant)}
              >
                {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </button>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="festivals" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Object.entries(FESTIVAL_THEMES).map(([key, festival]) => (
              <div key={key} className="border rounded-md p-4 hover:bg-muted/50 cursor-pointer"
                   onClick={() => applyFestivalTheme(key as keyof typeof FESTIVAL_THEMES)}>
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-5 w-5" />
                  <h3 className="font-medium">{festival.name}</h3>
                </div>
                <div className="flex gap-2 mt-2">
                  {festival.colors && Object.values(festival.colors).map((color, i) => (
                    <div 
                      key={i} 
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
