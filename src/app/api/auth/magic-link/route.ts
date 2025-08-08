import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email.includes("@")) {
    return new NextResponse("Invalid email", { status: 400 });
  }
  const cookieStore = await cookies();
  cookieStore.set("demo_email", email, { httpOnly: false, path: "/" });
  // For demo we log the magic link to console; in production we'd email.
  console.log(`[MagicLink] demo sign-in as ${email}`);
  return NextResponse.json({ ok: true });
}

