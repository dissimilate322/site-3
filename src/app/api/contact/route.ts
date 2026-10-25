import { NextResponse } from "next/server";

/** Local preview only: validates an enquiry without sending or storing it. */
export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try { data = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid enquiry" }, { status: 400 }); }

  if (!data || typeof data !== "object" ||
      !["name", "email", "description"].every((key) => typeof data[key] === "string" && (data[key] as string).trim().length > 0 && (data[key] as string).length <= 2000) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email as string)) {
    return NextResponse.json({ error: "Name, valid email, and idea are required" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, mode: "preview", sent: false });
}
