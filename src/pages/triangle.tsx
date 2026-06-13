import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompass, faBook, faGraduationCap } from '@fortawesome/free-solid-svg-icons';

// Define a scaling factor for converting pixels to 'cm' for display purposes
const PIXELS_PER_CM = 10; // 10 pixels = 1 cm
const SVG_VIEWBOX_SIZE = 200; // Consistent viewBox size for all SVGs

// Define types for point coordinates
interface Point {
  x: number;
  y: number;
}

// Define type for vertex keys
type VertexKey = 'A' | 'B' | 'C';

// Helper function to calculate distance between two points (for side lengths)
const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Helper function to calculate midpoint of a line segment
const calculateMidpoint = (p1: Point, p2: Point): Point => {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
};

// Helper function to calculate angle using Law of Cosines
// Given side lengths a, b, c, calculates the angle opposite to side c
const calculateAngle = (a: number, b: number, c: number): number => {
  // Avoid division by zero or invalid arccos input
  if (a === 0 || b === 0) return 0;
  const cosC = (a * a + b * b - c * c) / (2 * a * b);
  // Clamp cosC to [-1, 1] to prevent NaN from floating point inaccuracies
  const clampedCosC = Math.max(-1, Math.min(1, cosC));
  return (Math.acos(clampedCosC) * 180) / Math.PI; // Convert radians to degrees
};

// Helper function to calculate the foot of the altitude from a vertex to the opposite side
const calculateAltitudeFoot = (vertex: Point, p1: Point, p2: Point): Point => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return p1; // p1 and p2 are the same point

  const t = ((vertex.x - p1.x) * dx + (vertex.y - p1.y) * dy) / lenSq;

  // The foot of the perpendicular
  return {
    x: p1.x + t * dx,
    y: p1.y + t * dy,
  };
};

// Helper function to calculate a point on the angle bisector
const calculateAngleBisectorPoint = (v1: Point, v2: Point, v3: Point, length: number = 50): Point => {
  // Vector from v2 to v1
  const vec1x = v1.x - v2.x;
  const vec1y = v1.y - v2.y;
  const len1 = Math.sqrt(vec1x * vec1x + vec1y * vec1y);
  const unitVec1x = vec1x / len1;
  const unitVec1y = vec1y / len1;

  // Vector from v2 to v3
  const vec2x = v3.x - v2.x;
  const vec2y = v3.y - v2.y;
  const len2 = Math.sqrt(vec2x * vec2x + vec2y * vec2y);
  const unitVec2x = vec2x / len2;
  const unitVec2y = vec2y / len2;

  // Sum of unit vectors gives direction of bisector
  const bisectorVecX = unitVec1x + unitVec2x;
  const bisectorVecY = unitVec1y + unitVec2y;
  const bisectorLen = Math.sqrt(bisectorVecX * bisectorVecX + bisectorVecY * bisectorVecY);

  if (bisectorLen === 0) return v2; // Should not happen for a valid triangle

  // Normalize and scale to desired length
  const bisectorUnitX = bisectorVecX / bisectorLen;
  const bisectorUnitY = bisectorVecY / bisectorLen;

  return {
    x: v2.x + bisectorUnitX * length,
    y: v2.y + bisectorUnitY * length,
  };
};


// Generic Triangle Visualization Component
interface TriangleProps {
  initialVertices: { A: Point; B: Point; C: Point };
  title: string;
  description: string;
  showMedians?: boolean;
  showAltitudes?: boolean;
  showCentroid?: boolean;
  showExteriorAngles?: boolean;
  showInteriorAngles?: boolean;
  showAngleBisectors?: boolean;
  showPythagoreanTheorem?: boolean; // For a dedicated right triangle example
  showAreaPerimeter?: boolean;
  showLegsAndHypotenuse?: boolean; // For Pythagorean theorem example
}

