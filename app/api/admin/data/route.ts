import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSiteData, saveSiteData } from "@/lib/data";
import type { SiteData } from "@/lib/types";

export async function GET() {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  return NextResponse.json(await getSiteData());
}

export async function PUT(request: Request) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const data = (await request.json()) as SiteData;
  const saved = await saveSiteData(data);
  return NextResponse.json(saved);
}