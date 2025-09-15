import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CountryProvider } from "@/contexts/CountryContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useCapacitor } from "@/hooks/useCapacitor";
import Index from "./pages/Index";
import Map from "./pages/Map";
import ListingDetail from "./pages/ListingDetail";
import AddProperty from "./pages/AddProperty";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Mobile optimizations: reduce background refetches
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Initialize Capacitor for mobile
  const { isNative, platform } = useCapacitor();

  return (
    <QueryClientProvider client={queryClient}>
      <CountryProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className={`min-h-screen w-full ${isNative ? 'native-app' : 'web-app'}`}>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/map" element={<Map />} />
                  <Route path="/listing/:id" element={<ListingDetail />} />
                  <Route path="/add-property" element={<AddProperty />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/auth" element={<Auth />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </AuthProvider>
      </CountryProvider>
    </QueryClientProvider>
  );
};

export default App;
