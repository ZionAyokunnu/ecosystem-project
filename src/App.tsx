
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EcosystemProvider } from "@/context/EcosystemContext";
import MainLayout from "@/components/MainLayout";
import Overview from "@/pages/Overview";
import DetailView from "@/pages/DetailView";
import ProfilesView from "@/pages/ProfilesView";
import NotFound from "./pages/NotFound";
import { LocationProvider } from "@/context/LocationContext";
import ResearchPage from "@/pages/ResearchPage";
import Homepage from "@/pages/Homepage";
import CommunityStoriesPage from "@/pages/CommunityStoriesPage";
import TreeMapPage from "@/pages/TreeMapPage";

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
                <Route path="Overview" element={<Overview />} />
                <Route index element={<Homepage />} />
                <Route path="detail/:indicatorId" element={<DetailView />} />
                <Route path="profiles" element={<ProfilesView />} />
              </Route>
              <Route path="/detail/:indicatorId" element={<MainLayout />}>
                <Route index element={<DetailView />} />
              </Route>
              <Route path="/research/:indicatorId" element={<MainLayout />}>
                <Route index element={<ResearchPage />} />
              </Route>
              <Route path="/stories" element={<MainLayout />}>
                <Route index element={<CommunityStoriesPage />} />
              </Route>
              <Route path="/treemap" element={<MainLayout />}>
                <Route index element={<TreeMapPage />} />
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
