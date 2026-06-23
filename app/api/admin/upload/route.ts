import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSupabaseAdmin, hasSupabaseConfig } from "@/lib/supabase";

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${safeName(file.name || "upload.jpg")}`;

  if (hasSupabaseConfig()) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "site-assets";
    const supabase = getSupabaseAdmin();
    const { error } = await supabase!.storage.from(bucket).upload(filename, bytes, { contentType: file.type, upsert: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { data } = supabase!.storage.from(bucket).getPublicUrl(filename);
    return NextResponse.json({ url: data.publicUrl });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), bytes);
  return NextResponse.json({ url: `/uploads/${filename}` });
}