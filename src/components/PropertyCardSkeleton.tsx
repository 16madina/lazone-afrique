import { Card, CardContent } from "@/components/ui/card";

const PropertyCardSkeleton = () => {
  return (
    <Card className="overflow-hidden glass-card animate-fade-in">
      {/* Image Skeleton with shimmer */}
      <div className="relative aspect-[4/3] bg-muted skeleton-shimmer" />

      <CardContent className="p-4 space-y-4">
        {/* Title & Price */}
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded skeleton-shimmer w-3/4" />
          <div className="flex items-center justify-between">
            <div className="h-8 bg-muted rounded skeleton-shimmer w-1/3" />
            <div className="h-5 bg-muted rounded skeleton-shimmer w-20" />
          </div>
        </div>

        {/* Location */}
        <div className="h-4 bg-muted rounded skeleton-shimmer w-1/2" />

        {/* Property Details */}
        <div className="flex items-center gap-4">
          <div className="h-4 bg-muted rounded skeleton-shimmer w-12" />
          <div className="h-4 bg-muted rounded skeleton-shimmer w-12" />
          <div className="h-4 bg-muted rounded skeleton-shimmer w-16" />
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1">
          <div className="h-6 bg-muted rounded-full skeleton-shimmer w-20" />
          <div className="h-6 bg-muted rounded-full skeleton-shimmer w-24" />
          <div className="h-6 bg-muted rounded-full skeleton-shimmer w-16" />
        </div>

        {/* Agent Info */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted rounded-full skeleton-shimmer" />
            <div className="flex flex-col gap-1">
              <div className="h-4 bg-muted rounded skeleton-shimmer w-24" />
              <div className="h-3 bg-muted rounded skeleton-shimmer w-16" />
            </div>
          </div>
          <div className="flex gap-1">
            <div className="h-8 w-8 bg-muted rounded skeleton-shimmer" />
            <div className="h-8 w-8 bg-muted rounded skeleton-shimmer" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCardSkeleton;
