export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="glass-panel rounded-glass p-8 text-center max-w-md w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/30 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-white/30 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-white/30 rounded w-2/3 mx-auto" />
        </div>
      </div>
    </div>
  );
}
