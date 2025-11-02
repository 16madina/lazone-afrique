import { Card, CardContent } from "@/components/ui/card";

const PropertyCardSkeleton = () => {
  return (
    <Card className="overflow-hidden glass-card animate-fade-in" role="status" aria-label="Chargement de la propriété">
      {/* Image Skeleton with enhanced shimmer */}
      <div className="relative aspect-[4/3] bg-muted/50 skeleton-shimmer rounded-t-xl" />

      <CardContent className="p-5 space-y-4">
        {/* Title & Price */}
        <div className="space-y-3">
          <div className="h-6 bg-gradient-to-r from-muted via-muted/60 to-muted rounded-lg skeleton-shimmer w-3/4" />
          <div className="flex items-center justify-between">
            <div className="h-9 bg-gradient-to-r from-muted via-primary/10 to-muted rounded-lg skeleton-shimmer w-2/5" />
            <div className="h-6 bg-gradient-to-r from-muted via-muted/60 to-muted rounded-full skeleton-shimmer w-24" />
          </div>
        </div>

        {/* Location */}
        <div className="h-4 bg-gradient-to-r from-muted via-muted/60 to-muted rounded-md skeleton-shimmer w-3/5" />

        {/* Property Details */}
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gradient-to-r from-muted via-muted/60 to-muted rounded skeleton-shimmer w-14" />
          <div className="h-4 bg-gradient-to-r from-muted via-muted/60 to-muted rounded skeleton-shimmer w-14" />
          <div className="h-4 bg-gradient-to-r from-muted via-muted/60 to-muted rounded skeleton-shimmer w-20" />
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          <div className="h-7 bg-gradient-to-r from-muted via-primary/10 to-muted rounded-full skeleton-shimmer w-24" />
          <div className="h-7 bg-gradient-to-r from-muted via-primary/10 to-muted rounded-full skeleton-shimmer w-28" />
          <div className="h-7 bg-gradient-to-r from-muted via-primary/10 to-muted rounded-full skeleton-shimmer w-20" />
        </div>

        {/* Agent Info */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-muted via-primary/10 to-muted rounded-full skeleton-shimmer ring-2 ring-muted/30" />
            <div className="flex flex-col gap-2">
              <div className="h-4 bg-gradient-to-r from-muted via-muted/60 to-muted rounded skeleton-shimmer w-28" />
              <div className="h-3 bg-gradient-to-r from-muted via-muted/60 to-muted rounded skeleton-shimmer w-20" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-10 bg-gradient-to-br from-muted via-primary/10 to-muted rounded-lg skeleton-shimmer" />
            <div className="h-10 w-10 bg-gradient-to-br from-muted via-primary/10 to-muted rounded-lg skeleton-shimmer" />
          </div>
        </div>
      </CardContent>
      <span className="sr-only">Chargement en cours...</span>
    </Card>
  );
};

export default PropertyCardSkeleton;
