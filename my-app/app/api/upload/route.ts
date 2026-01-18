import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("video") as File;

  if (!file) {
    return NextResponse.json(
      { error: "No videos uploaded" },
      { status: 400 }
    );
  }

  console.log("Received:", file.name, file.size);

  return NextResponse.json({ success: true });
}