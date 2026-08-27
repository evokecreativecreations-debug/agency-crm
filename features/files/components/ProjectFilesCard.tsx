"use client";

import { useEffect, useState } from "react";
import {
  Download,
  File,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getProjectFiles } from "@/features/files/api";
import type { ProjectFile } from "@/types/file";
import { createClient } from "@/lib/supabase/client";

interface ProjectFilesCardProps {
  projectId: string;
}

export function ProjectFilesCard({
  projectId,
}: ProjectFilesCardProps) {
  const supabase = createClient();

  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initializeFiles() {
      try {
        const data = await getProjectFiles(supabase, projectId);

        if (!cancelled) {
          setFiles(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load project files:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initializeFiles();

    return () => {
      cancelled = true;
    };
  }, [projectId, supabase]);

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          "You must be signed in to upload a file.",
        );
      }

      const fileExtension = file.name.includes(".")
        ? file.name.split(".").pop()
        : "";

      const safeExtension = fileExtension
        ? `.${fileExtension}`
        : "";

      const storagePath =
        `${projectId}/${crypto.randomUUID()}${safeExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(storagePath, file, {
          upsert: false,
          contentType: file.type || "application/octet-stream",
        });

      if (uploadError) {
        throw uploadError;
      }

      const response = await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          fileName: file.name,
          storagePath,
          mimeType: file.type || null,
          fileSize: file.size,
          uploadedBy: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        await supabase.storage
          .from("project-files")
          .remove([storagePath]);

        throw new Error(
          result.error || "Failed to save file record.",
        );
      }

      setFiles((current) => [result.file, ...current]);
    } catch (error) {
      console.error("Failed to upload file:", error);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleDownload(file: ProjectFile) {
    try {
      const { data, error } = await supabase.storage
        .from("project-files")
        .createSignedUrl(file.storage_path, 60);

      if (error) {
        throw error;
      }

      window.open(
        data.signedUrl,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (error) {
      console.error(
        "Failed to create download URL:",
        error,
      );
    }
  }

  async function handleDelete(file: ProjectFile) {
    const confirmed = window.confirm(
      `Delete "${file.file_name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(file.id);

      const response = await fetch(
        `/api/files/${file.id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to delete file.",
        );
      }

      await supabase.storage
        .from("project-files")
        .remove([file.storage_path]);

      setFiles((current) =>
        current.filter(
          (currentFile) => currentFile.id !== file.id,
        ),
      );
    } catch (error) {
      console.error("Failed to delete file:", error);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Files</CardTitle>

          <p className="mt-1 text-xs text-slate">
            Upload and manage files attached to this project.
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-ink px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90">
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}

          {uploading ? "Uploading..." : "Upload file"}

          <input
            type="file"
            className="sr-only"
            disabled={uploading}
            onChange={handleUpload}
          />
        </label>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-slate">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading files...
          </div>
        ) : files.length === 0 ? (
          <EmptyState
            icon={Paperclip}
            title="No files yet"
            description="Upload project files to keep everything organized in one place."
          />
        ) : (
          <div className="divide-y divide-line rounded-md border border-line">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-paper text-slate">
                  <File className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {file.file_name}
                  </p>

                  <p className="mt-0.5 text-xs text-slate">
                    {formatFileSize(file.file_size)}
                    {" · "}
                    {formatFileDate(file.created_at)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Download ${file.file_name}`}
                    onClick={() =>
                      void handleDownload(file)
                    }
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete ${file.file_name}`}
                    disabled={deletingId === file.id}
                    onClick={() => void handleDelete(file)}
                  >
                    {deletingId === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 1) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];

  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const size = bytes / 1024 ** unitIndex;

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${
    units[unitIndex]
  }`;
}

function formatFileDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

