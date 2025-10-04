import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CountryProvider } from "@/contexts/CountryContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NativeInitializer } from "@/components/NativeInitializer";
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
import AdminImageUpload from "./pages/AdminImageUpload";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
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
      <Route path="/admin/upload-demo-images" element={<AdminImageUpload />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Check if splash has already been shown in this session
    const hasShownSplash = sessionStorage.getItem('splashShown');
    return !hasShownSplash;
  });

  const handleSplashFinish = () => {
    setShowSplash(false);
    sessionStorage.setItem('splashShown', 'true');
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CountryProvider>
        <AuthProvider>
          <NativeInitializer />
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
};

export default App;
