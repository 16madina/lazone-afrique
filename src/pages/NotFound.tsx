import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
          <p className="mb-6 text-xl text-muted-foreground">Page non trouvée</p>
          <p className="mb-8 text-muted-foreground">La page que vous cherchez n'existe pas.</p>
          <Button asChild>
            <a href="/">
              Retourner à l'accueil
            </a>
          </Button>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default NotFound;
