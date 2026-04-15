import { Skeleton } from "@/components/ui/skeleton";

export default function LandingPageLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Skeleton className="h-[75vh] w-full max-w-3xl" />
      <div className="mt-6 flex flex-col items-center gap-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
