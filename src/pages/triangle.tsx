import React, { useState, useEffect, useCallback } from 'react';

// Define a scaling factor for converting pixels to 'cm' for display purposes
const PIXELS_PER_CM = 10; // 10 pixels = 1 cm

// Define types for point coordinates
interface Point {
  x: number;
  y: number;
}

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

// Define type for vertex keys
type VertexKey = 'A' | 'B' | 'C';

const App = () => {
  // State for the coordinates of the three vertices (A, B, C)
  const [vertices, setVertices] = useState<{ A: Point; B: Point; C: Point }>({
    A: { x: 100, y: 50 },
    B: { x: 50, y: 150 },
    C: { x: 150, y: 150 },
  });

  // State to track which vertex is currently being dragged
  const [draggingVertex, setDraggingVertex] = useState<VertexKey | null>(null);

  // State to track the last vertex that was dragged/selected for arrow movements
  const [selectedVertex, setSelectedVertex] = useState<VertexKey>('A'); // Default to A

  // State for side lengths and angles
  const [triangleData, setTriangleData] = useState({
    ab: 0, bc: 0, ca: 0,
    angleA: 0, angleB: 0, angleC: 0,
  });

  // Calculate triangle data whenever vertices change
  useEffect(() => {
    const { A, B, C } = vertices;

    // Calculate side lengths
    const ab = calculateDistance(A, B);
    const bc = calculateDistance(B, C);
    const ca = calculateDistance(C, A);

    // Calculate angles using Law of Cosines
    const angleA = calculateAngle(ca, ab, bc); // Angle at A, opposite side BC
    const angleB = calculateAngle(ab, bc, ca); // Angle at B, opposite side CA
    const angleC = calculateAngle(bc, ca, ab); // Angle at C, opposite side AB

    setTriangleData({ ab, bc, ca, angleA, angleB, angleC });
  }, [vertices]);

  // Event handler for when a mouse button is pressed down on a vertex
  const handleMouseDown = useCallback((vertexKey: VertexKey) => () => {
    setDraggingVertex(vertexKey);
    setSelectedVertex(vertexKey); // Set this vertex as the selected one for arrow controls
  }, []);

  // Event handler for when the mouse moves (while a vertex is being dragged)
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingVertex) {
      // Get the SVG element to calculate coordinates relative to it
      const svg = e.currentTarget;
      const svgRect = svg.getBoundingClientRect();

      // Calculate new coordinates relative to the SVG's top-left corner
      let newX = e.clientX - svgRect.left;
      let newY = e.clientY - svgRect.top;

      // Clamp coordinates within the SVG viewBox (0 to 200 for both x and y)
      // The viewBox is 0 0 200 200, so we constrain to this range.
      newX = Math.max(0, Math.min(200, newX));
      newY = Math.max(0, Math.min(200, newY));

      // Update the state of the dragged vertex
      setVertices((prevVertices) => ({
        ...prevVertices,
        [draggingVertex]: { x: newX, y: newY },
      }));
    }
  }, [draggingVertex]);

  // Event handler for when the mouse button is released
  const handleMouseUp = useCallback(() => {
    setDraggingVertex(null); // Stop dragging
  }, []);

  // Function to move the selected vertex by a delta
  const moveSelectedVertex = useCallback((dx: number, dy: number) => {
    if (selectedVertex) {
      setVertices((prevVertices) => {
        const currentPos = prevVertices[selectedVertex];
        let newX = currentPos.x + dx;
        let newY = currentPos.y + dy;

        // Clamp coordinates within the SVG viewBox (0 to 200)
        newX = Math.max(0, Math.min(200, newX));
        newY = Math.max(0, Math.min(200, newY));

        return {
          ...prevVertices,
          [selectedVertex]: { x: newX, y: newY },
        };
      });
    }
  }, [selectedVertex]);

  // Calculate midpoints dynamically
  const midpointAB = calculateMidpoint(vertices.A, vertices.B);
  const midpointBC = calculateMidpoint(vertices.B, vertices.C);
  const midpointCA = calculateMidpoint(vertices.C, vertices.A);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-inter"
    >
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Triangle Medians</h1>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 w-full max-w-lg">
        <p className="text-gray-700 mb-4 text-center">
          A median of a triangle is a line segment joining a vertex to the midpoint of the opposite side.
          Drag the red, blue, and green vertices to reshape the triangle.
          Use the arrow buttons to precisely move the <span className="font-semibold text-blue-600">{selectedVertex}</span> vertex.
        </p>

        <svg
          width="100%"
          height="300"
          viewBox="0 0 200 200" // Maintain a consistent coordinate system
          className="bg-white border border-gray-300 rounded-lg shadow-inner"
          onMouseMove={handleMouseMove} // Mouse move listener on the SVG
          onMouseUp={handleMouseUp}     // Mouse up listener on the SVG
          onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves the SVG area
        >
          {/* Reset Button */}
          <g
            className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={() => {
              setVertices({
                A: { x: 100, y: 50 },
                B: { x: 50, y: 150 },
                C: { x: 150, y: 150 },
              });
              setSelectedVertex('A'); // Reset selected vertex too
            }}
          >
            <rect x="10" y="10" width="35" height="15" fill="#e0e0e0" rx="4" ry="4" />
            <text x="27.5" y="20" fontSize="8" textAnchor="middle" fill="black" fontWeight="bold">Reset</text>
          </g>

          {/* Directional Arrow Controls */}
          {/* Group for arrows to easily position them */}
          <g transform="translate(160, 20)"> {/* Position the arrow group */}
            <rect x="-25" y="-25" width="50" height="50" fill="#f0f0f0" rx="8" ry="8" stroke="#ccc" strokeWidth="1" /> {/* Background for arrows */}

            {/* Up Arrow */}
            <path d="M0 -15 L-5 -5 L5 -5 Z" fill="black" className="cursor-pointer hover:fill-gray-600 active:fill-gray-800"
              onClick={() => moveSelectedVertex(0, -5)} />
            {/* Down Arrow */}
            <path d="M0 15 L-5 5 L5 5 Z" fill="black" className="cursor-pointer hover:fill-gray-600 active:fill-gray-800"
              onClick={() => moveSelectedVertex(0, 5)} />
            {/* Left Arrow */}
            <path d="M-15 0 L-5 -5 L-5 5 Z" fill="black" className="cursor-pointer hover:fill-gray-600 active:fill-gray-800"
              onClick={() => moveSelectedVertex(-5, 0)} />
            {/* Right Arrow */}
            <path d="M15 0 L5 -5 L5 5 Z" fill="black" className="cursor-pointer hover:fill-gray-600 active:fill-gray-800"
              onClick={() => moveSelectedVertex(5, 0)} />
          </g>


          {/* Triangle Sides */}
          <line x1={vertices.A.x} y1={vertices.A.y} x2={vertices.B.x} y2={vertices.B.y} stroke="black" strokeWidth="2" />
          <line x1={vertices.B.x} y1={vertices.B.y} x2={vertices.C.x} y2={vertices.C.y} stroke="black" strokeWidth="2" />
          <line x1={vertices.C.x} y1={vertices.C.y} x2={vertices.A.x} y2={vertices.A.y} stroke="black" strokeWidth="2" />

          {/* Medians */}
          {/* Median from A to midpoint of BC */}
          <line x1={vertices.A.x} y1={vertices.A.y} x2={midpointBC.x} y2={midpointBC.y} stroke="purple" strokeWidth="1" strokeDasharray="4 2" />
          {/* Median from B to midpoint of CA */}
          <line x1={vertices.B.x} y1={vertices.B.y} x2={midpointCA.x} y2={midpointCA.y} stroke="orange" strokeWidth="1" strokeDasharray="4 2" />
          {/* Median from C to midpoint of AB */}
          <line x1={vertices.C.x} y1={vertices.C.y} x2={midpointAB.x} y2={midpointAB.y} stroke="teal" strokeWidth="1" strokeDasharray="4 2" />

          {/* Vertices (draggable circles) */}
          <circle
            cx={vertices.A.x}
            cy={vertices.A.y}
            r="6"
            fill="red"
            className={`cursor-grab active:cursor-grabbing ${selectedVertex === 'A' ? 'stroke-blue-500 stroke-2' : ''}`}
            onMouseDown={handleMouseDown('A')}
          />
          <circle
            cx={vertices.B.x}
            cy={vertices.B.y}
            r="6"
            fill="blue"
            className={`cursor-grab active:cursor-grabbing ${selectedVertex === 'B' ? 'stroke-blue-500 stroke-2' : ''}`}
            onMouseDown={handleMouseDown('B')}
          />
          <circle
            cx={vertices.C.x}
            cy={vertices.C.y}
            r="6"
            fill="green"
            className={`cursor-grab active:cursor-grabbing ${selectedVertex === 'C' ? 'stroke-blue-500 stroke-2' : ''}`}
            onMouseDown={handleMouseDown('C')}
          />

          {/* Midpoints (small circles) */}
          <circle cx={midpointAB.x} cy={midpointAB.y} r="3" fill="gray" />
          <circle cx={midpointBC.x} cy={midpointBC.y} r="3" fill="gray" />
          <circle cx={midpointCA.x} cy={midpointCA.y} r="3" fill="gray" />

          {/* Vertex Labels */}
          <text x={vertices.A.x} y={vertices.A.y - 10} fontSize="10" textAnchor="middle" fill="red" fontWeight="bold">A</text>
          <text x={vertices.B.x - 10} y={vertices.B.y + 5} fontSize="10" textAnchor="end" fill="blue" fontWeight="bold">B</text>
          <text x={vertices.C.x + 10} y={vertices.C.y + 5} fontSize="10" textAnchor="start" fill="green" fontWeight="bold">C</text>

          {/* Side Lengths */}
          <text
            x={(vertices.A.x + vertices.B.x) / 2}
            y={(vertices.A.y + vertices.B.y) / 2 - 5}
            fontSize="8"
            textAnchor="middle"
            fill="black"
          >
            AB: { (triangleData.ab / PIXELS_PER_CM).toFixed(1) } cm
          </text>
          <text
            x={(vertices.B.x + vertices.C.x) / 2}
            y={(vertices.B.y + vertices.C.y) / 2 + 10}
            fontSize="8"
            textAnchor="middle"
            fill="black"
          >
            BC: { (triangleData.bc / PIXELS_PER_CM).toFixed(1) } cm
          </text>
          <text
            x={(vertices.C.x + vertices.A.x) / 2}
            y={(vertices.C.y + vertices.A.y) / 2 - 5}
            fontSize="8"
            textAnchor="middle"
            fill="black"
          >
            CA: { (triangleData.ca / PIXELS_PER_CM).toFixed(1) } cm
          </text>

          {/* Angle Measures */}
          {/* Position angle text slightly away from the vertex */}
          <text
            x={vertices.A.x + (vertices.B.x - vertices.A.x) * 0.1 + (vertices.C.x - vertices.A.x) * 0.1}
            y={vertices.A.y + (vertices.B.y - vertices.A.y) * 0.1 + (vertices.C.y - vertices.A.y) * 0.1}
            fontSize="8"
            fill="purple"
            textAnchor="middle"
          >
            A: {triangleData.angleA.toFixed(1)}°
          </text>
          <text
            x={vertices.B.x + (vertices.A.x - vertices.B.x) * 0.1 + (vertices.C.x - vertices.B.x) * 0.1}
            y={vertices.B.y + (vertices.A.y - vertices.B.y) * 0.1 + (vertices.C.y - vertices.B.y) * 0.1}
            fontSize="8"
            fill="purple"
            textAnchor="middle"
          >
            B: {triangleData.angleB.toFixed(1)}°
          </text>
          <text
            x={vertices.C.x + (vertices.A.x - vertices.C.x) * 0.1 + (vertices.B.x - vertices.C.x) * 0.1}
            y={vertices.C.y + (vertices.A.y - vertices.C.y) * 0.1 + (vertices.B.y - vertices.C.y) * 0.1}
            fontSize="8"
            fill="purple"
            textAnchor="middle"
          >
            C: {triangleData.angleC.toFixed(1)}°
          </text>

        </svg>
      </div>
    </div>
  );
};

