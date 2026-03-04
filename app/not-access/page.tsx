"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Cookies from "js-cookie"; // npm install js-cookie

export default function NotAccessPage() {
  const router = useRouter();

  async function handleGoToLogin() {
    await api.post("/auth/logout");
    Cookies.remove("jwt");        // ← turant cookie delete
    Cookies.remove("admin_token");
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-red-500">403</h1>
        <p className="text-gray-600">You are not authorized to access this page.</p>
        <button
          onClick={handleGoToLogin}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}