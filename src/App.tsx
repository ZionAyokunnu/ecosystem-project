import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EcosystemProvider } from "@/context/EcosystemContext";
import { UserProvider } from "@/context/UserContext";
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
import Profile from "@/pages/Profile";
import OnboardingSurvey from "@/pages/OnboardingSurvey";
import ProtectedRoute from "@/components/ProtectedRoute";
import Wallet from "@/pages/Wallet";
import ResearcherInsights from "@/pages/ResearcherInsights";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <EcosystemProvider>
          <LocationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route path="Overview" element={
                    <ProtectedRoute>
                      <Overview />
                    </ProtectedRoute>
                  } />
                  <Route index element={<Homepage />} />
                  <Route path="detail/:indicatorId" element={
                    <ProtectedRoute>
                      <DetailView />
                    </ProtectedRoute>
                  } />
                  <Route path="profiles" element={
                    <ProtectedRoute>
                      <ProfilesView />
                    </ProtectedRoute>
                  } />
                  <Route path="wallet" element={
                    <ProtectedRoute>
                      <Wallet />
                    </ProtectedRoute>
                  } />
                  <Route path="researcher/insights" element={
                    <ProtectedRoute>
                      <ResearcherInsights />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="/detail/:indicatorId" element={<MainLayout />}>
                  <Route index element={
                    <ProtectedRoute>
                      <DetailView />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="/research/:indicatorId" element={<MainLayout />}>
                  <Route index element={
                    <ProtectedRoute>
                      <ResearchPage />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="/stories" element={<MainLayout />}>
                  <Route index element={
                    <ProtectedRoute>
                      <CommunityStoriesPage />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="/treemap" element={<MainLayout />}>
                  <Route index element={
                    <ProtectedRoute>
                      <TreeMapPage />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="/profile" element={<MainLayout />}>
                  <Route index element={<Profile />} />
                </Route>
                <Route path="/onboarding" element={<MainLayout />}>
                  <Route index element={<OnboardingSurvey />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </LocationProvider>
        </EcosystemProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
