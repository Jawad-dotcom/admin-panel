// hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────
export interface Category {
  _id: string;
  name: string;
  description?: string;
  parent: { _id: string; name: string } | null;
  isActive: boolean;
  image?: { public_id: string; url: string };
  createdAt: string;
}

// ─── GET ALL ──────────────────────────────────────────────
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data.categories as Category[];
    },
  });
}

// ─── GET BY ID ────────────────────────────────────────────
export function useCategoryById(id: string) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: async () => {
      const res = await api.get(`/categories/${id}`);
      return res.data.category as Category;
    },
    enabled: !!id,
  });
}

// ─── ADD ─────────────────────────────────────────────────
export function useAddCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post("/add-category", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category add ho gayi!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Category add nahi ho saki");
    },
  });
}

// ─── EDIT ─────────────────────────────────────────────────
export function useEditCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const res = await api.put(`/edit-category/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category update ho gayi!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Category update nahi ho saki");
    },
  });
}

// ─── DELETE ───────────────────────────────────────────────
export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/delete-category/${id}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category delete ho gayi!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Category delete nahi ho saki");
    },
  });
}