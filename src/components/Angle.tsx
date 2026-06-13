import React, { useState, useCallback } from "react";
import useMeasure from "react-use-measure";
import { useWindowSize } from "react-use";

import { Point } from "../types";
import { getAngleFromAToB, getArcPath, getAngleTextMidpoint } from "../utils";
import { DraggablePoint } from "../components/DraggablePoint";

export default function Angle() {
  const [pointA, setPointA] = useState<Point>({ x: 150, y: 70 });
  const [pointB, setPointB] = useState<Point>({ x: 250, y: 330 });
  const [otherPoints, setOtherPoints] = useState<Point[]>([]);
  const [center] = useState<Point>({ x: 200, y: 200 });

  const [ref] = useMeasure();
  useWindowSize();

  const handleDragA = useCallback((newPosition: Point) => {
    setPointA(newPosition);
  }, []);

  const handleDragB = useCallback((newPosition: Point) => {
    setPointB(newPosition);
  }, []);

  const handleDragOtherPoint = useCallback((index: number, newPosition: Point) => {
    setOtherPoints((prevPoints) => {
      const newPoints = [...prevPoints];
      newPoints[index] = newPosition;
      return newPoints;
    });
  }, []);

  const angleCounterClockwiseRad = getAngleFromAToB(center, pointA, pointB);
  const angleCounterClockwiseDeg = (angleCounterClockwiseRad * 180) / Math.PI;

  let angleType = "Acute Angle";
  let angleDesc = "An angle that is less than 90 degrees.";
  let badgeColor = "bg-sky-50 text-sky-700 border-sky-100";

  const degString = angleCounterClockwiseDeg.toFixed(1);
  if (degString === "90.0") {
    angleType = "Right Angle";
    angleDesc = "An angle that is exactly 90 degrees (perpendicular lines).";
    badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
  } else if (angleCounterClockwiseDeg < 90) {
    angleType = "Acute Angle";
    angleDesc = "An angle that is less than 90 degrees.";
    badgeColor = "bg-blue-50 text-blue-700 border-blue-100";
  } else if (angleCounterClockwiseDeg < 180) {
    angleType = "Obtuse Angle";
    angleDesc = "An angle that is greater than 90 degrees but less than 180 degrees.";
    badgeColor = "bg-amber-50 text-amber-700 border-amber-100";
  } else if (degString === "180.0") {
    angleType = "Straight Angle";
    angleDesc = "An angle that is exactly 180 degrees (forms a straight line).";
    badgeColor = "bg-purple-50 text-purple-700 border-purple-100";
  } else if (angleCounterClockwiseDeg < 360) {
    angleType = "Reflex Angle";
    angleDesc = "An angle that is greater than 180 degrees but less than 360 degrees.";
    badgeColor = "bg-pink-50 text-pink-700 border-pink-100";
  } else {
    angleType = "Full Rotation";
    angleDesc = "An angle that is exactly 360 degrees (a complete circle).";
    badgeColor = "bg-rose-50 text-rose-700 border-rose-100";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Interactive Graph Box (Left/Middle) */}
      <div className="md:col-span-2 flex flex-col items-center justify-center">
        <div ref={ref} className="relative w-full h-[400px] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
          <svg className="absolute inset-0 w-full h-full">
            <rect width="100%" height="100%" fill="transparent" />
            
            {/* Background grid */}
            <g stroke="#E2E8F0" strokeWidth="1">
              {Array.from({ length: 10 }, (_, i) => (
                <line key={`h-${i}`} x1="0" y1={i * 40} x2="100%" y2={i * 40} />
              ))}
              {Array.from({ length: 10 }, (_, i) => (
                <line key={`v-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="100%" />
              ))}
            </g>

            {/* Main Lines */}
            <line x1={pointA.x} y1={pointA.y} x2={center.x} y2={center.y} stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
            <line x1={pointB.x} y1={pointB.y} x2={center.x} y2={center.y} stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />

            {/* Angle Arcs & Badge */}
            {(() => {
              const arc1LargeArcFlag = angleCounterClockwiseRad > Math.PI;
              const arcPath1 = getArcPath(center, pointA, pointB, 40, arc1LargeArcFlag, true);
              const midPoint1 = getAngleTextMidpoint(center, pointA, pointB, 65, true);

              return (
                <g>
                  <path d={arcPath1} fill="none" stroke="#F59E0B" strokeWidth="3.5" />
                  <text
                    x={midPoint1.x}
                    y={midPoint1.y}
                    textAnchor="middle"
                    fontSize="14"
                    fill="#D97706"
                    fontWeight="bold"
                  >
                    {angleCounterClockwiseDeg.toFixed(1)}°
                  </text>
                </g>
              );
            })()}

            {/* Circles representing points */}
            <circle cx={pointA.x} cy={pointA.y} r="6" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx={pointB.x} cy={pointB.y} r="6" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx={center.x} cy={center.y} r="7" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />

            {otherPoints.map((point, index) => (
              <circle key={`dynamic-circle-${index}`} cx={point.x} cy={point.y} r="6" fill={`hsl(${index * 60 + 120}, 70%, 50%)`} stroke="#FFFFFF" strokeWidth="2" />
            ))}
          </svg>

          {/* Draggables */}
          <DraggablePoint position={pointA} onDrag={handleDragA} color="#EF4444" />
          <DraggablePoint position={pointB} onDrag={handleDragB} color="#3B82F6" />

          {otherPoints.map((point, index) => (
            <DraggablePoint
              key={`dynamic-drag-${index}`}
              position={point}
              onDrag={(newPosition) => handleDragOtherPoint(index, newPosition)}
              color={`hsl(${index * 60 + 120}, 70%, 50%)`}
            />
          ))}
        </div>
      </div>

      {/* Classification Box (Right) */}
      <div className="flex flex-col justify-center space-y-6 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Angle Classification</h3>
          <p className="text-sm text-gray-500 mt-1">
            Drag the points to dynamically observe the angle type classification change.
          </p>
        </div>

        {/* Display Card */}
        <div className={`p-5 rounded-2xl border ${badgeColor} shadow-sm space-y-2`}>
          <div className="text-xs font-bold uppercase tracking-wider">Classification</div>
          <div className="text-2xl font-black">{angleType}</div>
          <p className="text-sm opacity-90">{angleDesc}</p>
        </div>

        {/* Legend table */}
        <div className="space-y-2 text-xs text-gray-600">
          <div className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">Reference Table</div>
          <div className="grid grid-cols-2 border-b border-gray-100 pb-1">
            <span>Acute Angle</span>
            <span className="font-semibold text-right">&lt; 90°</span>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-100 pb-1">
            <span>Right Angle</span>
            <span className="font-semibold text-right">90°</span>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-100 pb-1">
            <span>Obtuse Angle</span>
            <span className="font-semibold text-right">90° - 180°</span>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-100 pb-1">
            <span>Straight Angle</span>
            <span className="font-semibold text-right">180°</span>
          </div>
          <div className="grid grid-cols-2">
            <span>Reflex Angle</span>
            <span className="font-semibold text-right">180° - 360°</span>
          </div>
        </div>
      </div>
    </div>
  );
}