const TriangleVisualizer: React.FC<TriangleProps> = ({
  initialVertices,
  title,
  description,
  showMedians = false,
  showAltitudes = false,
  showCentroid = false,
  showExteriorAngles = false,
  showInteriorAngles = true, // Always show interior angles by default
  showAngleBisectors = false,
  showPythagoreanTheorem = false,
  showAreaPerimeter = false,
  showLegsAndHypotenuse = false, // For Pythagorean theorem example
}) => {
  const [vertices, setVertices] = useState(initialVertices);
  const [draggingVertex, setDraggingVertex] = useState<VertexKey | null>(null);
  const [selectedVertex, setSelectedVertex] = useState<VertexKey>('A');


  const [triangleData, setTriangleData] = useState({
    ab: 0, bc: 0, ca: 0,
    angleA: 0, angleB: 0, angleC: 0,
    area: 0, perimeter: 0,
  });

  useEffect(() => {
    const { A, B, C } = vertices;

    const ab = calculateDistance(A, B);
    const bc = calculateDistance(B, C);
    const ca = calculateDistance(C, A);

    const angleA = calculateAngle(ca, ab, bc);
    const angleB = calculateAngle(ab, bc, ca);
    const angleC = calculateAngle(bc, ca, ab);

    // Calculate Area (Heron's formula)
    const s = (ab + bc + ca) / 2; // semi-perimeter
    const area = Math.sqrt(s * (s - ab) * (s - bc) * (s - ca));
    const perimeter = ab + bc + ca;

    setTriangleData({ ab, bc, ca, angleA, angleB, angleC, area, perimeter });
  }, [vertices]);

  const handleMouseDown = useCallback((vertexKey: VertexKey) => () => {
    setDraggingVertex(vertexKey);
    setSelectedVertex(vertexKey);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingVertex) {
      const svg = e.currentTarget;
      const svgRect = svg.getBoundingClientRect();

      let newX = e.clientX - svgRect.left;
      let newY = e.clientY - svgRect.top;

      newX = Math.max(0, Math.min(SVG_VIEWBOX_SIZE, newX));
      newY = Math.max(0, Math.min(SVG_VIEWBOX_SIZE, newY));

      setVertices((prevVertices) => ({
        ...prevVertices,
        [draggingVertex]: { x: newX, y: newY },
      }));
    }
  }, [draggingVertex]);

  const handleMouseUp = useCallback(() => {
    setDraggingVertex(null);
  }, []);

  const moveSelectedVertex = useCallback((dx: number, dy: number) => {
    if (selectedVertex) {
      setVertices((prevVertices) => {
        const currentPos = prevVertices[selectedVertex];
        let newX = currentPos.x + dx;
        let newY = currentPos.y + dy;

        newX = Math.max(0, Math.min(SVG_VIEWBOX_SIZE, newX));
        newY = Math.max(0, Math.min(SVG_VIEWBOX_SIZE, newY));

        return {
          ...prevVertices,
          [selectedVertex]: { x: newX, y: newY },
        };
      });
    }
  }, [selectedVertex]);

  // Calculations for specific properties
  const midpointAB = calculateMidpoint(vertices.A, vertices.B);
  const midpointBC = calculateMidpoint(vertices.B, vertices.C);
  const midpointCA = calculateMidpoint(vertices.C, vertices.A);

  const centroid = showCentroid ? {
    x: (vertices.A.x + vertices.B.x + vertices.C.x) / 3,
    y: (vertices.A.y + vertices.B.y + vertices.C.y) / 3,
  } : null;

  const altitudeFootA = calculateAltitudeFoot(vertices.A, vertices.B, vertices.C);
  const altitudeFootB = calculateAltitudeFoot(vertices.B, vertices.C, vertices.A);
  const altitudeFootC = calculateAltitudeFoot(vertices.C, vertices.A, vertices.B);

  const bisectorPointA = calculateAngleBisectorPoint(vertices.C, vertices.A, vertices.B);
  const bisectorPointB = calculateAngleBisectorPoint(vertices.A, vertices.B, vertices.C);
  const bisectorPointC = calculateAngleBisectorPoint(vertices.B, vertices.C, vertices.A);

  // Check for right triangle for Pythagorean theorem
  const isRightTriangle =
    Math.abs(triangleData.angleA - 90) < 0.1 ||
    Math.abs(triangleData.angleB - 90) < 0.1 ||
    Math.abs(triangleData.angleC - 90) < 0.1;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center w-full">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">{title}</h2>
      <p className="text-gray-600 text-sm mb-4 text-center">{description}</p>

      <svg
        width="100%"
        height="250"
        viewBox={`0 0 ${SVG_VIEWBOX_SIZE} ${SVG_VIEWBOX_SIZE}`}
        className="bg-white border border-gray-300 rounded-lg shadow-inner mb-4"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Reset Button */}
        <g
          className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
          onClick={() => {
            setVertices(initialVertices);
            setSelectedVertex('A');
          }}
        >
          <rect x="5" y="5" width="30" height="12" fill="#e0e0e0" rx="3" ry="3" />
          <text x="20" y="13" fontSize="6" textAnchor="middle" fill="black" fontWeight="bold">Reset</text>
        </g>

        {/* Directional Arrow Controls */}
        <g transform={`translate(${SVG_VIEWBOX_SIZE - 25}, 20)`}>
          <rect x="-20" y="-20" width="40" height="40" fill="#f0f0f0" rx="6" ry="6" stroke="#ccc" strokeWidth="1" />
          <path d="M0 -10 L-4 -2 L4 -2 Z" fill="black" className="cursor-pointer hover:fill-gray-600 active:fill-gray-800" onClick={() => moveSelectedVertex(0, -3)} />
          <path d="M0 10 L-4 2 L4 2 Z" fill="black" className="cursor-pointer hover:fill-gray-600 active:fill-gray-800" onClick={() => moveSelectedVertex(0, 3)} />
          <path d="M-10 0 L-2 -4 L-2 4 Z" fill="black" className="cursor-pointer hover:fill-gray-600 active:fill-gray-800" onClick={() => moveSelectedVertex(-3, 0)} />
          <path d="M10 0 L2 -4 L2 4 Z" fill="black" className="cursor-pointer hover:fill-gray-600 active:fill-gray-800" onClick={() => moveSelectedVertex(3, 0)} />
        </g>


        {/* Triangle Sides */}
        <line x1={vertices.A.x} y1={vertices.A.y} x2={vertices.B.x} y2={vertices.B.y} stroke="black" strokeWidth="2" />
        <line x1={vertices.B.x} y1={vertices.B.y} x2={vertices.C.x} y2={vertices.C.y} stroke="black" strokeWidth="2" />
        <line x1={vertices.C.x} y1={vertices.C.y} x2={vertices.A.x} y2={vertices.A.y} stroke="black" strokeWidth="2" />

        {/* Medians */}
        {showMedians && (
          <>
            <line x1={vertices.A.x} y1={vertices.A.y} x2={midpointBC.x} y2={midpointBC.y} stroke="purple" strokeWidth="1" strokeDasharray="4 2" />
            <line x1={vertices.B.x} y1={vertices.B.y} x2={midpointCA.x} y2={midpointCA.y} stroke="orange" strokeWidth="1" strokeDasharray="4 2" />
            <line x1={vertices.C.x} y1={vertices.C.y} x2={midpointAB.x} y2={midpointAB.y} stroke="teal" strokeWidth="1" strokeDasharray="4 2" />
            <circle cx={midpointAB.x} cy={midpointAB.y} r="2" fill="gray" />
            <circle cx={midpointBC.x} cy={midpointBC.y} r="2" fill="gray" />
            <circle cx={midpointCA.x} cy={midpointCA.y} r="2" fill="gray" />
          </>
        )}

        {/* Centroid */}
        {showCentroid && centroid && (
          <circle cx={centroid.x} cy={centroid.y} r="4" fill="darkblue" />
        )}

        {/* Altitudes */}
        {showAltitudes && (
          <>
            <line x1={vertices.A.x} y1={vertices.A.y} x2={altitudeFootA.x} y2={altitudeFootA.y} stroke="red" strokeWidth="1" strokeDasharray="2 1" />
            <line x1={vertices.B.x} y1={vertices.B.y} x2={altitudeFootB.x} y2={altitudeFootB.y} stroke="green" strokeWidth="1" strokeDasharray="2 1" />
            <line x1={vertices.C.x} y1={vertices.C.y} x2={altitudeFootC.x} y2={altitudeFootC.y} stroke="blue" strokeWidth="1" strokeDasharray="2 1" />
            {/* Right angle symbols - simplified for SVG */}
            <rect x={altitudeFootA.x - 3} y={altitudeFootA.y - 3} width="6" height="6" fill="none" stroke="red" strokeWidth="0.5" transform={`rotate(${Math.atan2(vertices.B.y - vertices.C.y, vertices.B.x - vertices.C.x) * 180 / Math.PI}, ${altitudeFootA.x}, ${altitudeFootA.y})`} />
          </>
        )}

        {/* Angle Bisectors */}
        {showAngleBisectors && (
          <>
            <line x1={vertices.A.x} y1={vertices.A.y} x2={bisectorPointA.x} y2={bisectorPointA.y} stroke="brown" strokeWidth="1" strokeDasharray="3 2" />
            <line x1={vertices.B.x} y1={vertices.B.y} x2={bisectorPointB.x} y2={bisectorPointB.y} stroke="darkcyan" strokeWidth="1" strokeDasharray="3 2" />
            <line x1={vertices.C.x} y1={vertices.C.y} x2={bisectorPointC.x} y2={bisectorPointC.y} stroke="darkgreen" strokeWidth="1" strokeDasharray="3 2" />
          </>
        )}

        {/* Exterior Angles */}
        {showExteriorAngles && (
          <>
            {/* Extend side BC from C */}
            <line x1={vertices.C.x} y1={vertices.C.y} x2={vertices.C.x + (vertices.C.x - vertices.B.x) * 0.5} y2={vertices.C.y + (vertices.C.y - vertices.B.y) * 0.5} stroke="gray" strokeWidth="1" strokeDasharray="2 2" />
            {/* Exterior angle at C */}
            <text x={vertices.C.x + (vertices.C.x - vertices.B.x) * 0.2 + (vertices.A.x - vertices.C.x) * 0.05} y={vertices.C.y + (vertices.C.y - vertices.B.y) * 0.2 + (vertices.A.y - vertices.C.y) * 0.05} fontSize="7" fill="darkred">
              Ext C: {(180 - triangleData.angleC).toFixed(1)}°
            </text>
          </>
        )}

        {/* Vertices (draggable circles) */}
        <circle
          cx={vertices.A.x}
          cy={vertices.A.y}
          r="5"
          fill="red"
          className={`cursor-grab active:cursor-grabbing ${selectedVertex === 'A' ? 'stroke-blue-500 stroke-2' : ''}`}
          onMouseDown={handleMouseDown('A')}
        />
        <circle
          cx={vertices.B.x}
          cy={vertices.B.y}
          r="5"
          fill="blue"
          className={`cursor-grab active:cursor-grabbing ${selectedVertex === 'B' ? 'stroke-blue-500 stroke-2' : ''}`}
          onMouseDown={handleMouseDown('B')}
        />
        <circle
          cx={vertices.C.x}
          cy={vertices.C.y}
          r="5"
          fill="green"
          className={`cursor-grab active:cursor-grabbing ${selectedVertex === 'C' ? 'stroke-blue-500 stroke-2' : ''}`}
          onMouseDown={handleMouseDown('C')}
        />

        {/* Midpoints (small circles) - only if medians are shown */}
        {showMedians && (
          <>
            <circle cx={midpointAB.x} cy={midpointAB.y} r="2" fill="gray" />
            <circle cx={midpointBC.x} cy={midpointBC.y} r="2" fill="gray" />
            <circle cx={midpointCA.x} cy={midpointCA.y} r="2" fill="gray" />
          </>
        )}


        {/* Vertex Labels */}
        <text x={vertices.A.x} y={vertices.A.y - 8} fontSize="9" textAnchor="middle" fill="red" fontWeight="bold">A</text>
        <text x={vertices.B.x - 8} y={vertices.B.y + 4} fontSize="9" textAnchor="end" fill="blue" fontWeight="bold">B</text>
        <text x={vertices.C.x + 8} y={vertices.C.y + 4} fontSize="9" textAnchor="start" fill="green" fontWeight="bold">C</text>

        {/* Side Lengths */}
        <text
          x={(vertices.A.x + vertices.B.x) / 2}
          y={(vertices.A.y + vertices.B.y) / 2 - 5}
          fontSize="7"
          textAnchor="middle"
          fill="black"
        >
          AB: {(triangleData.ab / PIXELS_PER_CM).toFixed(1)} cm
        </text>
        <text
          x={(vertices.B.x + vertices.C.x) / 2}
          y={(vertices.B.y + vertices.C.y) / 2 + 8}
          fontSize="7"
          textAnchor="middle"
          fill="black"
        >
          BC: {(triangleData.bc / PIXELS_PER_CM).toFixed(1)} cm
        </text>
        <text
          x={(vertices.C.x + vertices.A.x) / 2}
          y={(vertices.C.y + vertices.A.y) / 2 - 5}
          fontSize="7"
          textAnchor="middle"
          fill="black"
        >
          CA: {(triangleData.ca / PIXELS_PER_CM).toFixed(1)} cm
        </text>

        {/* Angle Measures */}
        {showInteriorAngles && (
          <>
            <text
              x={vertices.A.x + (vertices.B.x - vertices.A.x) * 0.1 + (vertices.C.x - vertices.A.x) * 0.1}
              y={vertices.A.y + (vertices.B.y - vertices.A.y) * 0.1 + (vertices.C.y - vertices.A.y) * 0.1}
              fontSize="7"
              fill="purple"
              textAnchor="middle"
            >
              A: {triangleData.angleA.toFixed(1)}°
            </text>
            <text
              x={vertices.B.x + (vertices.A.x - vertices.B.x) * 0.1 + (vertices.C.x - vertices.B.x) * 0.1}
              y={vertices.B.y + (vertices.A.y - vertices.B.y) * 0.1 + (vertices.C.y - vertices.B.y) * 0.1}
              fontSize="7"
              fill="purple"
              textAnchor="middle"
            >
              B: {triangleData.angleB.toFixed(1)}°
            </text>
            <text
              x={vertices.C.x + (vertices.A.x - vertices.C.x) * 0.1 + (vertices.B.x - vertices.C.x) * 0.1}
              y={vertices.C.y + (vertices.A.y - vertices.C.y) * 0.1 + (vertices.B.y - vertices.C.y) * 0.1}
              fontSize="7"
              fill="purple"
              textAnchor="middle"
            >
              C: {triangleData.angleC.toFixed(1)}°
            </text>
          </>
        )}

        {/* Angle Sum */}
        {showInteriorAngles && (
          <text x={SVG_VIEWBOX_SIZE / 2} y={SVG_VIEWBOX_SIZE - 5} fontSize="7" textAnchor="middle" fill="darkblue">
            Sum: {(triangleData.angleA + triangleData.angleB + triangleData.angleC).toFixed(1)}°
          </text>
        )}

        {/* Area and Perimeter */}
        {showAreaPerimeter && (
          <>
            <text x={SVG_VIEWBOX_SIZE / 2} y={SVG_VIEWBOX_SIZE - 20} fontSize="7" textAnchor="middle" fill="darkgreen">
              Area: {(triangleData.area / (PIXELS_PER_CM * PIXELS_PER_CM)).toFixed(2)} cm²
            </text>
            <text x={SVG_VIEWBOX_SIZE / 2} y={SVG_VIEWBOX_SIZE - 10} fontSize="7" textAnchor="middle" fill="darkorange">
              Perimeter: {(triangleData.perimeter / PIXELS_PER_CM).toFixed(1)} cm
            </text>
          </>
        )}

        {/* Pythagorean Theorem (conditional) */}
        {showPythagoreanTheorem && isRightTriangle && (
          <text x={SVG_VIEWBOX_SIZE / 2} y={15} fontSize="7" textAnchor="middle" fill="red" fontWeight="bold">
            a² + b² = c² (Right Triangle)
          </text>
        )}
        {showPythagoreanTheorem && !isRightTriangle && (
          <text x={SVG_VIEWBOX_SIZE / 2} y={15} fontSize="7" textAnchor="middle" fill="gray">
            (Not a Right Triangle)
          </text>
        )}
        {/* Legs and Hypotenuse (for Pythagorean theorem example) */}
        {showPythagoreanTheorem && isRightTriangle && showLegsAndHypotenuse && (
        // hypotenuse and legs b and c show its names 
          <>
            <text x={(vertices.A.x + vertices.B.x) / 2 -13} y={(vertices.A.y + vertices.B.y) / 2 - 15} fontSize="7" textAnchor="middle" fill="black">
              Leg
            </text>
            <text x={(vertices.B.x + vertices.C.x) / 2 - 13} y={(vertices.B.y + vertices.C.y) / 2 + 20} fontSize="7" textAnchor="middle" fill="black">
              Leg
            </text>
            <text x={(vertices.C.x + vertices.A.x) / 2 + 13} y={(vertices.C.y + vertices.A.y) / 2 - 10} fontSize="7" textAnchor="middle" fill="black">
              Hypotenuse 
            </text>
          </>
        )}

      </svg>
    </div>
  );
};


