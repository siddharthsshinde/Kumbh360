
import React from 'react';
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

// Theme preset definitions
const themePresets = {
  kumbh: {
    name: "Kumbh Mela",
    primary: "hsl(39, 100%, 50%)",
    colors: {
      primary: "#FF7F00",
      secondary: "#138808",
      accent: "#000080",
      background: "#FFFFFF",
    }
  },
  diwali: {
    name: "Diwali",
    primary: "hsl(39, 100%, 50%)",
    colors: {
      primary: "#FFD700", // Gold
      secondary: "#FF5733", // Warm orange
      accent: "#900C3F", // Deep maroon
      background: "#FFF5E1", // Warm cream
    }
  },
  holi: {
    name: "Holi",
    primary: "hsl(305, 100%, 50%)",
    colors: {
      primary: "#FF1493", // Deep pink
      secondary: "#00FFFF", // Cyan
      accent: "#ADFF2F", // Green yellow
      background: "#9370DB", // Medium purple
    }
  },
  navratri: {
    name: "Navratri",
    primary: "hsl(348, 83%, 47%)",
    colors: {
      primary: "#FF073A", // Bright red
      secondary: "#FF7F00", // Orange
      accent: "#FFD700", // Gold
      background: "#FAF0E6", // Linen
    }
  }
};

export function ThemePresets() {
  const applyTheme = (preset: typeof themePresets.kumbh) => {
    // Apply CSS variables to root element
    const root = document.documentElement;
    
    // Convert HSL to CSS variable format
    root.style.setProperty('--primary', preset.primary);
    
    // Apply colors (in a real app, this would be more sophisticated)
    Object.entries(preset.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // In a real implementation, you might want to save the selection to local storage
    localStorage.setItem('selectedTheme', preset.name);
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-2">Theme Presets</h3>
      <Tabs defaultValue="kumbh">
        <TabsList className="grid grid-cols-4 mb-4">
          {Object.keys(themePresets).map(key => (
            <TabsTrigger key={key} value={key}>
              {themePresets[key as keyof typeof themePresets].name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {Object.entries(themePresets).map(([key, preset]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(preset.colors).map(([colorKey, colorValue]) => (
                <div key={colorKey} className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: colorValue }}
                  />
                  <span className="text-sm">{colorKey}: {colorValue}</span>
                </div>
              ))}
            </div>
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              onClick={() => applyTheme(preset)}
            >
              Apply Theme
            </button>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
