import React, { useState } from "react";
import { useDrag } from "react-use-gesture";
import { animated } from "react-spring"; // Keep if needed for other animations, but not strictly for this
import useMeasure from "react-use-measure";
import { useWindowSize } from "react-use";
import { useClerk } from "@clerk/nextjs"; // Retaining this as it was in your original code

// Helper to get angle from 0 to 2*PI radians, sweeping counter-clockwise from A to B
function getAngleFromAToB(center, a, b) {
  const angleA = Math.atan2(a.y - center.y, a.x - center.x);
  const angleB = Math.atan2(b.y - center.y, b.x - center.x);

  let angle = angleB - angleA;
  if (angle < 0) {
    angle += 2 * Math.PI; // Ensure angle is positive (0 to 2*PI)
  }
  return angle; // in radians
}

function getArcPath(center, startPoint, endPoint, radius, largeArcFlag, sweepFlag) {
  const startAngle = Math.atan2(startPoint.y - center.y, startPoint.x - center.x);
  const endAngle = Math.atan2(endPoint.y - center.y, endPoint.x - center.x);

  const x1 = center.x + radius * Math.cos(startAngle);
  const y1 = center.y + radius * Math.sin(startAngle);
  const x2 = center.x + radius * Math.cos(endAngle);
  const y2 = center.y + radius * Math.sin(endAngle);

  // SVG arc command: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag ? 1 : 0} ${sweepFlag ? 1 : 0} ${x2} ${y2}`;
}

// Function to get the midpoint for angle text
function getAngleTextMidpoint(center, startPoint, endPoint, radius, isCounterClockwise) {
  const startAngle = Math.atan2(startPoint.y - center.y, startPoint.x - center.x);
  const endAngle = Math.atan2(endPoint.y - center.y, endPoint.x - center.x);

  let midAngle;

  if (isCounterClockwise) {
    let angleDiff = endAngle - startAngle;
    if (angleDiff < 0) angleDiff += 2 * Math.PI; // Ensure positive sweep for CCW
    midAngle = startAngle + angleDiff / 2;
  } else { // Clockwise
    let angleDiff = startAngle - endAngle; // Calculate difference for CW sweep
    if (angleDiff < 0) angleDiff += 2 * Math.PI; // Ensure positive sweep for CW
    midAngle = endAngle + angleDiff / 2; // Midpoint is relative to end angle for CW
  }

  return {
    x: center.x + radius * Math.cos(midAngle),
    y: center.y + radius * Math.sin(midAngle),
  };
}


export default function AnglePage() {
  // Initial positions to resemble the screenshot
  const [pointA, setPointA] = useState({ x: 150, y: 50 }); // Red point
  const [pointB, setPointB] = useState({ x: 200, y: 350 }); // Blue point
  const [center] = useState({ x: 200, y: 200 }); // Green point

  const [ref] = useMeasure();
  useWindowSize(); // Not directly used in rendering, but kept as per original

  const { user } = useClerk(); // Not directly used in rendering, but kept as per original

  const bindA = useDrag((state) => {
    setPointA({ x: state.offset[0], y: state.offset[1] });
  });

  const bindB = useDrag((state) => {
    setPointB({ x: state.offset[0], y: state.offset[1] });
  });

  // --- Angle Calculations ---
  const angleCounterClockwiseRad = getAngleFromAToB(center, pointA, pointB);
  const angleCounterClockwiseDeg = (angleCounterClockwiseRad * 180) / Math.PI;

  const angleClockwiseRad = 2 * Math.PI - angleCounterClockwiseRad;
  const angleClockwiseDeg = 360 - angleCounterClockwiseDeg;


  // Determine the large-arc-flag and sweep-flag for both arcs
  // Arc 1 (Orange): Counter-clockwise sweep from A to B
  const arc1LargeArcFlag = angleCounterClockwiseRad > Math.PI;
  const arc1SweepFlag = true; // Counter-clockwise

  // Arc 2 (Purple): Clockwise sweep from A to B (the reflex angle)
  const arc2LargeArcFlag = angleClockwiseRad > Math.PI;
  const arc2SweepFlag = false; // Clockwise


  // --- Arc Paths ---
  const arcPath1 = getArcPath(center, pointA, pointB, 40, arc1LargeArcFlag, arc1SweepFlag);
  const arcPath2 = getArcPath(center, pointA, pointB, 50, arc2LargeArcFlag, arc2SweepFlag);


  // --- Angle Text Midpoints ---
  const midPoint1 = getAngleTextMidpoint(center, pointA, pointB, 55, true); // For CCW angle
  const midPoint2 = getAngleTextMidpoint(center, pointA, pointB, 65, false); // For CW angle


  return (
    <div>
      <div ref={ref} className="relative w-full h-screen bg-gray-100">
        <svg className="absolute inset-0 w-full h-full">
          {/* Lines */}
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
          {/* Arc 1 (Orange - matches screenshot's orange angle logic) */}
          <path d={arcPath1} fill="none" stroke="orange" strokeWidth="3" />
          {/* Arc 2 (Purple - matches screenshot's purple angle logic) */}
          <path d={arcPath2} fill="none" stroke="purple" strokeWidth="2" strokeDasharray="6 4" />
          {/* Points */}
          <circle cx={pointA.x} cy={pointA.y} r="5" fill="red" />
          <circle cx={pointB.x} cy={pointB.y} r="5" fill="blue" />
          <circle cx={center.x} cy={center.y} r="5" fill="green" />
          {/* Angle Texts */}
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
        </svg>
        <animated.div
          {...bindA()}
          style={{
            position: "absolute",
            left: pointA.x - 5,
            top: pointA.y - 5,
            width: "10px",
            height: "10px",
            backgroundColor: "red",
            borderRadius: "50%",
            cursor: "grab",
          }}
        />
        <animated.div
          {...bindB()}
          style={{
            position: "absolute",
            left: pointB.x - 5,
            top: pointB.y - 5,
            width: "10px",
            height: "10px",
            backgroundColor: "blue",
            borderRadius: "50%",
            cursor: "grab",
          }}
        />
      </div>
    </div>
  );
}