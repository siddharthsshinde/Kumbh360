
import React, { useEffect, useState } from 'react';
import { Toggle } from "./ui/toggle";
import { Sun, Moon } from "lucide-react";

interface ThemeData {
  variant: string;
  primary: string;
  appearance: string;
  radius: number;
}

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeData | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load theme data
    fetch('/theme.json')
      .then(res => res.json())
      .then(data => {
        setCurrentTheme(data);
        setIsDark(data.appearance === 'dark');
      })
      .catch(err => console.error('Error loading theme:', err));
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Apply theme change to document
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update theme data (in a real app, you might want to save this to the server)
    if (currentTheme) {
      const newTheme = {
        ...currentTheme,
        appearance: newIsDark ? 'dark' : 'light',
      };
      setCurrentTheme(newTheme);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4 text-muted-foreground" />
      <Toggle 
        pressed={isDark} 
        onPressedChange={toggleTheme}
        aria-label="Toggle theme"
        className="data-[state=on]:bg-navy-blue data-[state=on]:text-white"
      >
        <span className="sr-only">Toggle theme</span>
      </Toggle>
      <Moon className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
