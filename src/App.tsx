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

const queryClient = new QueryClient();

// Component-based guard so localStorage is read fresh on every render
const HomeRoute: FC = () => {
  if (localStorage.getItem('zenit_onboarded') !== 'true') {
    return <Navigate to="/onboarding" replace />;
  }
  return <MapIdle />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
