// components/categories/CategoryForm.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCategories, useAddCategory, useEditCategory, type Category }from "@/app/hooks/useCategories";
import { Upload, X, FolderTree, ArrowLeft, Loader2 } from "lucide-react";

interface Props {
  mode: "add" | "edit";
  category?: Category;
}

export default function CategoryForm({ mode, category }: Props) {
  const router = useRouter();
  const { data: allCategories } = useCategories();
  const addCategory  = useAddCategory();
  const editCategory = useEditCategory();

  const isPending = addCategory.isPending || editCategory.isPending;

  // Form state
  const [name, setName]               = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [parent, setParent]           = useState(
    typeof category?.parent === "object" ? (category?.parent?._id ?? "") : ""
  );
  const [isActive, setIsActive]       = useState(category?.isActive ?? true);
  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [removedImage, setRemovedImage] = useState<string | null>(null); // To track if existing image is removed
  const [imagePreview, setImagePreview] = useState<string>(category?.image?.url ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  // Parent options — exclude self on edit
  const parentOptions = (allCategories ?? []).filter(
    (c) => c._id !== category?._id
  );

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    if (mode === "edit" && category?.image) {
      // Agar edit mode + ye image existing product ki hai, toh usko remove karne ke liye uski public_id ko removedImages state mein add karo. Naye images ke liye, bas unko imageFiles state se remove kar do.
      setRemovedImage(category.image.public_id);
    }
    setImageFile(null);
    setImagePreview("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("isActive", String(isActive));
    if (parent) formData.append("parent", parent);
    if (imageFile) formData.append("image", imageFile);

    if (mode === "add") {
      addCategory.mutate(formData, {
        onSuccess: () => router.push("/dashboard/categories"),
      });
    } 
     if (mode === "edit" && removedImage) {
      formData.append("removedImage", JSON.stringify([removedImage]));
    }
    editCategory.mutate(
      { id: category!._id, formData },
      { onSuccess: () => router.push("/dashboard/categories") }
    );
    console.log({ name, description, isActive, parent, imageFile });
  }

  return (
    <div className="p-8 max-w-[680px] mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl border border-[#27272a] text-zinc-500 hover:text-white hover:border-[#3f3f46] transition-all"
        >
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderTree size={18} className="text-indigo-400" />
            {mode === "add" ? "Add Category" : `Edit: ${category?.name}`}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {mode === "add" ? "Nai category banao" : "Category update karo"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name */}
        <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-5">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            Category Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Electronics, Clothing..."
            className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-5">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Category description (optional)..."
            rows={3}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-colors resize-none"
          />
        </div>

        {/* Parent + Status */}
        <div className="grid grid-cols-2 gap-4">

          {/* Parent Category */}
          <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-5">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Parent Category
            </label>
            <select
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/60 transition-colors"
            >
              <option value="">None (Top level)</option>
              {parentOptions.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-5">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Status
            </label>
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => setIsActive(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isActive
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "border-[#27272a] text-zinc-500 hover:border-[#3f3f46]"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setIsActive(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  !isActive
                    ? "bg-zinc-700/40 border-zinc-600 text-zinc-300"
                    : "border-[#27272a] text-zinc-500 hover:border-[#3f3f46]"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-5">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            Category Image
          </label>

          {imagePreview ? (
            <div className="relative w-32 h-32">
              <img
                src={imagePreview}
                alt="preview"
                className="w-full h-full object-cover rounded-xl border border-[#27272a]"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-400 transition-colors"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-28 border-2 border-dashed border-[#27272a] rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-500 hover:border-indigo-500/40 hover:text-indigo-400 transition-all"
            >
              <Upload size={20} />
              <span className="text-xs font-medium">Click to upload image</span>
              <span className="text-[10px] text-zinc-600">PNG, JPG up to 5MB</span>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#27272a] text-zinc-400 hover:text-white hover:border-[#3f3f46] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-400 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {mode === "add" ? "Adding..." : "Saving..."}
              </>
            ) : (
              mode === "add" ? "Add Category" : "Save Changes"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}