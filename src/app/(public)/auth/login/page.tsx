"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";
import { GlassInput } from "@/components/glassmorphism/glass-input";
import { GlassButton } from "@/components/glassmorphism/glass-button";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function handleSubmit(data: LoginFormData) {
    setServerError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setServerError(authError.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .single();

    if (profile?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-200/40 blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/40 blur-[100px] animate-pulse delay-1000" />

      <GlassPanel className="w-full max-w-md p-10 md:p-12 text-center" variant="medium" padding="none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-4xl md:text-5xl font-serif text-slate-800 mb-2">Sign In</h1>
          <p className="text-slate-500 mb-10">Enter your credentials to access the dashboard</p>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 text-left">
            <div>
              <GlassInput
                label="Email"
                type="email"
                placeholder="admin@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-rose-600 mt-1 ml-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <GlassInput
                label="Password"
                type="password"
                placeholder="••••••••"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-rose-600 mt-1 ml-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <p className="text-sm text-rose-600 text-center">{serverError}</p>
            )}

            <div className="pt-4">
              <GlassButton type="submit" className="w-full text-lg" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </GlassButton>
            </div>
          </form>
        </motion.div>
      </GlassPanel>

      {/* Floating brand - Bottom Left */}
      <div className="absolute bottom-10 left-10 hidden md:flex items-center gap-3">
        <div className="w-10 h-10 rounded-full glass border-white flex items-center justify-center font-serif text-xl text-slate-800">
          W
        </div>
      </div>
    </div>
  );
}
