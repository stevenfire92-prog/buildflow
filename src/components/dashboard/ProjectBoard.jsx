import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import ProjectKanbanCard from "./ProjectKanbanCard";

const columns = [
  { id: "draft", title: "To-Do" },
  { id: "building", title: "In-Progress" },
  { id: "ready", title: "Ready" },
  { id: "published", title: "Published" },
];

export default function ProjectBoard({ projects, onProjectUpdate }) {
  const [movingId, setMovingId] = useState(null);

  const handleDragEnd = async ({ destination, draggableId }) => {
    if (!destination) return;
    const newStatus = destination.droppableId;
    const project = projects.find((p) => p.id === draggableId);
    if (!project || project.status === newStatus) return;

    setMovingId(draggableId);
    try {
      const updates = {
        status: newStatus,
        last_activity: new Date().toISOString(),
      };
      await base44.entities.Project.update(draggableId, updates);
      onProjectUpdate(draggableId, updates);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const items = projects.filter((p) => p.status === col.id);
          return (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[220px] rounded-2xl border p-3 transition-colors ${
                    snapshot.isDraggingOver
                      ? "border-white/30 bg-white/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between px-1 pb-3">
                    <h3 className="text-sm font-medium text-white/70">{col.title}</h3>
                    <span className="text-xs text-white/40">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((p, index) => (
                      <Draggable key={p.id} draggableId={p.id} index={index}>
                        {(drag) => (
                          <div
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                            {...drag.dragHandleProps}
                            className={movingId === p.id ? "opacity-50" : ""}
                          >
                            <ProjectKanbanCard project={p} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}