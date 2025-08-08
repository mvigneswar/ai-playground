import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const email = cookieStore.get("demo_email")?.value;
  if (!email) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { name: email.split("@")[0], email } });
}

