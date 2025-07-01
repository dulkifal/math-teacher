import React, { useState, useCallback } from "react"; // Import useCallback

import useMeasure from "react-use-measure";
import { useWindowSize } from "react-use";

import { Point } from "../types";
import { getAngleFromAToB, getArcPath, getAngleTextMidpoint, } from "../utils"; // Import utility functions

import { DraggablePoint } from "../components/DraggablePoint"; // Import the DraggablePoint component
export default function Angle() {
    const [pointA, setPointA] = useState<Point>({ x: 150, y: 50 });
    const [pointB, setPointB] = useState<Point>({ x: 200, y: 350 });
    const [otherPoints, setOtherPoints] = useState<Point[]>([]); // <-- Fix: type as Point[]
    const [center] = useState<Point>({ x: 200, y: 200 });

    const [ref] = useMeasure();
    useWindowSize();


    // Optimized drag handlers for fixed points using useCallback
    const handleDragA = useCallback((newPosition: Point) => {
        setPointA(newPosition);


    }, []);

    const handleDragB = useCallback((newPosition: Point) => {
        setPointB(newPosition);
    }, []);

    // Optimized drag handler for dynamic points using useCallback
    const handleDragOtherPoint = useCallback((index: number, newPosition: Point) => {
        setOtherPoints(prevPoints => {
            const newPoints = [...prevPoints];
            newPoints[index] = newPosition;
            return newPoints;
        });
    }, []);



    return (


        <div ref={ref} className="border-2 border-solid border-gray-300 relative w-full h-full">
            <div className=" flex items-center justify-center z-10">

                <h2>Angle Visualization</h2>
            </div>


            <svg className="absolute inset-0 w-full h-50%" width="400" height="400">



                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="0"
                        refY="3.5"
                        orient="auto"
                    >
                        <polygon points="0 0, 10 3.5, 0 7" fill="black" />
                    </marker>
                </defs>
                <rect width="100%" height="100%" fill="white" />
                {/* Background grid */}
                <g stroke="#e0e0e0" strokeWidth="1">
                    {Array.from({ length: 20 }, (_, i) => (
                        <line
                            key={`h-${i}`}
                            x1="0"
                            y1={i * 40}
                            x2="100%"
                            y2={i * 40}
                        />
                    ))}
                    {Array.from({ length: 20 }, (_, i) => (
                        <line
                            key={`v-${i}`}
                            x1={i * 40}
                            y1="0"
                            x2={i * 40}
                            y2="100%"
                        />
                    ))}
                </g>
                {/* Center Point */}
                <circle cx={center.x} cy={center.y} r="5" fill="
#00FF00" />




                {/* Main Points A and B */}
                <circle cx={pointA.x} cy={pointA.y} r="5" fill="red" />
                <circle cx={pointB.x} cy={pointB.y} r="5" fill="blue" />

                {/* Main Lines from Points A and B */}
                <line
                    x1={pointA.x}
                    y1={pointA.y}
                    x2={center.x}
                    y2={center.y}
                    stroke="black"
                    strokeWidth="2"
                />
                <line
                    x1={pointB.x}
                    y1={pointB.y}
                    x2={center.x}
                    y2={center.y}
                    stroke="black"
                    strokeWidth="2"
                />

                {/* Angles for Point A and Point B */}
                {(() => {
                    const angleCounterClockwiseRad = getAngleFromAToB(center, pointA, pointB);
                    const angleCounterClockwiseDeg = (angleCounterClockwiseRad * 180) / Math.PI;

                    const arc1LargeArcFlag = angleCounterClockwiseRad > Math.PI;
                    const arc1SweepFlag = true; // Counter-clockwise

                    const arcPath1 = getArcPath(center, pointA, pointB, 40, arc1LargeArcFlag, arc1SweepFlag);
                    // const arcPath2 = getArcPath(center, pointA, pointB, 50, arc2LargeArcFlag, arc2SweepFlag);

                    const midPoint1 = getAngleTextMidpoint(center, pointA, pointB, 55, true);
                    // const midPoint2 = getAngleTextMidpoint(center, pointA, pointB, 65, false);

                    return (
                        <>
                            <path d={arcPath1} fill="none" stroke="orange" strokeWidth="3" />

                            <text
                                x={midPoint1.x}
                                y={midPoint1.y}
                                textAnchor="middle"
                                fontSize="20"
                                fill="orange"
                                fontWeight="bold"
                            >
                                {angleCounterClockwiseDeg.toFixed(1)}° {
                                    angleCounterClockwiseDeg.toFixed(1) === "90.0"
                                        ? "Right Angle"
                                        : angleCounterClockwiseDeg < 90
                                            ? "Acute Angle"
                                            : angleCounterClockwiseDeg < 180
                                                ? "Obtuse Angle"
                                                : angleCounterClockwiseDeg.toFixed(1) === "180.0"
                                                    ? "Straight Angle"
                                                    : angleCounterClockwiseDeg < 360
                                                        ? "Reflex Angle"
                                                        : "Full Rotation"
                                }
                            </text>

                        </>
                    );
                })()}
                {/* Points (SVG Circles) */}
                <circle cx={pointA.x} cy={pointA.y} r="5" fill="red" />
                <circle cx={pointB.x} cy={pointB.y} r="5" fill="blue" />
                <circle cx={center.x} cy={center.y} r="5" fill="green" />

                {otherPoints.map((point, index) => (
                    <circle key={`dynamic-circle-${index}`} cx={point.x} cy={point.y} r="5" fill={`hsl(${index * 60 + 120}, 70%, 50%)`} />
                ))}
            </svg>

            {/* Draggable HTML elements rendered by DraggablePoint component */}
            <DraggablePoint position={pointA} onDrag={handleDragA} color="red" />
            <DraggablePoint position={pointB} onDrag={handleDragB} color="blue" />

            {otherPoints.map((point, index) => (
                <DraggablePoint
                    key={`dynamic-drag-${index}`} // Use a unique key for list items
                    position={point}
                    onDrag={(newPosition) => handleDragOtherPoint(index, newPosition)}
                    color={`hsl(${index * 60 + 120}, 70%, 50%)`}
                />
            ))}
        </div>

    );
}