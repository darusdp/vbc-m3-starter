import { NextResponse } from "next/server";
import { createRequest, listRequests, validateNewRequest } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ requests: listRequests() }, { status: 200 });
  } catch (error) {
    console.error("GET /api/requests failed:", error);
    return NextResponse.json(
      { error: "Could not load requests. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "The request body must be valid JSON." },
        { status: 400 }
      );
    }

    const result = validateNewRequest(body);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const request = createRequest(result.value);
    return NextResponse.json({ request }, { status: 201 });
  } catch (error) {
    console.error("POST /api/requests failed:", error);
    return NextResponse.json(
      { error: "Could not save the request. Please try again." },
      { status: 500 }
    );
  }
}
