import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import { verifyToken } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const session = await Session.findById(id)
      .populate("teacher", "name email")
      .populate("speakers", "name email")
      .populate("handRaises", "name email")
      .populate("participants", "name email");

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const token = req.headers.get("authorization")?.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { status, recordingUrl } = await req.json();

    const session = await Session.findById(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Only the teacher who created the session can end it
    if (session.teacher.toString() !== decoded.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (status) session.status = status;
    if (recordingUrl) session.recordingUrl = recordingUrl;

    await session.save();

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
