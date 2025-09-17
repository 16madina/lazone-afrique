import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CountryProvider } from "@/contexts/CountryContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useCapacitor } from "@/hooks/useCapacitor";
import { SplashScreen } from "@/components/SplashScreen";
import Index from "./pages/Index";
import Map from "./pages/Map";
import ListingDetail from "./pages/ListingDetail";
import AddProperty from "./pages/AddProperty";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Sponsorship from "./pages/Sponsorship";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  useCapacitor();

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/map" element={<Map />} />
      <Route path="/listing/:id" element={<ListingDetail />} />
      <Route path="/add-property" element={<AddProperty />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/sponsorship/:listingId" element={<Sponsorship />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CountryProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </CountryProvider>
  </QueryClientProvider>
);

export default App;
