// app/(protected)/dashboard/categories/[id]/edit/page.tsx
"use client";

import { use } from "react";
import { useCategoryById } from "@/app/hooks/useCategories";
import CategoryForm from "@/app/components/categories/CategoryForm";
import { Loader2 } from "lucide-react";

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: category, isLoading, isError } = useCategoryById(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-zinc-500">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading category...</span>
      </div>
    );
  }

  if (isError || !category) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-red-400">Category nahi mili.</p>
      </div>
    );
  }

  return <CategoryForm mode="edit" category={category} />;
}