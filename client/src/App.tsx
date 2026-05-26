import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from "@/components/layout/AppLayout";
import { SOSDialog } from "@/components/emergency/SOSDialog";
import { OnboardingFlow } from "@/components/pwa/OnboardingFlow";
import { NetworkStatus } from "@/components/pwa/NetworkStatus";
import { useEmergencyActions } from "@/hooks/useEmergencyActions";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import MapPage from "@/pages/map";
import ProfilePage from "@/pages/profile";
import SOSPage from "@/pages/sos";
import ExplorePage from "@/pages/explore";
import LanguageSetup from "@/pages/language-setup";
import "./lib/i18n";

interface RouterProps {
  emergency: ReturnType<typeof useEmergencyActions>;
}

function Router({ emergency }: RouterProps) {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/map" component={MapPage} />
      <Route path="/sos">
        <SOSPage emergency={emergency} />
      </Route>
      <Route path="/explore" component={ExplorePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function MainApp() {
  const emergency = useEmergencyActions();
  const [location] = useLocation();

  if (location === "/language-setup") {
    return (
      <>
        <LanguageSetup />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <NetworkStatus />
      <AppLayout
        onOpenSOS={emergency.openSOS}
        onShareLocation={emergency.shareLocation}
      >
        <Router emergency={emergency} />
      </AppLayout>
      <SOSDialog emergency={emergency} />
      <Toaster />
    </>
  );
}

function App() {
  const [onboarded, setOnboarded] = useState(() => {
    if (new URLSearchParams(window.location.search).get("nosplash")) return true;
    if (new URLSearchParams(window.location.search).get("onboarding")) return false;
    return !!localStorage.getItem("kumbh360-onboarded");
  });

  return (
    <QueryClientProvider client={queryClient}>
      {onboarded ? (
        <MainApp />
      ) : (
        <OnboardingFlow onComplete={() => setOnboarded(true)} />
      )}
    </QueryClientProvider>
  );
}

export default App;
