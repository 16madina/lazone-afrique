import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PaginationMetadataProps {
  currentItems: number;
  totalItems: number;
  isLoading?: boolean;
  variant?: "default" | "minimal";
}

export const PaginationMetadata = ({
  currentItems,
  totalItems,
  isLoading = false,
  variant = "default"
}: PaginationMetadataProps) => {
  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
        <span className="font-medium text-foreground">{currentItems}</span>
        <span>sur</span>
        <span className="font-medium text-foreground">{totalItems}</span>
        <span>annonces</span>
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin ml-2 text-primary" />
        )}
      </div>
    );
  }

  const percentage = totalItems > 0 ? Math.round((currentItems / totalItems) * 100) : 0;

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Current stats */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-base px-4 py-2">
            {currentItems} / {totalItems}
          </Badge>
          <Separator orientation="vertical" className="h-6" />
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{percentage}%</span> affichées
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-medium">Chargement...</span>
          </div>
        )}

        {/* Remaining items */}
        {!isLoading && currentItems < totalItems && (
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{totalItems - currentItems}</span> annonces restantes
          </div>
        )}

        {/* All loaded indicator */}
        {!isLoading && currentItems === totalItems && totalItems > 0 && (
          <Badge variant="secondary" className="bg-accent/10 text-accent-foreground">
            ✓ Toutes les annonces chargées
          </Badge>
        )}
      </div>

      {/* Progress bar */}
      {totalItems > 0 && (
        <div className="mt-4 relative">
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${percentage}%` }}
            >
              {/* Shimmer effect on progress bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const LoadMoreButton = ({ 
  onClick, 
  isLoading, 
  hasMore 
}: { 
  onClick: () => void; 
  isLoading: boolean; 
  hasMore: boolean;
}) => {
  if (!hasMore) return null;

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="glass-button w-full py-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-elevation-3 active:scale-98 ripple disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Charger plus d'annonces"
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Chargement...</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <span>Voir plus d'annonces</span>
          <span className="text-primary">↓</span>
        </span>
      )}
    </button>
  );
};
