
// Theme types
export interface ThemeConfig {
  variant: string;
  primary: string;
  appearance: 'light' | 'dark';
  radius: number;
  colors?: Record<string, string>;
}

// Available theme variants
export const THEME_VARIANTS = [
  'professional', 
  'festive', 
  'cultural', 
  'modern'
] as const;

// Theme festival presets
export const FESTIVAL_THEMES = {
  kumbh: {
    name: "Kumbh Mela",
    primary: "hsl(39, 100%, 50%)",
    colors: {
      saffron: "#FF7F00",
      indiaGreen: "#138808",
      navyBlue: "#000080"
    }
  },
  diwali: {
    name: "Diwali",
    primary: "hsl(35, 100%, 50%)",
    colors: {
      gold: "#FFD700",
      deepRed: "#8B0000",
      marigold: "#EAA221"
    }
  },
  holi: {
    name: "Holi",
    primary: "hsl(280, 100%, 65%)",
    colors: {
      magenta: "#FF00FF",
      cyan: "#00FFFF",
      green: "#00FF00"
    }
  }
};

// Get the current theme from localStorage or theme.json
export async function getCurrentTheme(): Promise<ThemeConfig> {
  const storedTheme = localStorage.getItem('appTheme');
  
  if (storedTheme) {
    return JSON.parse(storedTheme);
  }
  
  try {
    const response = await fetch('/theme.json');
    const defaultTheme = await response.json();
    return defaultTheme;
  } catch (error) {
    console.error('Failed to load theme:', error);
    // Fallback default theme
    return {
      variant: 'professional',
      primary: 'hsl(39, 100%, 50%)',
      appearance: 'light',
      radius: 0.75
    };
  }
}

// Set the current theme and apply it
export function setTheme(theme: ThemeConfig): void {
  // Store in localStorage
  localStorage.setItem('appTheme', JSON.stringify(theme));
  
  // Apply to DOM
  document.documentElement.setAttribute('data-theme-variant', theme.variant);
  
  if (theme.appearance === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Apply CSS variables
  document.documentElement.style.setProperty('--primary', theme.primary);
  document.documentElement.style.setProperty('--radius', `${theme.radius}rem`);
  
  // Apply additional colors if available
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }
}

// Toggle between light and dark mode
export function toggleAppearance(): void {
  getCurrentTheme().then(theme => {
    const newAppearance = theme.appearance === 'light' ? 'dark' : 'light';
    setTheme({...theme, appearance: newAppearance});
  });
}
