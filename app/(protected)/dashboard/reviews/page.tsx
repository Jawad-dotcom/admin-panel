"use client";

import { useState } from "react";
import { useReviews, useDeleteReview, type Review } from "@/app/hooks/useReviews";
import { Star, Search, Trash2, RefreshCw, MessageSquare, BadgeCheck } from "lucide-react";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array(5).fill(0).map((_, i) => (
        <Star key={i} size={11}
          className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-700"} />
      ))}
      <span className="text-xs text-zinc-500 ml-1 font-mono">{rating}/5</span>
    </div>
  );
}

function Avatar({ user }: { user: Review["user"] }) {
  if (!user) return <div className="w-8 h-8 rounded-full bg-zinc-800 border border-[#27272a]" />;
  const initials = (user.username ?? user.email ?? "?")[0].toUpperCase();
  return user.profilePic ? (
    <img src={user.profilePic} className="w-8 h-8 rounded-full object-cover border border-[#27272a]" />
  ) : (
    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
      <span className="text-xs font-bold text-indigo-400">{initials}</span>
    </div>
  );
}

function ConfirmDialog({ comment, onConfirm, onCancel, loading }: {
  comment: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
          <Trash2 size={18} className="text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">Review delete karein?</h3>
        <p className="text-sm text-zinc-400 mb-2">Ye review permanently delete ho jayegi:</p>
        <p className="text-xs text-zinc-500 italic bg-zinc-900 rounded-lg px-3 py-2 mb-5 line-clamp-2">
          "{comment}"
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl text-sm border border-[#27272a] text-zinc-400 hover:text-white transition-all disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl text-sm bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50">
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-800/50 rounded-lg ${className}`} />;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ReviewsPage() {
  const { data: reviews, isLoading, isError, refetch, isFetching } = useReviews();
  const deleteReview = useDeleteReview();

  const [search, setSearch]           = useState("");
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "unverified">("all");
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const filtered = (reviews ?? []).filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      r.comment.toLowerCase().includes(q) ||
      (r.user?.username ?? r.user?.email ?? "").toLowerCase().includes(q) ||
      (r.product?.name ?? "").toLowerCase().includes(q);
    const matchRating  = filterRating === "all" || r.rating === filterRating;
    const matchVerified =
      filterVerified === "all" ? true :
      filterVerified === "verified" ? r.isVerifiedPurchase : !r.isVerifiedPurchase;
    return matchSearch && matchRating && matchVerified;
  });

  const avgRating = reviews?.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="p-8 max-w-[1100px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare size={22} className="text-yellow-400" />
            Reviews
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {isLoading ? "..." : `${reviews?.length ?? 0} total · Avg rating: ${avgRating} ⭐`}
          </p>
        </div>
        <button onClick={() => refetch()} disabled={isFetching}
          className="p-2 rounded-xl border border-[#27272a] text-zinc-500 hover:text-white hover:border-[#3f3f46] transition-all disabled:opacity-40">
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" placeholder="Search by comment, user, or product..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111113] border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-500/50 transition-colors" />
        </div>

        {/* Star filter */}
        <div className="flex items-center gap-1 bg-[#111113] border border-[#27272a] rounded-xl px-2 py-1">
          <button onClick={() => setFilterRating("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterRating === "all" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
            All
          </button>
          {[5, 4, 3, 2, 1].map((n) => (
            <button key={n} onClick={() => setFilterRating(n)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                filterRating === n ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "text-zinc-500 hover:text-zinc-300"
              }`}>
              {n} <Star size={10} className={filterRating === n ? "fill-yellow-400" : ""} />
            </button>
          ))}
        </div>

        {/* Verified filter */}
        <div className="flex items-center gap-1 bg-[#111113] border border-[#27272a] rounded-xl px-2 py-1">
          {(["all", "verified", "unverified"] as const).map((v) => (
            <button key={v} onClick={() => setFilterVerified(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                filterVerified === v
                  ? v === "verified" ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : v === "unverified" ? "bg-zinc-700/40 text-zinc-300 border border-zinc-600"
                    : "bg-zinc-700 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-sm text-red-400">
          ⚠ Reviews load nahi ho sake. Refresh karo.
        </div>
      )}

      {/* Table */}
      <div className="bg-[#111113] border border-[#27272a] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e21]">
              {["User", "Product", "Rating", "Comment", "Verified", "Date", "Action"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-[#1a1a1d]">
                  {Array(7).fill(0).map((_, j) => (
                    <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-sm text-zinc-600">
                  {search ? `"${search}" se koi review nahi mili` : "Abhi koi review nahi hai"}
                </td>
              </tr>
            ) : (
              filtered.map((review) => (
                <tr key={review._id} className="border-b border-[#1a1a1d] hover:bg-zinc-900/40 transition-colors">

                  {/* User */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar user={review.user} />
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {review.user?.username ?? review.user?.email ?? "Deleted User"}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-600">
                          #{review.user?._id.slice(-6).toUpperCase() ?? "———"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Product */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {review.product?.images?.[0]?.url ? (
                        <img src={review.product.images[0].url}
                          className="w-7 h-7 rounded-lg object-cover border border-[#27272a]" />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-[#27272a]" />
                      )}
                      <span className="text-xs text-zinc-300 truncate max-w-[110px]">
                        {review.product?.name ?? "Deleted Product"}
                      </span>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-5 py-3.5">
                    <StarRating rating={review.rating} />
                  </td>

                  {/* Comment */}
                  <td className="px-5 py-3.5 max-w-[200px]">
                    <p className="text-xs text-zinc-400 line-clamp-2">{review.comment}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {review.images.map((img, i) => (
                          <img key={i} src={img.url}
                            className="w-6 h-6 rounded object-cover border border-[#27272a]" />
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Verified */}
                  <td className="px-5 py-3.5">
                    {review.isVerifiedPurchase ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                        <BadgeCheck size={10} /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-600 font-mono">—</span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] font-mono text-zinc-600">
                      {timeAgo(review.createdAt)}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3.5">
                    <button onClick={() => setDeleteTarget(review)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 size={11} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[#1e1e21] flex justify-between items-center">
            <p className="text-[11px] text-zinc-600 font-mono">
              {filtered.length} of {reviews?.length} reviews
            </p>
            <div className="flex gap-3 text-[11px] font-mono">
              <span className="text-green-400">
                {reviews?.filter(r => r.isVerifiedPurchase).length} verified
              </span>
              <span className="text-zinc-700">·</span>
              <span className="text-yellow-400">
                Avg {avgRating} ⭐
              </span>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          comment={deleteTarget.comment}
          loading={deleteReview.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteReview.mutate(deleteTarget._id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }}
        />
      )}
    </div>
  );
}