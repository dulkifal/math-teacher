import React, { useRef, useState, useCallback } from "react";
import { DraggablePointProps } from "@/types";

export function DraggablePoint({
  position,
  onDrag,
  color,
  label,
  bounds,
  ariaLabel,
}: DraggablePointProps) {
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: position.x, y: position.y });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Fallback if pointer capture not supported
      }

      isDraggingRef.current = true;
      startPointerRef.current = { x: e.clientX, y: e.clientY };
      startPosRef.current = { x: position.x, y: position.y };
      setIsDragging(true);
    },
    [position.x, position.y]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();

      const dx = e.clientX - startPointerRef.current.x;
      const dy = e.clientY - startPointerRef.current.y;

      let newX = startPosRef.current.x + dx;
      let newY = startPosRef.current.y + dy;

      if (bounds) {
        newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
        newY = Math.max(bounds.minY, Math.min(bounds.maxY, newY));
      }

      onDrag({ x: Math.round(newX), y: Math.round(newY) });
    },
    [bounds, onDrag]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);

      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore
      }
    },
    []
  );

  return (
    <div
      role="slider"
      aria-label={ariaLabel || label || "Draggable point"}
      aria-valuenow={Math.round(position.x)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        userSelect: "none",
        zIndex: isDragging ? 40 : 25,
      }}
      className="group"
    >
      {/* Outer focus/hover ring */}
      <div
        className={`w-5 h-5 rounded-full border-2 border-white shadow-md transition-transform duration-100 flex items-center justify-center ${
          isDragging
            ? "scale-125 ring-4 ring-blue-400/50 shadow-lg"
            : "group-hover:scale-115 group-hover:shadow"
        }`}
        style={{ backgroundColor: color }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
      </div>

      {/* Floating Label pill */}
      {label && (
        <span
          className={`absolute -top-6 px-1.5 py-0.5 rounded text-[10px] font-black tracking-wide pointer-events-none transition-all shadow-sm ${
            isDragging
              ? "bg-gray-900 text-white scale-110 opacity-100"
              : "bg-white/90 text-gray-700 border border-gray-200 opacity-90 group-hover:opacity-100 group-hover:scale-105"
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
export default DraggablePoint;
