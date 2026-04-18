// // src/app/dashboard/analytics/AnalyticsClient.tsx
// "use client";

// import { useEffect, useState } from "react";
// import {
//   BarChart2,
//   RefreshCw,
//   Loader2,
//   TrendingUp,
//   Eye,
//   Heart,
//   MessageCircle,
//   Share2,
//   Bookmark,
//   MousePointer,
//   Users,
//   Instagram,
//   Facebook,
//   Trophy,
//   FileText,
//   CheckCircle2,
//   Clock,
//   AlertCircle,
// } from "lucide-react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   Legend,
// } from "recharts";
// import { motion } from "framer-motion";
// import { format } from "date-fns";

// type AnalyticsData = {
//   totals: {
//     impressions: number;
//     reach: number;
//     likes: number;
//     comments: number;
//     shares: number;
//     saves: number;
//     clicks: number;
//   };
//   platformBreakdown: {
//     facebook: {
//       posts: number;
//       impressions: number;
//       reach: number;
//       likes: number;
//       comments: number;
//       shares: number;
//       engagementRate: number;
//     };
//     instagram: {
//       posts: number;
//       impressions: number;
//       reach: number;
//       likes: number;
//       comments: number;
//       shares: number;
//       saves: number;
//       engagementRate: number;
//     };
//   };
//   chartData: Array<{
//     date: string;
//     impressions: number;
//     reach: number;
//     likes: number;
//     posts: number;
//   }>;
//   bestPost: {
//     id: string;
//     title: string;
//     platform: string;
//     image?: string;
//     analytics: {
//       impressions: number;
//       reach: number;
//       likes: number;
//       comments: number;
//       engagementRate: number;
//     };
//   } | null;
//   statusCounts: {
//     draft: number;
//     published: number;
//     scheduled: number;
//     failed: number;
//     total: number;
//   };
//   postAnalyticsList: Array<{
//     id: string;
//     title: string;
//     platform: string;
//     image?: string;
//     publishedAt: string;
//     analytics: {
//       impressions: number;
//       reach: number;
//       likes: number;
//       comments: number;
//       shares: number;
//       saves: number;
//       engagementRate: number;
//     } | null;
//   }>;
//   lastSyncedAt: string | null;
// };

// export default function AnalyticsClient() {
//   const [data, setData] = useState<AnalyticsData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [syncing, setSyncing] = useState(false);
//   const [syncResult, setSyncResult] = useState<string | null>(null);
//   const [activeChart, setActiveChart] = useState<
//     "impressions" | "reach" | "likes"
//   >("impressions");

//   useEffect(() => {
//     fetchAnalytics();
//   }, []);

//   async function fetchAnalytics() {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/analytics");
//       const json = await res.json();
//       setData(json);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleSync() {
//     setSyncing(true);
//     setSyncResult(null);
//     try {
//       const res = await fetch("/api/analytics/sync", { method: "POST" });
//       const json = await res.json();
//       if (json.success) {
//         setSyncResult(
//           `Synced ${json.synced} post${json.synced !== 1 ? "s" : ""} successfully`,
//         );
//         await fetchAnalytics();
//       } else {
//         setSyncResult(`Sync failed: ${json.error}`);
//       }
//     } catch {
//       setSyncResult("Sync failed. Please try again.");
//     } finally {
//       setSyncing(false);
//     }
//   }

//   if (loading) {
//     return (
//       <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
//         <div className="flex items-center gap-3 text-slate-400">
//           <Loader2 className="animate-spin h-5 w-5" />
//           Loading analytics...
//         </div>
//       </main>
//     );
//   }

