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
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
