import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";

export default function AdminPage() {
  if (isAdminAuthenticated()) redirect("/admin/dashboard");

  return (
    <section className="section-pad min-h-[70vh] bg-neutral-50">
      <div className="container-padded flex justify-center">
        <form action="/api/admin/login" method="post" className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-premium">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-gold-700">Admin</p>
          <h1 className="mt-3 text-3xl font-black">Yönetim paneli girişi</h1>
          <p className="mt-3 text-sm text-neutral-600">Tek şifreli basit giriş. Varsayılan geliştirme şifresi: admin123</p>
          <label className="mt-6 grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">Şifre</span>
            <input name="password" type="password" required className="rounded-xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-gold-300" />
          </label>
          <button className="mt-6 w-full rounded-full bg-ink px-6 py-4 font-black text-white">Giriş yap</button>
        </form>
      </div>
    </section>
  );
}