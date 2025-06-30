// add parrallel lines to the angle visualization and transversal lines to the angle visualization for leaning concepts of transversal lines and angles formed by parallel lines and transversal lines 
// corresponding angles, alternate interior angles, alternate exterior angles, same side interior angles, and same side exterior angles

import { animated } from 'react-spring';
import React, { useState } from 'react';
import { useDrag } from 'react-use-gesture';
import useMeasure from 'react-use-measure';
import { Point } from '../types';
import { getArcPath } from '@/utils';

// Helper for angle text midpoint
function getAngleTextMidpoint(center: Point, start: Point, end: Point, radius: number) {
    const startAngle = Math.atan2(start.y - center.y, start.x - center.x);
    const endAngle = Math.atan2(end.y - center.y, end.x - center.x);
    let midAngle = (startAngle + endAngle) / 2;
    // If the arc is > 180°, bisector is on the other side
    if (Math.abs(endAngle - startAngle) > Math.PI) {
        midAngle += Math.PI;
    }
    return {
        x: center.x + radius * Math.cos(midAngle),
        y: center.y + radius * Math.sin(midAngle),
    };
}

function DraggablePoint({ point, onDrag }: { point: Point; onDrag: (point: Point) => void }) {
    const bind = useDrag((state) => {
        onDrag({ x: state.offset[0], y: state.offset[1] });
    }, {
        from: [point.x, point.y]
    });

    return (
        <animated.div
            {...bind()}
            style={{
                position: "absolute",
                left: point.x - 5,
                top: point.y - 5,
                width: "10px",
                height: "10px",
                backgroundColor: "red",
                borderRadius: "50%",
                cursor: "grab",
            }}
        />
    );
}

export default function Transversal() {
    const [ref] = useMeasure();

    // Use fixed initial values for a consistent display at the top of the div
    const initial = {
        line1Start: { x: 80, y: 80 },
        line1End: { x: 320, y: 80 },
        line2Start: { x: 80, y: 200 },
        line2End: { x: 320, y: 200 },
        transversalStart: { x: 120, y: 40 },
        transversalEnd: { x: 280, y: 240 }
    };

    const [line1Start, setLine1Start] = useState<Point>(initial.line1Start);
    const [line1End, setLine1End] = useState<Point>(initial.line1End);
    const [line2Start, setLine2Start] = useState<Point>(initial.line2Start);
    const [line2End, setLine2End] = useState<Point>(initial.line2End);
    const [transversalStart, setTransversalStart] = useState<Point>(initial.transversalStart);
    const [transversalEnd, setTransversalEnd] = useState<Point>(initial.transversalEnd);

    return (
        <div ref={ref} className="border-2 border-solid border-gray-300 relative w-full h-[320px] overflow-scroll">
            <div className="absolute top-0 left-0 flex items-center justify-center z-10 w-full">
                <h2>Transversal Lines and Angles Visualization</h2>
            </div>
            <svg className="absolute top-0 left-0" width={800} height={500}>
                {/* Parallel Lines */}
                <line x1={line1Start.x} y1={line1Start.y} x2={line1End.x} y2={line1End.y} stroke="blue" strokeWidth="2" />
                <line x1={line2Start.x} y1={line2Start.y} x2={line2End.x} y2={line2End.y} stroke="blue" strokeWidth="2" />
                {/* Transversal Line */}
                <line x1={transversalStart.x} y1={transversalStart.y} x2={transversalEnd.x} y2={transversalEnd.y} stroke="red" strokeWidth="2" />

                {/* Calculate and display all 8 angles (4 at each intersection) */}
                {(() => {
                    function getAngleRad(A: Point, B: Point, C: Point) {
                        const ab = Math.atan2(A.y - B.y, A.x - B.x);
                        const cb = Math.atan2(C.y - B.y, C.x - B.x);
                        let diff = cb - ab;
                        if (diff < 0) diff += 2 * Math.PI;
                        if (diff > Math.PI) diff = 2 * Math.PI - diff; // always the smaller angle
                        return diff;
                    }
                    function getIntersection(p1: Point, p2: Point, p3: Point, p4: Point): Point | null {
                        const a1 = p2.y - p1.y;
                        const b1 = p1.x - p2.x;
                        const c1 = a1 * p1.x + b1 * p1.y;
                        const a2 = p4.y - p3.y;
                        const b2 = p3.x - p4.x;
                        const c2 = a2 * p3.x + b2 * p3.y;
                        const det = a1 * b2 - a2 * b1;
                        if (det === 0) return null;
                        const x = (b2 * c1 - b1 * c2) / det;
                        const y = (a1 * c2 - a2 * c1) / det;
                        return { x, y };
                    }
                    const P = getIntersection(line1Start, line1End, transversalStart, transversalEnd);
                    const Q = getIntersection(line2Start, line2End, transversalStart, transversalEnd);
                    if (!P || !Q) return null;

                    // Each intersection: four angles (show arc and label for each)
                    const angleData = [
                        // At P (top)
                        { A: transversalStart, B: P, C: line1Start, color: "orange" },
                        { A: line1End, B: P, C: transversalStart, color: "orange" },
                        { A: transversalEnd, B: P, C: line1End, color: "orange" },
                        { A: line1Start, B: P, C: transversalEnd, color: "orange" },
                        // At Q (bottom)
                        { A: transversalStart, B: Q, C: line2Start, color: "purple" },
                        { A: line2End, B: Q, C: transversalStart, color: "purple" },
                        { A: transversalEnd, B: Q, C: line2End, color: "purple" },
                        { A: line2Start, B: Q, C: transversalEnd, color: "purple" },
                    ];

                    return angleData.map(({ A, B, C, color }, idx) => {
                        const angleRad = getAngleRad(A, B, C);
                        const angleDeg = (angleRad * 180) / Math.PI;
                        const arcRadius = 32;
                        const arcPath = getArcPath(B, A, C, arcRadius, angleRad > Math.PI, true);
                        const mid = getAngleTextMidpoint(B, A, C, arcRadius + 14);

                        return (
                            <g key={idx}>
                                <path d={arcPath} fill="none" stroke={color} strokeWidth="2" />
                                <text
                                    x={mid.x}
                                    y={mid.y}
                                    fontSize="15"
                                    fill={color}
                                    textAnchor="middle"
                                    fontWeight="bold"
                                    alignmentBaseline="middle"
                                >
                                    {angleDeg.toFixed(1)}°
                                </text>
                            </g>
                        );
                    });
                })()}
            </svg>
            {/* Draggable Points for Parallel Lines */}
            <DraggablePoint point={line1Start} onDrag={setLine1Start} />
            <DraggablePoint point={line1End} onDrag={setLine1End} />
            <DraggablePoint point={line2Start} onDrag={setLine2Start} />
            <DraggablePoint point={line2End} onDrag={setLine2End} />
            {/* Draggable Points for Transversal Line */}
            <DraggablePoint point={transversalStart} onDrag={setTransversalStart} />
            <DraggablePoint point={transversalEnd} onDrag={setTransversalEnd} />
        </div>
    );
}