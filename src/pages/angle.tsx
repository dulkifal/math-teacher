import React, { useState, useCallback, useEffect } from "react";
import useMeasure from "react-use-measure";
import { useWindowSize } from "react-use";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import Angle from "@/components/Angle";
import { Point } from "../types";
import { getAngleFromAToB, getArcPath, getAngleTextMidpoint } from "../utils";
import { DraggablePoint } from "../components/DraggablePoint";
import Transversal from "@/components/Transversal";

export default function AnglePage() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Progress States
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<"sandbox" | "classification" | "transversal">("sandbox");

  // Sandbox States
  const [pointA, setPointA] = useState<Point>({ x: 150, y: 70 });
  const [pointB, setPointB] = useState<Point>({ x: 250, y: 330 });
  const [otherPoints, setOtherPoints] = useState<Point[]>([]);
  const [center] = useState<Point>({ x: 200, y: 200 });

  const [ref] = useMeasure();
  useWindowSize();

  // Fetch completion state on mount
  useEffect(() => {
    if (userId) {
      axios.get(`/api/progress?userId=${userId}`).then((res) => {
        const completedLessons = res.data.completedLessons || [];
        if (completedLessons.includes("angle")) {
          setCompleted(true);
        }
      });
    }
  }, [userId]);

  // Mark Lesson as Completed
  const handleCompleteLesson = async () => {
    if (!userId) return;
    setSavingProgress(true);
    try {
      await axios.post("/api/progress", {
        userId,
        lessonId: "angle",
        action: "complete_lesson",
      });
      setCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProgress(false);
    }
  };

  // Drag handlers
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

  const addLine = () => {
    setOtherPoints((prevPoints) => {
      const newX = center.x + 50 + prevPoints.length * 15;
      const newY = center.y - 50 - prevPoints.length * 15;
      return [...prevPoints, { x: newX, y: newY }];
    });
  };

  const handleUndo = useCallback(() => {
    setOtherPoints((prevPoints) => prevPoints.slice(0, -1));
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-950 flex items-center gap-2">
              📐 Geometry & Angles Mastery
            </h1>
            <p className="text-gray-500 mt-1">
              Explore dynamic angles, measure classification names, and discover parallel lines cut by transversals.
            </p>
          </div>
          {userId && (
            <div>
              {completed ? (
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 font-bold flex items-center gap-1">
                  ✓ Lesson Completed
                </div>
              ) : (
                <button
                  onClick={handleCompleteLesson}
                  disabled={savingProgress}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold px-5 py-2.5 rounded-xl shadow transition duration-200"
                >
                  {savingProgress ? "Saving..." : "Mark as Completed"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all ${
              activeTab === "sandbox" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Angle Constructor Sandbox
          </button>
          <button
            onClick={() => setActiveTab("classification")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all ${
              activeTab === "classification" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Angle Types & Classifier
          </button>
          <button
            onClick={() => setActiveTab("transversal")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all ${
              activeTab === "transversal" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Transversal Lines
          </button>
        </div>

        {/* Tab Content: Sandbox */}
        {activeTab === "sandbox" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            {/* Interactive Area (Left/Middle) */}
            <div className="md:col-span-2 flex flex-col items-center justify-center">
              <div ref={ref} className="relative w-full h-[400px] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
                {/* Float controls inside the canvas */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <button
                    onClick={addLine}
                    title="Add dynamic line"
                    className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-blue-600 rounded-xl shadow-md transition duration-200"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                  <button
                    onClick={handleUndo}
                    disabled={otherPoints.length === 0}
                    title="Undo last line"
                    className="p-3 bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:text-gray-300 border border-slate-200 text-blue-600 rounded-xl shadow-md transition duration-200"
                  >
                    <FontAwesomeIcon icon={faRotateLeft} />
                  </button>
                </div>

                <svg className="absolute inset-0 w-full h-full">
                  {/* Grid Lines */}
                  <g stroke="#E2E8F0" strokeWidth="1">
                    {Array.from({ length: 10 }, (_, i) => (
                      <line key={`lh-${i}`} x1="0" y1={i * 40} x2="100%" y2={i * 40} />
                    ))}
                    {Array.from({ length: 10 }, (_, i) => (
                      <line key={`lv-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="100%" />
                    ))}
                  </g>

                  {/* Lines from Points A and B */}
                  <line
                    x1={pointA.x}
                    y1={pointA.y}
                    x2={center.x}
                    y2={center.y}
                    stroke="#1E293B"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1={pointB.x}
                    y1={pointB.y}
                    x2={center.x}
                    y2={center.y}
                    stroke="#1E293B"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Calculations & Arcs */}
                  {(() => {
                    const angleCounterClockwiseRad = getAngleFromAToB(center, pointA, pointB);
                    const angleCounterClockwiseDeg = (angleCounterClockwiseRad * 180) / Math.PI;
                    const angleClockwiseRad = 2 * Math.PI - angleCounterClockwiseRad;
                    const angleClockwiseDeg = 360 - angleCounterClockwiseDeg;

                    const arc1LargeArcFlag = angleCounterClockwiseRad > Math.PI;
                    const arc2LargeArcFlag = angleClockwiseRad > Math.PI;

                    const arcPath1 = getArcPath(center, pointA, pointB, 40, arc1LargeArcFlag, true);
                    const arcPath2 = getArcPath(center, pointA, pointB, 55, arc2LargeArcFlag, false);

                    const midPoint1 = getAngleTextMidpoint(center, pointA, pointB, 65, true);
                    const midPoint2 = getAngleTextMidpoint(center, pointA, pointB, 80, false);

                    return (
                      <g>
                        <path d={arcPath1} fill="none" stroke="#F59E0B" strokeWidth="3.5" />
                        <path d={arcPath2} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeDasharray="6 4" />
                        
                        {/* Text Badges */}
                        <text
                          x={midPoint1.x}
                          y={midPoint1.y}
                          textAnchor="middle"
                          fontSize="14"
                          fill="#D97706"
                          fontWeight="bold"
                          className="bg-white/80 filter drop-shadow-sm"
                        >
                          {angleCounterClockwiseDeg.toFixed(1)}°
                        </text>
                        <text
                          x={midPoint2.x}
                          y={midPoint2.y}
                          textAnchor="middle"
                          fontSize="13"
                          fill="#7C3AED"
                          fontWeight="bold"
                        >
                          {angleClockwiseDeg.toFixed(1)}°
                        </text>
                      </g>
                    );
                  })()}

                  {/* Dynamic added lines */}
                  {otherPoints.map((point, index) => {
                    const dynamicAngleCounterClockwiseRad = getAngleFromAToB(center, pointA, point);
                    const dynamicAngleCounterClockwiseDeg = (dynamicAngleCounterClockwiseRad * 180) / Math.PI;

                    const lineColor = `hsl(${index * 60 + 140}, 75%, 45%)`;
                    const arcColor = `hsl(${index * 60 + 140}, 85%, 60%)`;

                    const arcLargeArcFlag = dynamicAngleCounterClockwiseRad > Math.PI;
                    const arcPath = getArcPath(center, pointA, point, 40 + (index + 1) * 18, arcLargeArcFlag, true);
                    const midPoint = getAngleTextMidpoint(center, pointA, point, 52 + (index + 1) * 18, true);

                    return (
                      <g key={`dynamic-line-${index}`}>
                        <line
                          x1={point.x}
                          y1={point.y}
                          x2={center.x}
                          y2={center.y}
                          stroke={lineColor}
                          strokeWidth="2.5"
                          strokeDasharray="5 3"
                        />
                        <path d={arcPath} fill="none" stroke={arcColor} strokeWidth="2" />
                        <text
                          x={midPoint.x}
                          y={midPoint.y}
                          textAnchor="middle"
                          fontSize="13"
                          fill={lineColor}
                          fontWeight="bold"
                        >
                          {dynamicAngleCounterClockwiseDeg.toFixed(1)}°
                        </text>
                      </g>
                    );
                  })}

                  {/* Static Point Highlights */}
                  <circle cx={pointA.x} cy={pointA.y} r="6" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx={pointB.x} cy={pointB.y} r="6" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx={center.x} cy={center.y} r="7" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />

                  {otherPoints.map((point, index) => (
                    <circle
                      key={`dynamic-circle-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r="6"
                      fill={`hsl(${index * 60 + 140}, 75%, 45%)`}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
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
                    color={`hsl(${index * 60 + 140}, 75%, 45%)`}
                  />
                ))}
              </div>
            </div>

            {/* Instruction sidebar */}
            <div className="space-y-6 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
              <h3 className="text-xl font-bold text-gray-900">Custom Angles Sandbox</h3>
              <p className="text-sm text-gray-500">
                Drag the **red** and **blue** handles around the green center point to construct and measure any geometric angle.
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block"></span>
                  Yellow Arc: Inner Angle (CCW)
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-500 inline-block"></span>
                  Purple Arc: Outer Angle (CW)
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-800 space-y-1.5">
                <p className="font-bold">💡 Multi-line construction:</p>
                <p>
                  Click the **+** button at the top-left of the graph canvas to add extra lines and measure multiple angles simultaneously relative to the base red point.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Classification */}
        {activeTab === "classification" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <Angle />
          </div>
        )}

        {/* Tab Content: Transversal */}
        {activeTab === "transversal" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <Transversal />
          </div>
        )}

      </div>
    </div>
  );
}