import { NextRequest, NextResponse } from "next/server";
import { checkCredentials, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !checkCredentials(username, password)
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid username or password" },
      { status: 401 }
    );
  }

  const token = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
