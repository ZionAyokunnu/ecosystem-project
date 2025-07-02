
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { EcosystemProvider } from "@/context/EcosystemContext"
import { LocationProvider } from "@/context/LocationContext"
import { UserProvider } from "@/context/UserContext"
import Index from "./pages/Index"
import Auth from "./pages/Auth"
import Profile from "./pages/Profile"
import Dashboard from "./pages/Dashboard"
import About from "./pages/About"
import Overview from "./pages/Overview"
import DetailView from "./pages/DetailView"
import TreeMapPage from "./pages/TreeMapPage"
import ResearchPage from "./pages/ResearchPage"
import ResearcherInsights from "./pages/ResearcherInsights"
import OnboardingSurvey from "./pages/OnboardingSurvey"
import AdminDashboard from "./pages/AdminDashboard"
import RepDashboard from "./pages/RepDashboard"
import Leaderboard from "./pages/Leaderboard"
import Wallet from "./pages/Wallet"
import CommunityStoriesPage from "./pages/CommunityStoriesPage"
import SurveysPage from "./pages/SurveysPage"
import Homepage from "./pages/Homepage"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import RoleProtectedRoute from "./components/RoleProtectedRoute"

import "./App.css"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <EcosystemProvider>
          <LocationProvider>
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/home" element={<Homepage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/overview" element={<Overview />} />
                  <Route path="/detail/:indicatorId" element={<DetailView />} />
                  <Route path="/treemap" element={<TreeMapPage />} />
                  <Route path="/research" element={<ResearchPage />} />
                  <Route path="/stories" element={<CommunityStoriesPage />} />
                  <Route path="/surveys" element={<SurveysPage />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute>
                        <OnboardingSurvey />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/researcher-insights"
                    element={
                      <RoleProtectedRoute allowedRoles={['researcher']}>
                        <ResearcherInsights />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/rep-dashboard"
                    element={
                      <RoleProtectedRoute allowedRoles={['community_rep']}>
                        <RepDashboard />
                      </RoleProtectedRoute>
                    }
                  />
                  <Route
                    path="/leaderboard"
                    element={
                      <ProtectedRoute>
                        <Leaderboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wallet"
                    element={
                      <ProtectedRoute>
                        <Wallet />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </LocationProvider>
        </EcosystemProvider>
      </UserProvider>
    </QueryClientProvider>
  )
}

export default App
