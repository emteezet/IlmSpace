import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Class from "@/models/Class";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const classData = await Class.findById(id)
      .populate("teacher", "name email")
      .populate("students", "name email");

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, class: classData });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
