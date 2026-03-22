import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="flex flex-col space-y-4 p-8 w-full max-w-4xl mx-auto">
      <Skeleton className="h-10 w-3/4 rounded-md" />
      <div className="space-y-6 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`flex w-full ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <Skeleton className={`h-24 ${i % 2 === 0 ? 'w-2/3' : 'w-3/4'} rounded-xl`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArtifactGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  );
}
