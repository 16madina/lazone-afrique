import { Loader2 } from "lucide-react";
import logoIcon from "@/assets/lazone-logo-icon.png";

export const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="glass-card rounded-2xl p-12 shadow-elevation-5 animate-fade-in">
        <div className="flex flex-col items-center gap-6">
          {/* Logo with pulse animation */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/70 rounded-full blur-2xl opacity-50 animate-pulse" />
            <img 
              src={logoIcon} 
              alt="LaZone" 
              className="w-20 h-20 relative z-10 animate-bounce"
            />
          </div>

          {/* Loading spinner */}
          <div className="relative">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          </div>

          {/* Loading text with shimmer */}
          <div className="space-y-2 text-center">
            <p className="text-lg font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-pulse">
              Chargement en cours...
            </p>
            <div className="flex gap-1 justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>

          {/* Shimmer effect bar */}
          <div className="w-64 h-1 bg-muted/30 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const PageLoaderMinimal = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="glass-button rounded-full p-6 shadow-elevation-4 animate-scale-in">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    </div>
  );
};

export const InlineLoader = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="glass-button rounded-full p-4 shadow-elevation-3 animate-scale-in">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    </div>
  );
};
