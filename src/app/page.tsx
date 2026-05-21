import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-200/40 blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/40 blur-[100px] animate-pulse delay-1000" />

      <GlassPanel className="relative z-10 max-w-lg w-full mx-4 p-8 md:p-12 text-center space-y-6" variant="medium">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-800">
          Wedding Management
        </h1>
        <p className="text-lg text-slate-600">
          Create beautiful wedding landing pages and manage RSVPs with ease.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/login" passHref>
            <GlassButton variant="primary" size="lg" className="w-full sm:w-auto">
              Sign In
            </GlassButton>
          </Link>
        </div>
      </GlassPanel>
    </div>
  );
}
