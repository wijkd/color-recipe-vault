import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

const ProfileCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border-0 shadow-sm bg-card h-full">
      <div className="flex gap-4 p-4 h-full">
        {/* Image skeleton */}
        <Skeleton className="w-40 h-40 flex-shrink-0 rounded-md" />

        {/* Content skeleton */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Title */}
          <Skeleton className="h-6 w-3/4 mb-2" />
          
          {/* Author */}
          <Skeleton className="h-4 w-1/2 mb-2" />
          
          {/* Camera model */}
          <Skeleton className="h-4 w-2/3 mb-2" />
          
          {/* Description lines */}
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6 mb-3" />

          {/* Bottom section */}
          <div className="mt-auto space-y-2">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileCardSkeleton;
