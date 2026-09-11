import React from "react";
import BulkActionMenu from "./BulkActionMenu";

export default function BulkActions({
  count = 0,
  totalVisible = 0,
  selection = [],
  selectedProjects = [],
  busy = false,
  onSelectAll,
  onSetStatus,
  onDelete,
  onCancel,
}) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl px-2 pb-[env(safe-area-inset-bottom)] animate-in fade-in slide-in-from-bottom-4 duration-200">
      <BulkActionMenu
        selection={selection}
        totalVisible={totalVisible}
        selectedProjects={selectedProjects}
        busy={busy}
        onSelectAll={onSelectAll}
        onSetStatus={onSetStatus}
        onDelete={onDelete}
        onClearSelection={onCancel}
        selectMode={true}
        isFloating={true}
      />
    </div>
  );
}