//   const hasPublishedPosts = (data?.statusCounts.published ?? 0) > 0;
//   const hasAnalytics =
//     (data?.postAnalyticsList.filter((p) => p.analytics).length ?? 0) > 0;

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-white">
//       <section className="mx-auto max-w-7xl space-y-8">
//         {/* ── Header ── */}
//         <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div className="flex items-center gap-4">
//             <div className="rounded-xl bg-indigo-600/20 p-3">
//               <BarChart2 className="h-6 w-6 text-indigo-400" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold">Analytics</h1>
//               <p className="text-slate-400 text-sm mt-0.5">
//                 Performance insights for your published posts
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             {data?.lastSyncedAt && (
//               <span className="text-xs text-slate-500">
//                 Last synced:{" "}
//                 {format(new Date(data.lastSyncedAt), "MMM d, h:mm a")}
//               </span>
//             )}
//             <button
//               onClick={handleSync}
//               disabled={syncing}
//               className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-sm font-medium transition disabled:opacity-60"
//             >
//               {syncing ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 <RefreshCw className="h-4 w-4" />
//               )}
//               {syncing ? "Syncing..." : "Sync Analytics"}
//             </button>
//           </div>
//         </header>

//         {/* Sync result message */}
//         {syncResult && (
//           <motion.div
//             initial={{ opacity: 0, y: -5 }}
//             animate={{ opacity: 1, y: 0 }}
//             className={`rounded-xl border px-4 py-3 text-sm ${
//               syncResult.includes("failed")
//                 ? "bg-red-500/10 border-red-500/30 text-red-400"
//                 : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
//             }`}
//           >
//             {syncResult}
//           </motion.div>
//         )}

//         {/* No published posts yet */}
//         {!hasPublishedPosts && (
//           <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
//             <BarChart2 className="h-12 w-12 mx-auto mb-4 text-slate-600" />
//             <p className="text-lg font-medium text-slate-300">
//               No published posts yet
//             </p>
//             <p className="text-sm text-slate-500 mt-2">
//               Publish posts to Facebook or Instagram to see analytics here.
//             </p>
//           </div>
//         )}

//         {hasPublishedPosts && (
//           <>
//             {/* ── Post Status Overview ── */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {[
//                 {
//                   label: "Total Posts",
//                   value: data?.statusCounts.total,
//                   icon: FileText,
//                   color: "text-slate-300",
//                   bg: "bg-slate-700/30",
//                 },
//                 {
//                   label: "Published",
//                   value: data?.statusCounts.published,
//                   icon: CheckCircle2,
//                   color: "text-emerald-400",
//                   bg: "bg-emerald-500/10",
//                 },
//                 {
//                   label: "Scheduled",
//                   value: data?.statusCounts.scheduled,
//                   icon: Clock,
//                   color: "text-blue-400",
//                   bg: "bg-blue-500/10",
//                 },
//                 {
//                   label: "Failed",
//                   value: data?.statusCounts.failed,
//                   icon: AlertCircle,
//                   color: "text-red-400",
//                   bg: "bg-red-500/10",
//                 },
//               ].map((stat, i) => (
//                 <motion.div
//                   key={stat.label}
//                   initial={{ opacity: 0, y: 15 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: i * 0.05 }}
//                   className={`rounded-2xl border border-slate-800 ${stat.bg} p-5`}
//                 >
//                   <div className="flex items-center justify-between mb-3">
//                     <span className="text-xs text-slate-400 font-medium">
//                       {stat.label}
//                     </span>
//                     <stat.icon className={`h-4 w-4 ${stat.color}`} />
//                   </div>
//                   <p className={`text-3xl font-bold ${stat.color}`}>
//                     {stat.value ?? 0}
//                   </p>
//                 </motion.div>
//               ))}
//             </div>

//             {/* No analytics data yet — prompt sync */}
//             {!hasAnalytics && (
//               <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-8 text-center">
//                 <TrendingUp className="h-10 w-10 mx-auto mb-3 text-indigo-400 opacity-60" />
//                 <p className="text-slate-300 font-medium">
//                   Analytics not synced yet
//                 </p>
//                 <p className="text-sm text-slate-500 mt-1 mb-4">
//                   Click "Sync Analytics" to fetch the latest data from Facebook
//                   and Instagram.
//                 </p>
//                 <button
//                   onClick={handleSync}
//                   disabled={syncing}
//                   className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-medium transition disabled:opacity-60"
//                 >
//                   {syncing ? (
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   ) : (
//                     <RefreshCw className="h-4 w-4" />
//                   )}
//                   Sync Now
//                 </button>
//               </div>
//             )}

//             {hasAnalytics && (
//               <>
//                 {/* ── Total Engagement Stats ── */}
//                 <div>
//                   <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
//                     Total Engagement (All Platforms)
//                   </h2>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
//                     {[
//                       {
//                         label: "Impressions",
//                         value: data?.totals.impressions,
//                         icon: Eye,
//                         color: "text-purple-400",
//                       },
//                       {
//                         label: "Reach",
//                         value: data?.totals.reach,
//                         icon: Users,
//                         color: "text-blue-400",
//                       },
//                       {
//                         label: "Likes",
//                         value: data?.totals.likes,
//                         icon: Heart,
//                         color: "text-pink-400",
//                       },
//                       {
//                         label: "Comments",
//                         value: data?.totals.comments,
//                         icon: MessageCircle,
//                         color: "text-yellow-400",
//                       },
//                       {
//                         label: "Shares",
//                         value: data?.totals.shares,
//                         icon: Share2,
//                         color: "text-green-400",
//                       },
//                       {
//                         label: "Saves",
//                         value: data?.totals.saves,
//                         icon: Bookmark,
//                         color: "text-indigo-400",
//                       },
//                     ].map((stat, i) => (
//                       <motion.div
//                         key={stat.label}
//                         initial={{ opacity: 0, scale: 0.95 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ delay: i * 0.05 }}
//                         className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center"
//                       >
//                         <stat.icon
//                           className={`h-5 w-5 mx-auto mb-2 ${stat.color}`}
//                         />
//                         <p className="text-xl font-bold text-white">
//                           {formatNumber(stat.value ?? 0)}
//                         </p>
//                         <p className="text-xs text-slate-400 mt-1">
//                           {stat.label}
//                         </p>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* ── Platform Breakdown ── */}
//                 <div>
//                   <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
//                     Platform Breakdown
//                   </h2>
//                   <div className="grid md:grid-cols-2 gap-6">
//                     {/* Facebook */}
//                     <PlatformCard
//                       platform="facebook"
//                       data={data!.platformBreakdown.facebook}
//                     />
//                     {/* Instagram */}
//                     <PlatformCard
//                       platform="instagram"
//                       data={data!.platformBreakdown.instagram}
//                     />
//                   </div>
//                 </div>

//                 {/* ── Performance Chart ── */}
//                 {data!.chartData.length > 0 && (
//                   <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
//                     <div className="flex items-center justify-between mb-6">
//                       <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
//                         Performance Over Time (Last 30 Days)
//                       </h2>
//                       <div className="flex gap-2">
//                         {(["impressions", "reach", "likes"] as const).map(
//                           (metric) => (
//                             <button
//                               key={metric}
//                               onClick={() => setActiveChart(metric)}
//                               className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
//                                 activeChart === metric
//                                   ? "bg-indigo-600 text-white"
//                                   : "bg-slate-800 text-slate-400 hover:text-white"
//                               }`}
//                             >
//                               {metric}
//                             </button>
//                           ),
//                         )}
//                       </div>
//                     </div>
//                     <ResponsiveContainer width="100%" height={280}>
//                       <LineChart data={data!.chartData}>
//                         <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
//                         <XAxis
//                           dataKey="date"
//                           tick={{ fill: "#64748b", fontSize: 11 }}
//                           tickFormatter={(val) =>
//                             format(new Date(val), "MMM d")
//                           }
//                         />
//                         <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
//                         <Tooltip
//                           contentStyle={{
//                             backgroundColor: "#0f172a",
//                             border: "1px solid #1e293b",
//                             borderRadius: "12px",
//                             color: "#fff",
//                           }}
//                           labelFormatter={(val) =>
//                             format(new Date(val), "MMM d, yyyy")
//                           }
//                         />
//                         <Line
//                           type="monotone"
//                           dataKey={activeChart}
//                           stroke={
//                             activeChart === "impressions"
//                               ? "#818cf8"
//                               : activeChart === "reach"
//                                 ? "#38bdf8"
//                                 : "#f472b6"
//                           }
//                           strokeWidth={2}
//                           dot={{ fill: "#0f172a", strokeWidth: 2, r: 4 }}
//                           activeDot={{ r: 6 }}
//                         />
//                       </LineChart>
//                     </ResponsiveContainer>
//                   </div>
//                 )}

//                 {/* ── Best Performing Post ── */}
//                 {data?.bestPost && (
//                   <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-6">
//                     <div className="flex items-center gap-2 mb-4">
//                       <Trophy className="h-5 w-5 text-yellow-400" />
//                       <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">
//                         Best Performing Post
//                       </h2>
//                     </div>
//                     <div className="flex gap-5">
//                       {data.bestPost.image && (
//                         <img
//                           src={data.bestPost.image}
//                           alt=""
//                           className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
//                         />
//                       )}
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-2 mb-2">
//                           {data.bestPost.platform === "instagram" ? (
//                             <Instagram className="h-4 w-4 text-pink-400" />
//                           ) : (
//                             <Facebook className="h-4 w-4 text-blue-400" />
//                           )}
//                           <span className="text-xs text-slate-400 capitalize">
//                             {data.bestPost.platform}
//                           </span>
//                         </div>
//                         <p className="font-semibold text-white truncate">
//                           {data.bestPost.title}
//                         </p>
//                         <div className="flex gap-4 mt-3 text-sm">
//                           <span className="text-slate-300">
//                             <span className="text-yellow-400 font-bold">
//                               {data.bestPost.analytics.engagementRate}%
//                             </span>{" "}
//                             engagement
//                           </span>
//                           <span className="text-slate-300">
//                             <span className="font-bold text-white">
//                               {formatNumber(
//                                 data.bestPost.analytics.impressions,
//                               )}
//                             </span>{" "}
//                             impressions
//                           </span>
//                           <span className="text-slate-300">
//                             <span className="font-bold text-white">
//                               {formatNumber(data.bestPost.analytics.likes)}
//                             </span>{" "}
//                             likes
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* ── Per Post Analytics Table ── */}
//                 <div>
//                   <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
//                     All Published Posts
//                   </h2>
//                   <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
//                     <div className="overflow-x-auto">
//                       <table className="w-full text-sm">
//                         <thead>
//                           <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
//                             <th className="text-left px-5 py-3">Post</th>
//                             <th className="text-left px-4 py-3">Platform</th>
//                             <th className="text-right px-4 py-3">
//                               Impressions
//                             </th>
//                             <th className="text-right px-4 py-3">Reach</th>
//                             <th className="text-right px-4 py-3">Likes</th>
//                             <th className="text-right px-4 py-3">Comments</th>
//                             <th className="text-right px-4 py-3">Shares</th>
//                             <th className="text-right px-4 py-3">Eng. Rate</th>
//                             <th className="text-right px-5 py-3">Published</th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-800">
//                           {data!.postAnalyticsList.map((post) => (
//                             <tr
//                               key={post.id}
//                               className="hover:bg-slate-800/40 transition"
//                             >
//                               <td className="px-5 py-3">
//                                 <div className="flex items-center gap-3">
//                                   {post.image && (
//                                     <img
//                                       src={post.image}
//                                       className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
//                                     />
//                                   )}
//                                   <span className="text-white truncate max-w-[180px]">
//                                     {post.title}
//                                   </span>
//                                 </div>
//                               </td>
//                               <td className="px-4 py-3">
//                                 <div className="flex items-center gap-1.5">
//                                   {post.platform === "instagram" ? (
//                                     <Instagram className="h-3.5 w-3.5 text-pink-400" />
//                                   ) : (
//                                     <Facebook className="h-3.5 w-3.5 text-blue-400" />
//                                   )}
//                                   <span className="text-slate-300 capitalize text-xs">
//                                     {post.platform}
//                                   </span>
//                                 </div>
//                               </td>
//                               <td className="px-4 py-3 text-right text-slate-300">
//                                 {post.analytics
//                                   ? formatNumber(post.analytics.impressions)
//                                   : "—"}
//                               </td>
//                               <td className="px-4 py-3 text-right text-slate-300">
//                                 {post.analytics
//                                   ? formatNumber(post.analytics.reach)
//                                   : "—"}
//                               </td>
//                               <td className="px-4 py-3 text-right text-slate-300">
//                                 {post.analytics
//                                   ? formatNumber(post.analytics.likes)
//                                   : "—"}
//                               </td>
//                               <td className="px-4 py-3 text-right text-slate-300">
//                                 {post.analytics
//                                   ? formatNumber(post.analytics.comments)
//                                   : "—"}
//                               </td>
//                               <td className="px-4 py-3 text-right text-slate-300">
//                                 {post.analytics
//                                   ? formatNumber(post.analytics.shares)
//                                   : "—"}
//                               </td>
//                               <td className="px-4 py-3 text-right">
//                                 {post.analytics ? (
//                                   <span
//                                     className={`font-semibold ${
//                                       post.analytics.engagementRate > 5
//                                         ? "text-emerald-400"
//                                         : post.analytics.engagementRate > 2
//                                           ? "text-yellow-400"
//                                           : "text-slate-400"
//                                     }`}
//                                   >
//                                     {post.analytics.engagementRate}%
//                                   </span>
//                                 ) : (
//                                   "—"
//                                 )}
//                               </td>
//                               <td className="px-5 py-3 text-right text-slate-400 text-xs">
//                                 {post.publishedAt
//                                   ? format(
//                                       new Date(post.publishedAt),
//                                       "MMM d, yyyy",
//                                     )
//                                   : "—"}
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </>
//         )}
//       </section>
//     </main>
//   );
// }

// // ── Platform Card Component ──────────────────────────────────────────
// function PlatformCard({
//   platform,
//   data,
// }: {
//   platform: "facebook" | "instagram";
//   data: any;
// }) {
//   const isFb = platform === "facebook";
//   const Icon = isFb ? Facebook : Instagram;
//   const color = isFb ? "text-blue-400" : "text-pink-400";
//   const borderColor = isFb ? "border-blue-500/20" : "border-pink-500/20";
//   const bgColor = isFb ? "bg-blue-500/5" : "bg-pink-500/5";

//   const stats = [
//     { label: "Posts", value: data.posts },
//     { label: "Impressions", value: data.impressions },
//     { label: "Reach", value: data.reach },
//     { label: "Likes", value: data.likes },
//     { label: "Comments", value: data.comments },
//     { label: "Shares", value: data.shares },
//     ...(!isFb && data.saves !== undefined
//       ? [{ label: "Saves", value: data.saves }]
//       : []),
//   ];

//   return (
//     <div className={`rounded-2xl border ${borderColor} ${bgColor} p-5`}>
//       <div className="flex items-center gap-3 mb-4">
//         <Icon className={`h-5 w-5 ${color}`} />
//         <span className={`font-semibold capitalize ${color}`}>{platform}</span>
//         <span className="ml-auto text-xs text-slate-400">
//           Avg. engagement:{" "}
//           <span className="text-white font-medium">{data.engagementRate}%</span>
//         </span>
//       </div>
//       <div className="grid grid-cols-3 gap-3">
//         {stats.map((stat) => (
//           <div key={stat.label} className="text-center">
//             <p className="text-lg font-bold text-white">
//               {formatNumber(stat.value)}
//             </p>
//             <p className="text-xs text-slate-400">{stat.label}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ── Utility ──────────────────────────────────────────────────────────
// function formatNumber(n: number): string {
//   if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
//   if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
//   return n.toString();
// }

"use client";

import { useEffect, useState } from "react";
import {
  BarChart2,
  RefreshCw,
  Loader2,
  Heart,
  MessageCircle,
  Instagram,
  Facebook,
  Trophy,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

type AnalyticsData = {
  platformBreakdown: {
    facebook: {
      posts: number;
      likes: number;
      comments: number;
      engagementRate: number;
    };
    instagram: {
      posts: number;
      likes: number;
      comments: number;
      engagementRate: number;
    };
  };
  bestPost: {
    id: string;
    title: string;
    platform: string;
    image?: string;
    analytics: {
      likes: number;
      comments: number;
      engagementRate: number;
    };
  } | null;
  statusCounts: {
    draft: number;
    published: number;
    scheduled: number;
    failed: number;
    total: number;
  };
  postAnalyticsList: Array<{
    id: string;
    title: string;
    platform: string;
    image?: string;
    publishedAt: string;
    analytics: {
      likes: number;
      comments: number;
      engagementRate: number;
    } | null;
  }>;
  lastSyncedAt: string | null;
};

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/analytics/sync", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSyncResult(
          `Synced ${json.synced} post${json.synced !== 1 ? "s" : ""} successfully`,
        );
        await fetchAnalytics();
      } else {
        setSyncResult(`Sync failed: ${json.error}`);
      }
    } catch {
      setSyncResult("Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="animate-spin h-5 w-5" />
          Loading analytics...
        </div>
      </main>
    );
  }

  const hasPublishedPosts = (data?.statusCounts.published ?? 0) > 0;
  const hasAnalytics =
    (data?.postAnalyticsList.filter((p) => p.analytics).length ?? 0) > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl space-y-8">
        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-indigo-600/20 p-3">
              <BarChart2 className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Likes & comments for your published posts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {data?.lastSyncedAt && (
              <span className="text-xs text-slate-500">
                Last synced:{" "}
                {format(new Date(data.lastSyncedAt), "MMM d, h:mm a")}
              </span>
            )}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-sm font-medium transition disabled:opacity-60"
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {syncing ? "Syncing..." : "Sync Analytics"}
            </button>
          </div>
        </header>

        {/* ── Dev mode notice ── */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          Meta app is in <span className="font-semibold">development mode</span>
          — only likes and comments are available right now.
        </div>

        {/* Sync result message */}
        {syncResult && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border px-4 py-3 text-sm ${
              syncResult.includes("failed")
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            }`}
          >
            {syncResult}
          </motion.div>
        )}

        {/* No published posts yet */}
        {!hasPublishedPosts && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
            <BarChart2 className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            <p className="text-lg font-medium text-slate-300">
              No published posts yet
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Publish posts to Facebook or Instagram to see analytics here.
            </p>
          </div>
        )}

        {hasPublishedPosts && (
          <>
            {/* ── Post Status Overview ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Posts",
                  value: data?.statusCounts.total,
                  icon: FileText,
                  color: "text-slate-300",
                  bg: "bg-slate-700/30",
                },
                {
                  label: "Published",
                  value: data?.statusCounts.published,
                  icon: CheckCircle2,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                },
                {
                  label: "Scheduled",
                  value: data?.statusCounts.scheduled,
                  icon: Clock,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                },
                {
                  label: "Failed",
                  value: data?.statusCounts.failed,
                  icon: AlertCircle,
                  color: "text-red-400",
                  bg: "bg-red-500/10",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border border-slate-800 ${stat.bg} p-5`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400 font-medium">
                      {stat.label}
                    </span>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value ?? 0}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* No analytics data yet — prompt sync */}
            {!hasAnalytics && (
              <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-8 text-center">
                <Heart className="h-10 w-10 mx-auto mb-3 text-indigo-400 opacity-60" />
                <p className="text-slate-300 font-medium">
                  Analytics not synced yet
                </p>
                <p className="text-sm text-slate-500 mt-1 mb-4">
                  Click "Sync Analytics" to fetch likes and comments from
                  Facebook and Instagram.
                </p>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-medium transition disabled:opacity-60"
                >
                  {syncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Sync Now
                </button>
              </div>
            )}

            {hasAnalytics && (
              <>
                {/* ── Platform Breakdown ── */}
                <div>
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Platform Breakdown
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <PlatformCard
                      platform="facebook"
                      data={data!.platformBreakdown.facebook}
                    />
                    <PlatformCard
                      platform="instagram"
                      data={data!.platformBreakdown.instagram}
                    />
                  </div>
                </div>

                {/* ── Best Performing Post ── */}
                {data?.bestPost && (
                  <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">
                        Best Performing Post
                      </h2>
                    </div>
                    <div className="flex gap-5">
                      {data.bestPost.image && (
                        <img
                          src={data.bestPost.image}
                          alt=""
                          className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {data.bestPost.platform === "instagram" ? (
                            <Instagram className="h-4 w-4 text-pink-400" />
                          ) : (
                            <Facebook className="h-4 w-4 text-blue-400" />
                          )}
                          <span className="text-xs text-slate-400 capitalize">
                            {data.bestPost.platform}
                          </span>
                        </div>
                        <p className="font-semibold text-white truncate">
                          {data.bestPost.title}
                        </p>
                        <div className="flex gap-4 mt-3 text-sm">
                          <span className="text-slate-300 flex items-center gap-1.5">
                            <Heart className="h-3.5 w-3.5 text-pink-400" />
                            <span className="font-bold text-white">
                              {formatNumber(data.bestPost.analytics.likes)}
                            </span>{" "}
                            likes
                          </span>
                          <span className="text-slate-300 flex items-center gap-1.5">
                            <MessageCircle className="h-3.5 w-3.5 text-yellow-400" />
                            <span className="font-bold text-white">
                              {formatNumber(data.bestPost.analytics.comments)}
                            </span>{" "}
                            comments
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Per Post Analytics Table ── */}
                <div>
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    All Published Posts
                  </h2>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="text-left px-5 py-3">Post</th>
                            <th className="text-left px-4 py-3">Platform</th>
                            <th className="text-right px-4 py-3">Likes</th>
                            <th className="text-right px-4 py-3">Comments</th>
                            <th className="text-right px-5 py-3">Published</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {data!.postAnalyticsList.map((post) => (
                            <tr
                              key={post.id}
                              className="hover:bg-slate-800/40 transition"
                              style={{ height: "60px" }}
                            >
                              <td className="px-5 py-3 align-middle">
                                <div className="flex items-center gap-3">
                                  {post.image && (
                                    <img
                                      src={post.image}
                                      alt=""
                                      style={{
                                        width: "36px",
                                        height: "36px",
                                        minWidth: "36px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                      }}
                                    />
                                  )}
                                  <span
                                    className="text-white text-sm"
                                    style={{
                                      maxWidth: "220px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      display: "block",
                                    }}
                                  >
                                    {post.title}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 align-middle">
                                <div className="flex items-center gap-1.5">
                                  {post.platform === "instagram" ? (
                                    <Instagram className="h-3.5 w-3.5 text-pink-400" />
                                  ) : (
                                    <Facebook className="h-3.5 w-3.5 text-blue-400" />
                                  )}
                                  <span className="text-slate-300 capitalize text-xs">
                                    {post.platform}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 align-middle text-right">
                                {post.analytics ? (
                                  <span className="inline-flex items-center justify-end gap-1.5 text-slate-300">
                                    <Heart className="h-3.5 w-3.5 text-pink-400" />
                                    {formatNumber(post.analytics.likes)}
                                  </span>
                                ) : (
                                  <span className="text-slate-600">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 align-middle text-right">
                                {post.analytics ? (
                                  <span className="inline-flex items-center justify-end gap-1.5 text-slate-300">
                                    <MessageCircle className="h-3.5 w-3.5 text-yellow-400" />
                                    {formatNumber(post.analytics.comments)}
                                  </span>
                                ) : (
                                  <span className="text-slate-600">—</span>
                                )}
                              </td>
                              <td className="px-5 py-3 align-middle text-right text-slate-400 text-xs whitespace-nowrap">
                                {post.publishedAt
                                  ? format(
                                      new Date(post.publishedAt),
                                      "MMM d, yyyy",
                                    )
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}

// ── Platform Card Component ──────────────────────────────────────────
function PlatformCard({
  platform,
  data,
}: {
  platform: "facebook" | "instagram";
  data: {
    posts: number;
    likes: number;
    comments: number;
    engagementRate: number;
  };
}) {
  const isFb = platform === "facebook";
  const Icon = isFb ? Facebook : Instagram;
  const color = isFb ? "text-blue-400" : "text-pink-400";
  const borderColor = isFb ? "border-blue-500/20" : "border-pink-500/20";
  const bgColor = isFb ? "bg-blue-500/5" : "bg-pink-500/5";

  const stats = [
    {
      label: "Posts",
      value: data.posts,
      icon: FileText,
      iconColor: "text-slate-400",
    },
    {
      label: "Likes",
      value: data.likes,
      icon: Heart,
      iconColor: "text-pink-400",
    },
    {
      label: "Comments",
      value: data.comments,
      icon: MessageCircle,
      iconColor: "text-yellow-400",
    },
  ];

  return (
    <div className={`rounded-2xl border ${borderColor} ${bgColor} p-5`}>
      <div className="flex items-center gap-3 mb-5">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className={`font-semibold capitalize ${color}`}>{platform}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <stat.icon className={`h-4 w-4 mx-auto mb-1.5 ${stat.iconColor}`} />
            <p className="text-xl font-bold text-white">
              {formatNumber(stat.value)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Utility ──────────────────────────────────────────────────────────
function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
