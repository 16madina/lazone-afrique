import { useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CountryProvider } from "@/contexts/CountryContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NativeInitializer } from "@/components/NativeInitializer";
import { SplashScreen } from "@/components/SplashScreen";
import { PageLoader } from "@/components/PageLoader";

// Lazy load all page components for better performance
const Index = lazy(() => import("./pages/Index"));
const Map = lazy(() => import("./pages/Map"));
const ListingDetail = lazy(() => import("./pages/ListingDetail"));
const AddProperty = lazy(() => import("./pages/AddProperty"));
const Messages = lazy(() => import("./pages/Messages"));
const Profile = lazy(() => import("./pages/Profile"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Sponsorship = lazy(() => import("./pages/Sponsorship"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Admin = lazy(() => import("./pages/Admin"));
const Payment = lazy(() => import("./pages/Payment"));
const About = lazy(() => import("./pages/About"));
const Settings = lazy(() => import("./pages/Settings"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const DataDeletion = lazy(() => import("./pages/DataDeletion"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));

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
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/map" element={<Map />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/add-property" element={<AddProperty />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/sponsorship/:listingId" element={<Sponsorship />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/about" element={<About />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/data-deletion" element={<DataDeletion />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Check if splash has already been shown in this session
    const hasShownSplash = sessionStorage.getItem('splashShown');
    console.log('🎯 Checking splash screen status:', { hasShownSplash, shouldShow: !hasShownSplash });
    return !hasShownSplash;
  });

  const handleSplashFinish = () => {
    console.log('🎉 Splash screen finished, hiding it');
    setShowSplash(false);
    sessionStorage.setItem('splashShown', 'true');
  };

  if (showSplash) {
    console.log('📺 Rendering splash screen');
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  console.log('🚀 Rendering main app');

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
