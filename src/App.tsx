import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapIdle from "./pages/MapIdle";
import MapSearch from "./pages/MapSearch";
import MapRoutes from "./pages/MapRoutes";
import MapRouteDetails from "./pages/MapRouteDetails";
import Navigation from "./pages/Navigation";
import NavigationEnd from "./pages/NavigationEnd";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="max-w-md mx-auto bg-background min-h-screen relative overflow-hidden">
          <Routes>
            <Route path="/" element={<MapIdle />} />
            <Route path="/search" element={<MapSearch />} />
            <Route path="/routes" element={<MapRoutes />} />
            <Route path="/route-details" element={<MapRouteDetails />} />
            <Route path="/navigation" element={<Navigation />} />
            <Route path="/navigation-end" element={<NavigationEnd />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
