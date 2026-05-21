"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ExternalLink, Layout, Pencil } from "lucide-react";
import { NewTabLink } from "@/components/new-tab-link";
import { GlassPanel } from "@/components/glassmorphism/glass-panel";

interface WeddingRow {
  id: number;
  slug: string;
  couple_name: string;
  template_image_url: string | null;
  wedding_date: string | null;
  is_locked: boolean;
  rsvpCount: number;
}

interface WeddingListTableProps {
  weddings: WeddingRow[];
}

function getStatusColor(status: string) {
  switch (status) {
    case "Open": return "bg-emerald-100/50 text-emerald-700";
    case "Missing": return "bg-rose-100/50 text-rose-700";
    case "Locked": return "bg-slate-200/50 text-slate-700";
    default: return "bg-slate-100/50 text-slate-700";
  }
}

export function WeddingListTable({ weddings }: WeddingListTableProps) {
  const router = useRouter();

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/20">
              <th className="px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Couple Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Wedding Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">RSVPs</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Template</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {weddings.map((wedding, i) => (
              <motion.tr
                key={wedding.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="hover:bg-white/10 transition-colors cursor-pointer group"
                onClick={() => router.push(`/admin/weddings/${wedding.id}`)}
              >
                <td className="px-6 py-5 font-semibold text-slate-800" onClick={(e) => e.stopPropagation()}>
                  <Link href={`/admin/weddings/${wedding.id}`} className="hover:underline">
                    {wedding.couple_name}
                  </Link>
                </td>
                <td className="px-6 py-5 text-slate-600 font-mono text-sm">
                  {wedding.wedding_date ? new Date(wedding.wedding_date).toLocaleDateString() : "Not set"}
                </td>
                <td className="px-6 py-5 text-slate-600">{wedding.rsvpCount}</td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(wedding.is_locked ? "Locked" : "Open")}`}>
                    {wedding.is_locked ? "Locked" : "Open"}
                  </span>
                </td>
                <td className="px-6 py-5 text-slate-500">
                  {wedding.template_image_url ? "Uploaded" : "Missing"}
                </td>
                <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/weddings/${wedding.id}`}
                      className="p-2 rounded-xl glass hover:bg-white/40 text-slate-600 hover:text-slate-900 transition-all"
                      title="Edit Wedding"
                    >
                      <Pencil size={18} />
                    </Link>
                    <Link
                      href={`/admin/weddings/${wedding.id}/floor-plan`}
                      className="p-2 rounded-xl glass hover:bg-white/40 text-slate-600 hover:text-slate-900 transition-all"
                      title="Floor Plan"
                    >
                      <Layout size={18} />
                    </Link>
                    <NewTabLink
                      href={`/w/${wedding.slug}`}
                      className="p-2 rounded-xl glass hover:bg-white/40 text-slate-600 hover:text-slate-900 transition-all"
                      title="View Page"
                    >
                      <ExternalLink size={18} />
                    </NewTabLink>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {weddings.map((wedding) => (
          <GlassPanel key={wedding.id} variant="medium" className="p-4">
            <dl className="space-y-2">
              <div className="flex justify-between items-start gap-4">
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">Couple Name</dt>
                <dd className="text-sm text-right">
                  <Link href={`/admin/weddings/${wedding.id}`} className="font-semibold text-slate-800 hover:underline">
                    {wedding.couple_name}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between items-start gap-4">
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">Wedding Date</dt>
                <dd className="text-sm text-right font-mono text-slate-600">
                  {wedding.wedding_date ? new Date(wedding.wedding_date).toLocaleDateString() : "Not set"}
                </dd>
              </div>
              <div className="flex justify-between items-start gap-4">
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">RSVPs</dt>
                <dd className="text-sm text-right text-slate-600">{wedding.rsvpCount}</dd>
              </div>
              <div className="flex justify-between items-start gap-4">
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">Status</dt>
                <dd className="text-sm text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(wedding.is_locked ? "Locked" : "Open")}`}>
                    {wedding.is_locked ? "Locked" : "Open"}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between items-start gap-4">
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">Template</dt>
                <dd className="text-sm text-right text-slate-500">
                  {wedding.template_image_url ? "Uploaded" : "Missing"}
                </dd>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Link
                  href={`/admin/weddings/${wedding.id}`}
                  className="p-2 rounded-xl glass hover:bg-white/40 text-slate-600 hover:text-slate-900 transition-all"
                  title="Edit Wedding"
                >
                  <Pencil size={18} />
                </Link>
                <Link
                  href={`/admin/weddings/${wedding.id}/floor-plan`}
                  className="p-2 rounded-xl glass hover:bg-white/40 text-slate-600 hover:text-slate-900 transition-all"
                  title="Floor Plan"
                >
                  <Layout size={18} />
                </Link>
                <NewTabLink
                  href={`/w/${wedding.slug}`}
                  className="p-2 rounded-xl glass hover:bg-white/40 text-slate-600 hover:text-slate-900 transition-all"
                  title="View Page"
                >
                  <ExternalLink size={18} />
                </NewTabLink>
              </div>
            </dl>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
