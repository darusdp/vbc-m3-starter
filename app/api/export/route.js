import { NextResponse } from "next/server";
import { listRequests, toCsv } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return new Response(toCsv(await listRequests()), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="morrowlane-requests.csv"',
      },
    });
  } catch (error) {
    console.error("GET /api/export failed:", error);
    return NextResponse.json(
      { error: "Could not export requests. Please try again." },
      { status: 500 }
    );
  }
}
