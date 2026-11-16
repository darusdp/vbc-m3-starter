import { NextResponse } from "next/server";
import { getSummary } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(getSummary(), { status: 200 });
  } catch (error) {
    console.error("GET /api/summary failed:", error);
    return NextResponse.json(
      { error: "Could not load the summary. Please try again." },
      { status: 500 }
    );
  }
}
