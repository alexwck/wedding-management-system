import Link from "next/link";
import { GlassButton } from "@/components/glassmorphism/glass-button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="glass-panel rounded-glass p-8 max-w-md">
        <h1 className="text-6xl font-serif font-bold text-slate-800">404</h1>
        <p className="mt-4 text-lg text-slate-500">
          Page not found
        </p>
        <p className="mt-2 text-sm text-slate-500">
          The wedding link may be invalid or has been removed.
        </p>
        <Link href="/">
          <GlassButton className="mt-6" variant="primary">
            Go Home
          </GlassButton>
        </Link>
      </div>
    </div>
  );
}
