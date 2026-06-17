import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();

  // Protect page server-side
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AdminDashboardClient currentUserId={session.user.id} />
    </div>
  );
}
