"use client";

import Link from "next/link";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";
import { motion } from "motion/react";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface WeddingRow {
  id: number;
  slug: string;
  couple_name: string;
  template_image_url: string | null;
  wedding_date: string | null;
  is_locked: boolean;
  rsvpCount: number;
}

interface AdminDashboardViewProps {
  weddings: WeddingRow[];
}

export function AdminDashboardView({ weddings }: AdminDashboardViewProps) {
  const withTemplate = weddings.filter((w) => w.template_image_url).length;
  const withoutTemplate = weddings.filter((w) => !w.template_image_url).length;

  const stats = [
    { label: "Total Weddings", count: weddings.length },
    { label: "With Template", count: withTemplate },
    { label: "Missing Template", count: withoutTemplate },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-serif text-slate-800 mb-6">Admin Dashboard Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <GlassPanel key={stat.label} variant="light" className="p-8" delay={i * 0.1}>
              <p className="text-slate-500 font-medium mb-2">{stat.label}</p>
              <p className="text-6xl font-serif text-slate-800">{stat.count}</p>
            </GlassPanel>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-serif text-slate-800 mb-6">Recent Weddings</h2>
        <div className="space-y-4">
          {weddings.length === 0 ? (
            <GlassPanel className="p-8 text-center">
              <p className="text-slate-500">No weddings yet.</p>
              <Link
                href="/admin/couples"
                className="mt-4 inline-flex items-center gap-2 text-sm text-slate-800 hover:underline font-medium"
              >
                Create your first wedding
              </Link>
            </GlassPanel>
          ) : (
            weddings.slice(0, 5).map((wedding, i) => (
              <Link key={wedding.id} href={`/admin/weddings/${wedding.id}`} className="block">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-light p-5 rounded-2xl flex items-center justify-between hover:bg-white/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-6">
                    <p className="font-semibold text-slate-800">{wedding.couple_name}</p>
                    <p className="text-slate-400 text-sm font-mono">
                      {wedding.wedding_date ? new Date(wedding.wedding_date).toLocaleDateString() : "No date"}
                    </p>
                    <p className="text-slate-400 text-sm font-mono">/w/{wedding.slug}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {wedding.template_image_url ? (
                      <div className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-100/50 text-emerald-700 text-xs font-semibold">
                        <CheckCircle2 size={14} />
                        Ready
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-amber-100/50 text-amber-700 text-xs font-semibold">
                        <AlertCircle size={14} />
                        No template
                      </div>
                    )}

                    <div
                      className={`w-3 h-3 rounded-full ${wedding.template_image_url ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`}
                    />
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
