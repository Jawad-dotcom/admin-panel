// app/(protected)/dashboard/categories/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useCategories,useDeleteCategory, type Category } from "@/app/hooks/useCategories";
import {
  Plus, Search, Pencil, Trash2,
  FolderTree, ToggleLeft, ToggleRight, RefreshCw,
} from "lucide-react";

// ─── Confirm Delete Dialog ────────────────────────────────
function ConfirmDialog({
  name,
  onConfirm,
  onCancel,
  loading,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
          <Trash2 size={18} className="text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">
          Category delete karein?
        </h3>
        <p className="text-sm text-zinc-400 mb-5">
          <span className="text-white font-medium">"{name}"</span> permanently
          delete ho jaegi. Subcategories ka parent null ho jayega.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium border border-[#27272a] text-zinc-400 hover:text-white hover:border-[#3f3f46] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-800/50 rounded-lg ${className}`} />
  );
}

// ─── Page ─────────────────────────────────────────────────
export default function CategoriesPage() {
  const { data: categories, isLoading, isError, refetch, isFetching } = useCategories();
  const deleteCategory = useDeleteCategory();

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Filter by search
  const filtered = (categories ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1100px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderTree size={22} className="text-indigo-400" />
            Categories
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {isLoading ? "..." : `${categories?.length ?? 0} total categories`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-xl text-zinc-500 border border-[#27272a] hover:border-[#3f3f46] hover:text-white transition-all disabled:opacity-40"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          </button>
          <Link
            href="/dashboard/categories/add"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-400 text-white transition-colors"
          >
            <Plus size={15} />
            Add Category
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111113] border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
      </div>

      {/* Error */}
      {isError && (
        <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-sm text-red-400">
          ⚠ Categories load nahi ho saki. Refresh karo.
        </div>
      )}

      {/* Table */}
      <div className="bg-[#111113] border border-[#27272a] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e21]">
              {["Image", "Name", "Parent", "Status", "Created", "Actions"].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3.5 text-[10px] font-semibold tracking-widest text-zinc-600 uppercase"
                >
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
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-sm text-zinc-600">
                  {search ? `"${search}" se koi category nahi mili` : "Koi category nahi hai — add karo"}
                </td>
              </tr>
            ) : (
              filtered.map((cat) => (
                <tr
                  key={cat._id}
                  className="border-b border-[#1a1a1d] hover:bg-zinc-900/40 transition-colors"
                >
                  {/* Image */}
                  <td className="px-5 py-3.5">
                    {cat.image?.url ? (
                      <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#27272a]">
                        <img
                          src={cat.image.url}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-[#27272a] flex items-center justify-center">
                        <FolderTree size={14} className="text-zinc-600" />
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-white">{cat.name}</p>
                    {cat.description && (
                      <p className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-[180px]">
                        {cat.description}
                      </p>
                    )}
                  </td>

                  {/* Parent */}
                  <td className="px-5 py-3.5">
                    {cat.parent ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {cat.parent.name}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    {cat.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                        <ToggleRight size={11} />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-500 border border-zinc-700">
                        <ToggleLeft size={11} />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Created */}
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] font-mono text-zinc-500">
                      {new Date(cat.createdAt).toLocaleDateString("en-PK", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/categories/${cat._id}/edit`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#27272a] text-zinc-400 hover:text-white hover:border-[#3f3f46] transition-all"
                      >
                        <Pencil size={11} />
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={11} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer count */}
        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[#1e1e21]">
            <p className="text-[11px] text-zinc-600 font-mono">
              {filtered.length} of {categories?.length} categories
            </p>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          name={deleteTarget.name}
          loading={deleteCategory.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteCategory.mutate(deleteTarget._id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }}
        />
      )}
    </div>
  );
}