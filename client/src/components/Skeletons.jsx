function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}

export function MovieGridSkeleton({ count = 10 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <Skeleton className="aspect-[2/3] w-full rounded-none" />
          <div className="p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="mt-3 h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MovieDetailsSkeleton() {
  return (
    <div className="container-page">
      <section className="grid gap-6 md:grid-cols-[220px_1fr]">
        <Skeleton className="aspect-[2/3] w-full" />
        <div className="pt-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-6 h-4 w-56" />
        </div>
      </section>
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-10 w-44" />
        </div>
        <ShowListSkeleton />
      </section>
    </div>
  );
}

export function ShowListSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-48 flex-1">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="mt-3 h-4 w-1/3" />
            </div>
            <Skeleton className="h-9 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TheaterGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border border-slate-200 bg-white p-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="mt-3 h-4 w-1/3" />
          <Skeleton className="mt-5 h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export function SeatSelectionSkeleton() {
  return (
    <div className="container-page grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <Skeleton className="mb-4 h-8 w-40" />
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <Skeleton className="mb-6 h-9 w-full" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, row) => (
              <div key={row} className="grid grid-cols-8 gap-2">
                {Array.from({ length: 8 }).map((__, seat) => (
                  <Skeleton key={seat} className="h-10" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-5 h-4 w-full" />
        <Skeleton className="mt-3 h-4 w-3/4" />
        <Skeleton className="mt-8 h-12 w-full" />
      </div>
    </div>
  );
}

export function BookingListSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <article key={index} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-[1fr_160px]">
          <div>
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="mt-3 h-4 w-2/3" />
            <Skeleton className="mt-4 h-4 w-1/2" />
            <Skeleton className="mt-3 h-4 w-24" />
            <Skeleton className="mt-5 h-9 w-32" />
          </div>
          <Skeleton className="h-36 w-36" />
        </article>
      ))}
    </div>
  );
}

export function OwnerListSkeleton({ count = 5 }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <article key={index} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <Skeleton className="h-5 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </article>
      ))}
    </div>
  );
}

export function FormOptionsSkeleton() {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
