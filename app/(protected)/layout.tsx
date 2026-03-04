// app/(protected)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "../components/layout/Sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  console.log("Checking auth in layout, token:", token);
  if (!token) {
    redirect("/login");
  }

  // backend se user check karo
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/check`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
      cache: "no-store",
    });

    console.log("Auth check response status:", res.status);
    if (!res.ok) redirect("/login");

    const user = await res.json();
    console.log("Auth check response data:", user);

    if (!user.isAdmin) {
      redirect("/not-access");
    }
  }  catch (error) {
    // NEXT_REDIRECT error ko re-throw karo, catch mat karo
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    redirect("/login");
  }

  return (
   <div className="min-h-screen bg-[#09090b] flex">
      <Sidebar />
      {/* Main content — offset by sidebar width */}
      <main className="ml-[240px] flex-1 min-h-screen overflow-y-auto bg-[#09090b]">
        {children}
      </main>
    </div>
  );
}