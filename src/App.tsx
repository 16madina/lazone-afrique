import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CountryProvider } from "@/contexts/CountryContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NativeInitializer } from "@/components/NativeInitializer";
import { ThemeProvider } from "next-themes";

// Import direct de toutes les pages (pas de lazy loading)
import Index from "./pages/Index";
import Map from "./pages/Map";
import ListingDetail from "./pages/ListingDetail";
import AddProperty from "./pages/AddProperty";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Sponsorship from "./pages/Sponsorship";
import Favorites from "./pages/Favorites";
import Admin from "./pages/Admin";
import Payment from "./pages/Payment";
import About from "./pages/About";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DataDeletion from "./pages/DataDeletion";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import SellerProfile from "./pages/SellerProfile";

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
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/about" element={<About />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/data-deletion" element={<DataDeletion />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/seller/:userId" element={<SellerProfile />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
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
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
