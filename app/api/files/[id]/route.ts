import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "File id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("project_files")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete project file error:", error);

      return NextResponse.json(
        { error: "Failed to delete file record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE /api/files/[id] error:", error);

    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}