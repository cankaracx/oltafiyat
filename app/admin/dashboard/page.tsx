import { redirect } from "next/navigation";
import { AdminEditor } from "@/components/AdminEditor";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSiteData } from "@/lib/data";

export default async function AdminDashboardPage() {
  if (!isAdminAuthenticated()) redirect("/admin");
  const data = await getSiteData();

  return (
    <section className="min-h-screen bg-neutral-50 py-6">
      <div className="container-padded">
        <form action="/api/admin/logout" method="post" className="mb-4 flex justify-end">
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black text-ink">Çıkış yap</button>
        </form>
        <AdminEditor initialData={data} />
      </div>
    </section>
  );
}