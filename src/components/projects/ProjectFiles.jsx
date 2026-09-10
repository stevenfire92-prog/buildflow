import React, { useState, useEffect, useRef } from "react";
import { UploadCloud, FileText, ExternalLink, Trash2, HardDrive } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const fmtSize = (bytes) => {
  if (!bytes && bytes !== 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let b = bytes;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i += 1;
  }
  return `${b.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

export default function ProjectFiles({ projectId, projectName }) {
  const { toast } = useToast();
  const [files, setFiles] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const loadFiles = () =>
    base44.entities.ProjectFile
      .filter({ project_id: projectId }, "-created_date", 100)
      .then(setFiles)
      .catch(() => setFiles([]));

  useEffect(() => {
    setFiles(null);
    loadFiles();
  }, [projectId]);

  const handleSelect = async (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length || uploading) return;
    setUploading(true);
    let ok = 0;
    for (const file of list) {
      try {
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
        const res = await base44.functions.invoke("uploadProjectFileToDrive", {
          file_url,
          file_name: file.name,
          mime_type: file.type,
          project_id: projectId,
          project_name: projectName,
        });
        if (res.data && res.data.file) ok += 1;
      } catch (err) {
        // continue with the remaining files
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    toast({
      title: ok ? "Saved to Google Drive" : "Upload failed",
      description: ok
        ? `${ok} file${ok > 1 ? "s" : ""} stored in your Google One storage.`
        : "Nothing was uploaded. Please try again.",
    });
    loadFiles();
  };

  const handleDelete = async (file) => {
    try {
      await base44.functions.invoke("deleteProjectFileFromDrive", { file_id: file.id });
      setFiles((prev) => (prev || []).filter((f) => f.id !== file.id));
      toast({ title: "File deleted", description: "Removed from Google Drive." });
    } catch {
      toast({ title: "Could not delete the file", description: "Please try again." });
    }
  };

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-white/60" />
          <p className="text-sm font-medium text-white">Project files</p>
        </div>
        <span className="text-[10px] text-white/30">Stored in Google Drive</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleSelect}
      />
      <button
        onClick={() => !uploading && inputRef.current && inputRef.current.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 py-6 rounded-xl border border-dashed border-white/15 text-sm text-white/50 hover:text-white hover:border-white/30 transition-colors disabled:opacity-60"
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Uploading to Drive...
          </>
        ) : (
          <>
            <UploadCloud className="w-4 h-4" />
            Click to upload files
          </>
        )}
      </button>

      {files === null ? (
        <div className="flex justify-center pt-6">
          <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <p className="pt-4 text-center text-xs text-white/30">No files uploaded yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-white/5">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 py-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/85 truncate">{f.file_name}</p>
                <p className="text-[11px] text-white/35">
                  {fmtSize(f.size)} · uploaded by {f.uploaded_by || "team"}
                </p>
              </div>
              {f.drive_link && (
                <a
                  href={f.drive_link}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full text-white/40 hover:text-white transition-colors"
                  title="Open in Google Drive"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => handleDelete(f)}
                className="p-2 rounded-full text-white/40 hover:text-red-300 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}