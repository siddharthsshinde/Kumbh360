import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from "@/components/layout/AppLayout";
import { SOSDialog } from "@/components/emergency/SOSDialog";
import { SplashScreen } from "@/components/pwa/SplashScreen";
import { NetworkStatus } from "@/components/pwa/NetworkStatus";
import { useEmergencyActions } from "@/hooks/useEmergencyActions";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import MapPage from "@/pages/map";
import ProfilePage from "@/pages/profile";
import SOSPage from "@/pages/sos";
import ExplorePage from "@/pages/explore";
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

function App() {
  const emergency = useEmergencyActions();

  return (
    <QueryClientProvider client={queryClient}>
      <SplashScreen />
      <NetworkStatus />
      <AppLayout
        onOpenSOS={emergency.openSOS}
        onShareLocation={emergency.shareLocation}
      >
        <Router emergency={emergency} />
      </AppLayout>
      <SOSDialog emergency={emergency} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
