import { FC } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MapIdle from "./pages/MapIdle";
import MapSearch from "./pages/MapSearch";
import MapRoutes from "./pages/MapRoutes";

import Navigation from "./pages/Navigation";
import NavigationEnd from "./pages/NavigationEnd";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import Onboarding from "./pages/Onboarding";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Component-based guard — waits for auth loading, then checks session OR demo flag
const HomeRoute: FC = () => {
  const { loading, session } = useAuth();
  if (loading) return <div className="h-screen w-full bg-background" />;
  const demoOnboarded = localStorage.getItem('zenit_onboarded') === 'true';
  if (!session && !demoOnboarded) return <Navigate to="/onboarding" replace />;
  return <MapIdle />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="bottom-center" />
      <BrowserRouter>
        <AuthProvider>
          {/* Outer shell: fills viewport with branded dark bg on tablet/desktop */}
          <div className="min-h-screen w-full flex items-start justify-center">
            <div className="w-full max-w-md bg-background min-h-screen relative overflow-hidden">
              <Routes>
                <Route path="/" element={<HomeRoute />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/search" element={<MapSearch />} />
                <Route path="/routes" element={<MapRoutes />} />
                <Route path="/navigation" element={<Navigation />} />
                <Route path="/navigation-end" element={<NavigationEnd />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
