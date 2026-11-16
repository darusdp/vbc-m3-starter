import { NextResponse } from "next/server";
import { STATUSES, updateRequestStatus } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json(
        { error: `No request found with id "${rawId}".` },
        { status: 404 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "The request body must be valid JSON." },
        { status: 400 }
      );
    }

    const status = typeof body?.status === "string" ? body.status.trim() : "";
    if (!STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Status must be New, In Progress, or Complete." },
        { status: 400 }
      );
    }

    const request = updateRequestStatus(id, status);
    if (!request) {
      return NextResponse.json(
        { error: `No request found with id ${id}.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ request }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/requests/[id] failed:", error);
    return NextResponse.json(
      { error: "Could not update that status. Please try again." },
      { status: 500 }
    );
  }
}