export default App;


//           <li>Altitudes: An altitude of a triangle is a perpendicular segment from a vertex to the line containing the opposite side.</li>
//           <li>Centroids: The centroid of a triangle is the point where the three medians intersect, and it is also the center of mass of the triangle.</li>
//           <li>Exterior Angles: An exterior angle of a triangle is formed by one side of the triangle and the extension of the adjacent side.</li>
//           <li>Interior Angles: The angles inside a triangle, which always sum to 180 degrees.</li>
//           <li>Angle Sum: The sum of the interior angles of a triangle is always 180 degrees.</li>
//           <li>Angle Bisectors: An angle bisector of a triangle is a line segment that bisects one of the triangle&apos;s angles, dividing it into two equal angles.</li>
//           <li>Pythagorean Theorem: In a right triangle, the square of the length of the hypotenuse is equal to the sum of the squares of the lengths of the other two sides (a² + b² = c²).</li>
//           <li>Area: The area of a triangle can be calculated using the formula A = 1/2 * base * height.</li>
//           <li>Perimeter: The perimeter of a triangle is the sum of the lengths of its three sides.</li>
//         </ul>
//         <p>For more detailed explanations and examples, please refer to the relevant sections in the documentation or educational resources.</p>
//         <p>Feel free to explore the properties of triangles and their applications in various mathematical contexts.</p>
//         <p>Happy learning!</p>
//         <p>For more information, visit the <a href="https://www.mathsisfun.com/geometry" target="_blank" rel="noopener noreferrer">Math is Fun - Triangles</a> page.</p>
//         <p>For interactive examples and visualizations, check out the <a href="https://www.geogebra.org/math/triangles#upper-elementary" target="_blank" rel="noopener noreferrer">GeoGebra Triangle Resources</a>.</p>
//         <p>For practice problems and quizzes, visit the <a href="https://www.khanacademy.org/math/geometry-home/triangles" target="_blank" rel="noopener noreferrer">Khan Academy - Triangles</a> page.</p>
//         <p>For a comprehensive guide on triangle properties, refer to the <a href="https://www.cuemath.com/geometry/" target="_blank" rel="noopener noreferrer">Cuemath - Triangle Properties</a> page.</p>
//         <p>For more resources and interactive tools, check out the <a href="https://www.mathopenref.com/" target="_blank" rel="noopener noreferrer">Math Open Reference - Triangle Properties</a> page.</p>
//         <p>For a visual representation of triangle properties, visit the <a href="https://www.desmos.com/calculator/triangle-properties" target="_blank" rel="noopener noreferrer">Desmos Triangle Properties</a> page.</p>
//         <p>For a comprehensive overview of triangle properties, refer to the <a href="https://www.mathsisfun.com/geometry/triangle-properties.html" target="_blank" rel="noopener noreferrer">Math is Fun - Triangle Properties</a> page.</p>
//         <p>For a detailed explanation of triangle medians, altitudes, and centroids, visit the <a href="https://www.khanacademy.org/math/geometry-home/triangles/triangle-properties/v/triangle-median-altitude-and-centroid" target="_blank" rel="noopener noreferrer">Khan Academy - Triangle Medians, Altitudes, and Centroids</a> page.</p>
//         <p>For a comprehensive guide on triangle properties, refer to the <a href="https://www.cuemath.com/geometry/triangle-properties/" target="_blank" rel="noopener noreferrer">Cuemath - Triangle Properties</a> page.</p>
//         <p>For a detailed explanation of triangle properties, visit the <a href="https://www.mathsisfun.com/geometry/triangle-properties.html" target="_blank" rel="noopener noreferrer">Math is Fun - Triangle Properties</a> page.</p>
//         <p>For interactive examples and visualizations, check out the <a href="https://www.geogebra.org/m/xy3x5v7c" target="_blank" rel="noopener noreferrer">GeoGebra Triangle Resources</a>.</p>
//         <p>For practice problems and quizzes, visit the <a href="https://www.khanacademy.org/math/geometry-home/triangles" target="_blank" rel="noopener noreferrer">Khan Academy - Triangles</a> page.</p>
//         <p>For a comprehensive guide on triangle properties, refer to the <a href="https://www.cuemath.com/geometry/triangle-properties/" target="_blank" rel="noopener noreferrer">Cuemath - Triangle Properties</a> page.</p>
//         <p>For a detailed explanation of the Pythagorean theorem, visit the <a href="https://www.pythagorean-theorem.net/" target="_blank" rel="
// noopener noreferrer">Pythagorean Theorem</a> page.</p>
//    </>
