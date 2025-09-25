import { Card, CardContent } from "@/components/ui/card";

export const PropertyCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      
      <CardContent className="p-4 space-y-4">
        {/* Title & Price skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
          <div className="flex justify-between">
            <div className="h-8 bg-muted rounded animate-pulse w-1/2" />
            <div className="h-5 bg-muted rounded animate-pulse w-1/4" />
          </div>
        </div>

        {/* Location skeleton */}
        <div className="h-4 bg-muted rounded animate-pulse w-2/3" />

        {/* Property details skeleton */}
        <div className="flex gap-4">
          <div className="h-4 bg-muted rounded animate-pulse w-12" />
          <div className="h-4 bg-muted rounded animate-pulse w-12" />
          <div className="h-4 bg-muted rounded animate-pulse w-16" />
        </div>

        {/* Features skeleton */}
        <div className="flex gap-2">
          <div className="h-6 bg-muted rounded animate-pulse w-16" />
          <div className="h-6 bg-muted rounded animate-pulse w-20" />
          <div className="h-6 bg-muted rounded animate-pulse w-12" />
        </div>

        {/* Agent section skeleton */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 bg-muted rounded animate-pulse w-20" />
              <div className="h-3 bg-muted rounded animate-pulse w-16" />
            </div>
          </div>
          <div className="flex gap-1">
            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};