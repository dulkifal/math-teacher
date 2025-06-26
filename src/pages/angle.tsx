import React, { useState, useCallback } from "react"; // Import useCallback
import useMeasure from "react-use-measure";
import { useWindowSize } from "react-use";
 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPlus, faRotateLeft} from '@fortawesome/free-solid-svg-icons' 
import Angle from "@/components/Angle";
import { Point } from "../types"; // Assuming Point and DraggablePointProps are defined in types.ts
import { getAngleFromAToB, getArcPath, getAngleTextMidpoint } from "../utils"; // Import utility functions
import {DraggablePoint} from "../components/DraggablePoint"; // Import the DraggablePoint component
import Transversal from "@/components/Transversal";

export default function AnglePage() {
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

  const addLine = () => {
    setOtherPoints(prevPoints => {
      // Ensure initial position for new points is distinct
      const newX = center.x + 50 + prevPoints.length * 10;
      const newY = center.y - 50 - prevPoints.length * 10;
      return [...prevPoints, { x: newX, y: newY }];
    });
  };

  // Undo handler: removes the last added line/point
  const handleUndo = useCallback(() => {
    setOtherPoints(prevPoints => prevPoints.slice(0, -1));
  }, []);

  return (
    <div className="relative">
        <div  className="grid grid-cols-2 gap-4 items-center justify-center relative w-full h-screen">
       
        
      <button
        onClick={addLine}
        className="absolute top-4 left-4 px-4 text-gray-500 bg-blue-50 rounded-md z-10"
      >
      <FontAwesomeIcon icon={faPlus} />
      </button>
      <button
        onClick={handleUndo}
        className="absolute top-4 left-28 p-2 bg-blue-50 text-gray-500 rounded-md z-10"
        disabled={otherPoints.length === 0}
      >
       <FontAwesomeIcon icon={faRotateLeft} />
      </button>
      <div ref={ref} className="  ">
        <svg className="absolute inset-0 w-full h-full">
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
            const angleClockwiseRad = 2 * Math.PI - angleCounterClockwiseRad;
            const angleClockwiseDeg = 360 - angleCounterClockwiseDeg;

            const arc1LargeArcFlag = angleCounterClockwiseRad > Math.PI;
            const arc1SweepFlag = true; // Counter-clockwise
            const arc2LargeArcFlag = angleClockwiseRad > Math.PI;
            const arc2SweepFlag = false; // Clockwise

            const arcPath1 = getArcPath(center, pointA, pointB, 40, arc1LargeArcFlag, arc1SweepFlag);
            const arcPath2 = getArcPath(center, pointA, pointB, 50, arc2LargeArcFlag, arc2SweepFlag);

            const midPoint1 = getAngleTextMidpoint(center, pointA, pointB, 55, true);
            const midPoint2 = getAngleTextMidpoint(center, pointA, pointB, 65, false);

            return (
              <>
                <path d={arcPath1} fill="none" stroke="orange" strokeWidth="3" />
                <path d={arcPath2} fill="none" stroke="purple" strokeWidth="2" strokeDasharray="6 4" />
                <text
                  x={midPoint1.x}
                  y={midPoint1.y}
                  textAnchor="middle"
                  fontSize="20"
                  fill="orange"
                  fontWeight="bold"
                >
                  {angleCounterClockwiseDeg.toFixed(1)}°
                </text>
                <text
                  x={midPoint2.x}
                  y={midPoint2.y}
                  textAnchor="middle"
                  fontSize="18"
                  fill="purple"
                  fontWeight="bold"
                >
                  {angleClockwiseDeg.toFixed(1)}°
                </text>
              </>
            );
          })()}


          {/* Dynamically added lines and their angles relative to Point A */}
          {otherPoints.map((point, index) => {
            const dynamicAngleCounterClockwiseRad = getAngleFromAToB(center, pointA, point);
            const dynamicAngleCounterClockwiseDeg = (dynamicAngleCounterClockwiseRad * 180) / Math.PI;

            // Define custom colors for dynamic lines/arcs to distinguish them
            const lineColor = `hsl(${index * 60 + 120}, 70%, 50%)`; // Greenish hues
            const arcColor = `hsl(${index * 60 + 180}, 80%, 60%)`; // Bluish hues
            const textColor = `hsl(${index * 60 + 180}, 90%, 40%)`;

            const arcLargeArcFlag = dynamicAngleCounterClockwiseRad > Math.PI;
            const arcSweepFlag = true; // Always counter-clockwise from pointA to the new point

            const arcPath = getArcPath(center, pointA, point, 40 + (index * 15), arcLargeArcFlag, arcSweepFlag); // Increase radius for distinct arcs

            const midPoint = getAngleTextMidpoint(center, pointA, point, 55 + (index * 15), true); // Increase radius for distinct text

            return (
              <React.Fragment key={`dynamic-line-${index}`}>
                <line
                  x1={point.x}
                  y1={point.y}
                  x2={center.x}
                  y2={center.y}
                  stroke={lineColor}
                  strokeWidth="2"
                  strokeDasharray="4 2" // Dashed line for dynamic ones
                />
                <path d={arcPath} fill="none" stroke={arcColor} strokeWidth="2" />
                <text
              
                  x={midPoint.x}
                  y={midPoint.y}
                  textAnchor="middle"
                  fontSize="16"
                  fill={textColor}
                  fontWeight="bold"
                >
                  {dynamicAngleCounterClockwiseDeg.toFixed(1)}°
                </text>
              </React.Fragment>
            );
          })}


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
   
      <Angle  />
      <Transversal />
      {/* <Transversal /> */}
      </div>
    </div>
  );
}