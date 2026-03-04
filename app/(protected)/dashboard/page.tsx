// app/(protected)/dashboard/page.tsx
"use client";


import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ShoppingCart, Package, Tag, TrendingUp,
  RefreshCw, Clock, CheckCircle2, Truck,
  XCircle, AlertCircle, Hourglass,
} from "lucide-react";
import { Key } from "react";
import { getOrderUser, useDashboard } from "@/app/hooks/useDashboard";

// ─── Helpers ──────────────────────────────────────────────
function formatPrice(n: number) {
  return "₨ " + (n ?? 0).toLocaleString("en-PK");
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── All 6 statuses ───────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string; icon: React.ElementType
}> = {
  Pending:    { label: "Pending",    color: "#a78bfa", bg: "#a78bfa15", icon: Hourglass },
  Processing: { label: "Processing", color: "#f97316", bg: "#f9731615", icon: Clock },
  Confirmed:  { label: "Confirmed",  color: "#3b82f6", bg: "#3b82f615", icon: AlertCircle },
  Shipped:    { label: "Shipped",    color: "#38bdf8", bg: "#38bdf815", icon: Truck },
  Delivered:  { label: "Delivered",  color: "#22c55e", bg: "#22c55e15", icon: CheckCircle2 },
  Cancelled:  { label: "Cancelled",  color: "#ef4444", bg: "#ef444415", icon: XCircle },
};

// ─── Stat Card ────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number;
  icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-5 flex flex-col gap-3 hover:border-[#3f3f46] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: color + "20" }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-800/50 rounded-xl ${className}`} />;
}

// ─── Tooltip ──────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[10px] text-zinc-400 mb-1 font-mono">{label}</p>
      <p className="text-sm font-bold text-white">{formatPrice(payload[0].value)}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────
export default function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();

  return (
    <div className="p-8 max-w-[1200px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Welcome back, Admin — here's what's happening.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 border border-[#27272a] hover:border-[#3f3f46] hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error state */}
      {isError && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-sm text-red-400">
          ⚠ Data load nahi ho saka. Backend check karo ya refresh karo.
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-[110px]" />)
        ) : (
          <>
            <StatCard
              label="Total Orders"
              value={data?.totalOrders ?? 0}
              icon={ShoppingCart}
              color="#6366f1"
              sub={`${data?.ordersByStatus?.["Pending"] ?? 0} pending · ${data?.ordersByStatus?.["Processing"] ?? 0} processing`}
            />
            <StatCard
              label="Revenue"
              value={formatPrice(data?.totalRevenue ?? 0)}
              icon={TrendingUp}
              color="#22c55e"
              sub="Cancelled orders excluded"
            />
            <StatCard
              label="Products"
              value={data?.totalProducts ?? 0}
              icon={Package}
              color="#f97316"
              sub="Total listed products"
            />
            <StatCard
              label="Categories"
              value={data?.totalCategories ?? 0}
              icon={Tag}
              color="#a78bfa"
              sub="Including subcategories"
            />
          </>
        )}
      </div>

      {/* Chart + Status Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        {/* Revenue Chart */}
        <div className="col-span-2 bg-[#111113] border border-[#27272a] rounded-2xl p-5">
          <p className="text-sm font-semibold text-white mb-1">Revenue Overview</p>
          <p className="text-xs text-zinc-500 mb-5">Last 6 months (excluding cancelled)</p>
          {isLoading ? (
            <Skeleton className="h-[200px]" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data?.revenueByMonth ?? []}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false}
                  tickLine={false} tickFormatter={(v) => `₨${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2}
                  fill="url(#revGrad)" dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#818cf8" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-5">
          <p className="text-sm font-semibold text-white mb-1">Orders by Status</p>
          <p className="text-xs text-zinc-500 mb-4">Current breakdown</p>
          {isLoading ? (
            <div className="space-y-3">
              {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-9" />)}
            </div>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                const count = data?.ordersByStatus?.[status] ?? 0;
                const total = data?.totalOrders ?? 1;
                const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
                const Icon  = cfg.icon;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Icon size={11} style={{ color: cfg.color }} />
                        <span className="text-[11px] text-zinc-400">{cfg.label}</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-white">{count}</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[#111113] border border-[#27272a] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#27272a] flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Recent Orders</p>
            <p className="text-xs text-zinc-500">Latest 5 orders</p>
          </div>
          <a href="/dashboard/orders"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            View all →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e21]">
                {["Order #", "Customer", "Amount", "Payment", "Status", "Time"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-[#1a1a1d]">
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data?.recentOrders?.length ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-zinc-600">
                    No orders yet
                  </td>
                </tr>
              ) : (
                data.recentOrders.map((order:  { orderStatus: string | number; _id: Key | null | undefined; orderNumber: any; totalPrice: number; paymentInfo: { method: any; }; createdAt: string; }) => {
                  const s     = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG["Pending"];
                  const SIcon = s.icon;
                  return (
                    <tr key={order._id}
                      className="border-b border-[#1a1a1d] hover:bg-zinc-900/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-indigo-400">
                          {order.orderNumber ?? `#${String(order._id).slice(-6).toUpperCase()}`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-medium text-zinc-200">
                          {getOrderUser(order)}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold text-white">
                          {formatPrice(order.totalPrice)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono text-zinc-400">
                          {order.paymentInfo?.method ?? "COD"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                          style={{ background: s.bg, color: s.color }}>
                          <SIcon size={10} />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-mono text-zinc-600">
                          {timeAgo(order.createdAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}