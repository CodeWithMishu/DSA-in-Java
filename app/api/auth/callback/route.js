import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/auth?error=${error}`, request.url));
  }

  if (code) {
    return NextResponse.redirect(new URL(`/auth/callback?code=${encodeURIComponent(code)}`, request.url));
  }

  return NextResponse.redirect(new URL("/auth", request.url));
}
