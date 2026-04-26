import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/glassmorphism/glass-card";
import { GlassButton } from "@/components/glassmorphism/glass-button";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const role = user.app_metadata?.role;
    if (role === "admin") {
      redirect("/admin");
    }
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-900/40 via-purple-900/30 to-indigo-900/40" />
      <div className="absolute inset-0 backdrop-blur-sm" />

      <GlassCard className="relative z-10 max-w-lg w-full mx-4 p-8 md:p-12 text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Wedding Management
        </h1>
        <p className="text-lg text-white/80">
          Create beautiful wedding landing pages and manage RSVPs with ease.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/login" passHref>
            <GlassButton variant="primary" size="lg" className="w-full sm:w-auto">
              Sign In
            </GlassButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
