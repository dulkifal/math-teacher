// single line at center and a line to center point and point b and the line couldd be dragged and rotated and mesure the angle
import React, { useState } from "react";
import { useDrag } from "react-use-gesture";
import { useSpring, animated } from "react-spring";
import useMeasure from "react-use-measure";
import { useWindowSize } from "react-use";
import { useClerk } from "@clerk/nextjs";

function getAngles(center: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) {
  const v1 = { x: a.x - center.x, y: a.y - center.y };
  const v2 = { x: b.x - center.x, y: b.y - center.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  const cosTheta = dot / (mag1 * mag2);
  let angleRad = Math.acos(Math.max(-1, Math.min(1, cosTheta)));
  let angleDeg = (angleRad * 180) / Math.PI;
  let reflexRad = 2 * Math.PI - angleRad;
  let reflexDeg = 360 - angleDeg;
  return { angleRad, angleDeg, reflexRad, reflexDeg };
}

function getArcPath(center: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }, radius = 40, largeArc = false) {
  const startAngle = Math.atan2(a.y - center.y, a.x - center.x);
  const endAngle = Math.atan2(b.y - center.y, b.x - center.x);
  let delta = endAngle - startAngle;
  if (delta < 0) delta += 2 * Math.PI;
  const largeArcFlag = largeArc ? 1 : 0;
  const sweepFlag = 1;
  const x1 = center.x + radius * Math.cos(startAngle);
  const y1 = center.y + radius * Math.sin(startAngle);
  const x2 = center.x + radius * Math.cos(endAngle);
  const y2 = center.y + radius * Math.sin(endAngle);
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;
}

export default function AnglePage() {
  const [pointA, setPointA] = useState({ x: 100, y: 100 });
  const [pointB, setPointB] = useState({ x: 300, y: 100 });
  const [center] = useState({ x: 200, y: 200 });

  const [ref] = useMeasure();
  useWindowSize();

  const { user } = useClerk();

  const bindA = useDrag((state) => {
    setPointA({ x: state.offset[0], y: state.offset[1] });
  });

  const bindB = useDrag((state) => {
    setPointB({ x: state.offset[0], y: state.offset[1] });
  });

  const { angleRad, angleDeg, reflexRad, reflexDeg } = getAngles(center, pointA, pointB);

  // Arc paths
  const arcPathSmall = getArcPath(center, pointA, pointB, 40, false);
  const arcPathLarge = getArcPath(center, pointA, pointB, 40, true);

  // For placing angle text, find the arc midpoints
  function getArcMidpoint(
    center: { x: number; y: number },
    a: { x: number; y: number },
    b: { x: number; y: number },
    radius = 55,
    largeArc = false
  ) {
    const startAngle = Math.atan2(a.y - center.y, a.x - center.x);
    const endAngle = Math.atan2(b.y - center.y, b.x - center.x);

    // Calculate the sweep angle as SVG does
    let sweep = endAngle - startAngle;
    if (sweep < 0) sweep += 2 * Math.PI;

    // If largeArc, take the longer way around
    let midAngle;
    if (largeArc) {
      if (sweep < Math.PI) sweep = 2 * Math.PI - sweep;
      midAngle = startAngle + sweep / 2;
    } else {
      if (sweep > Math.PI) sweep = 2 * Math.PI - sweep;
      midAngle = startAngle + sweep / 2;
    }

    // For the large arc, add π to go to the opposite side
    if (largeArc) midAngle += Math.PI;

    // Normalize
    midAngle = (midAngle + 2 * Math.PI) % (2 * Math.PI);

    return {
      x: center.x + radius * Math.cos(midAngle),
      y: center.y + radius * Math.sin(midAngle),
    };
  }

  const midSmall = getArcMidpoint(center, pointA, pointB, 55, false);
  const midLarge = getArcMidpoint(center, pointA, pointB, 65, true);

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
          {/* Small Arc */}
          <path d={arcPathSmall} fill="none" stroke="orange" strokeWidth="3" />
          {/* Large Arc */}
          <path d={arcPathLarge} fill="none" stroke="purple" strokeWidth="2" strokeDasharray="6 4" />
          {/* Points */}
          <circle cx={pointA.x} cy={pointA.y} r="5" fill="red" />
          <circle cx={pointB.x} cy={pointB.y} r="5" fill="blue" />
          <circle cx={center.x} cy={center.y} r="5" fill="green" />
          {/* Angle Texts */}
          <text
            x={midSmall.x}
            y={midSmall.y}
            textAnchor="middle"
            fontSize="20"
            fill="orange"
            fontWeight="bold"
          >
            {angleDeg.toFixed(1)}°
          </text>
          <text
            x={midLarge.x}
            y={midLarge.y}
            textAnchor="middle"
            fontSize="18"
            fill="purple"
            fontWeight="bold"
          >
            {reflexDeg.toFixed(1)}°
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
            cursor: "pointer",
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
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
}
