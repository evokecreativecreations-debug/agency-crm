import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type CreateFileBody = {
  projectId: string;
  fileName: string;
  storagePath: string;
  mimeType: string | null;
  fileSize: number;
  uploadedBy: string;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as Partial<CreateFileBody>;

    if (
      !body.projectId ||
      !body.fileName ||
      !body.storagePath ||
      typeof body.fileSize !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing required file fields" },
        { status: 400 }
      );
    }

    const { data: projectFile, error } = await supabase
      .from("project_files")
      .insert({
        project_id: body.projectId,
        file_name: body.fileName,
        storage_path: body.storagePath,
        mime_type: body.mimeType || "application/octet-stream",
        file_size: body.fileSize,
        uploaded_by: user.id,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Create project file error:", error);

      return NextResponse.json(
        { error: "Failed to save file record" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, file: projectFile },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/files error:", error);

    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}