const App = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-inter">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Interactive Triangle Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <TriangleVisualizer
          initialVertices={{ A: { x: 100, y: 50 }, B: { x: 50, y: 150 }, C: { x: 150, y: 150 } }}
          title="Medians"
          description="A median joins a vertex to the midpoint of the opposite side. The three medians intersect at the centroid."
          showMedians={true}
          showCentroid={true}
          showAreaPerimeter={true}
        />
        <TriangleVisualizer
          initialVertices={{ A: { x: 100, y: 50 }, B: { x: 50, y: 150 }, C: { x: 150, y: 150 } }}
          title="Altitudes"
          description="An altitude is a perpendicular segment from a vertex to the line containing the opposite side."
          showAltitudes={true}
          showAreaPerimeter={true}
        />
        <TriangleVisualizer
          initialVertices={{ A: { x: 100, y: 50 }, B: { x: 50, y: 150 }, C: { x: 150, y: 150 } }}
          title="Exterior Angles"
          description="An exterior angle is formed by one side and the extension of an adjacent side."
          showExteriorAngles={true}
          showInteriorAngles={true}
        />
        <TriangleVisualizer
          initialVertices={{ A: { x: 100, y: 50 }, B: { x: 50, y: 150 }, C: { x: 150, y: 150 } }}
          title="Angle Bisectors"
          description="An angle bisector divides one of the triangle's angles into two equal angles."
          showAngleBisectors={true}
        />
        <TriangleVisualizer
          initialVertices={{ A: { x: 100, y: 50 }, B: { x: 50, y: 150 }, C: { x: 150, y: 150 } }}
          title="Interior Angle Sum"
          description="The sum of the interior angles of any triangle is always 180 degrees."
          showInteriorAngles={true}
        />
        <TriangleVisualizer

          initialVertices={{ A: { x: 100, y: 50 }, B: { x: 100, y: 150 }, C: { x: 200, y: 150 } }}
          title="Pythagorean Theorem"
          description="In a right triangle, a² + b² = c². Drag vertices to form a right triangle."
          showInteriorAngles={true}
          showPythagoreanTheorem={true}
          // show of legs and hypotenuse 

          showLegsAndHypotenuse={true}


        />
      </div>
      {/* Premium Educational Resources Section */}
      <div className="mt-12 w-full max-w-4xl bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Educational Resources</h2>
        <p className="text-gray-600 text-center mb-8 max-w-xl mx-auto">
          Deepen your understanding of triangle properties, theorems, and formulas with these interactive tools and tutorials.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Interactive Sandboxes */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white mb-4 shadow-md">
                <FontAwesomeIcon icon={faCompass} className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Interactive Visuals</h3>
              <p className="text-sm text-gray-600 mb-4">
                Explore real-time simulations and coordinate geometry visualizers.
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://www.geogebra.org/math/triangles#upper-elementary" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                    GeoGebra Triangle Sandbox
                  </a>
                </li>
                <li>
                  <a href="https://www.desmos.com/calculator/triangle-properties" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Desmos Triangle Visualizer
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Theory & Guides */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white mb-4 shadow-md">
                <FontAwesomeIcon icon={faBook} className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Detailed Theory</h3>
              <p className="text-sm text-gray-600 mb-4">
                Read explanations about properties, types of triangles, and rules.
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://www.mathsisfun.com/triangle.html" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800 hover:underline">
                    Math is Fun: Properties
                  </a>
                </li>
                <li>
                  <a href="https://www.cuemath.com/geometry/properties-of-a-triangle/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800 hover:underline">
                    Cuemath: Formula Guide
                  </a>
                </li>
                <li>
                  <a href="https://www.mathopenref.com/triangle.html" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800 hover:underline">
                    Math Open Reference
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Practice & Quizzes */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white mb-4 shadow-md">
                <FontAwesomeIcon icon={faGraduationCap} className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Practice & Tests</h3>
              <p className="text-sm text-gray-600 mb-4">
                Test your knowledge with exercises, interactive quizzes, and videos.
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://www.khanacademy.org/math/geometry-home/triangles" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 hover:underline">
                    Khan Academy: Triangles
                  </a>
                </li>
                <li>
                  <a href="https://www.khanacademy.org/math/geometry-home/triangles/triangle-properties/v/triangle-median-altitude-and-centroid" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 hover:underline">
                    Khan: Medians & Centroids
                  </a>
                </li>
                <li>
                  <a href="https://www.mathsisfun.com/pythagoras.html" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 hover:underline">
                    Pythagorean Theorem Quiz
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

