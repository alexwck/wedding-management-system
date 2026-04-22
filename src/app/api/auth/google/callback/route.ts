import { NextRequest, NextResponse } from "next/server";
import { handleGoogleCallback } from "@/app/actions/export";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/rsvps?export=error&message=${encodeURIComponent(error)}`, request.url),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/dashboard/rsvps?export=error&message=Missing+authorization+code", request.url),
    );
  }

  const result = await handleGoogleCallback({ code, state });

  if (!result.success) {
    return NextResponse.redirect(
      new URL(`/dashboard/rsvps?export=error&message=${encodeURIComponent(result.error)}`, request.url),
    );
  }

  return NextResponse.redirect(
    new URL("/dashboard/rsvps?export=connected", request.url),
  );
}
