import React, { useState, useEffect } from "react";
import { client } from "@/api/localClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function FilePreviewDialog({ file, onClose }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!file) return;
    setPreviewUrl(null);
    setFailed(false);
    client.functions
      .invoke("getDriveFilePreviewUrl", { file_id: file.id })
      .then((res) => setPreviewUrl(res.data.preview_url))
      .catch(() => setFailed(true));
  }, [file && file.id]);

  if (!file) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] bg-black border-white/10 text-white rounded-2xl p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-base text-white truncate pr-8">
            {file.file_name}
          </DialogTitle>
          <DialogDescription className="text-xs text-white/40">
            {failed ? "Preview unavailable" : "Quick preview from Google Drive"}
          </DialogDescription>
        </DialogHeader>

        <div className="h-[70vh] w-full rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
          {failed ? (
            <p className="text-sm text-white/50 px-6 text-center">
              Couldn't load the preview.{" "}
              {file.drive_link && (
                <a
                  href={file.drive_link}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-white"
                >
                  Open in Drive
                </a>
              )}
            </p>
          ) : previewUrl ? (
            <iframe
              src={previewUrl}
              title={file.file_name}
              className="w-full h-full"
              allow="autoplay"
            />
          ) : (
            <div className="w-6 h-6 border-2 border-white/15 border-t-white rounded-full animate-spin" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}