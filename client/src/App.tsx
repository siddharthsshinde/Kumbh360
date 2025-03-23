import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { LanguageSelector } from "@/components/LanguageSelector";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import "./lib/i18n";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [mounted, setMounted] = useState(false);

  // Wait for component to be mounted before rendering language selector
  // to avoid hydration issues with localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Global header with language selector - fixed at top */}
      <header className="bg-primary/90 text-white py-2 px-4 fixed top-0 left-0 right-0 z-50 shadow-md flex justify-between items-center">
        <div className="font-bold text-lg">
          Kumbh Mela 2025
        </div>
        {mounted && <LanguageSelector />}
      </header>
      
      {/* Add padding to the top to account for the fixed header */}
      <div className="pt-12">
        <Router />
      </div>
      
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
