
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EcosystemProvider } from "@/context/EcosystemContext";
import { LocationProvider } from "@/context/LocationContext";
import MainLayout from "@/components/MainLayout";
import Overview from "@/pages/Overview";
import DetailView from "@/pages/DetailView";
import ProfilesView from "@/pages/ProfilesView";
import NotFound from "./pages/NotFound";
import { LocationProvider } from "@/context/LocationContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <EcosystemProvider>
        <LocationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Overview />} />
                <Route path="detail/:indicatorId" element={<DetailView />} />
                <Route path="profiles" element={<ProfilesView />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LocationProvider>
      </EcosystemProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
