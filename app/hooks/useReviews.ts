import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface Review {
  _id: string;
  user: { _id: string; username?: string; email?: string; profilePic?: string } | null;
  product: { _id: string; name: string; images?: { url: string }[] } | null;
  rating: number;
  comment: string;
  images?: { public_id: string; url: string }[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export function useReviews() {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const res = await api.get("/reviews/admin/all");
      return res.data.reviews as Review[];
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/reviews/${id}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review delete ho gayi!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Review delete nahi ho saki");
    },
  });
}