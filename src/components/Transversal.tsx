// add parrallel lines to the angle visualization and transversal lines to the angle visualization for leaning concepts of transversal lines and angles formed by parallel lines and transversal lines 
// corresponding angles, alternate interior angles, alternate exterior angles, same side interior angles, and same side exterior angles

import { animated } from 'react-spring';
import React, { useState } from 'react';
import { useDrag } from 'react-use-gesture';
import useMeasure from 'react-use-measure';
import { Point } from '../types';

// Helper for angle text midpoint
function getAngleTextMidpoint(start: Point, end: Point): Point {
    return {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2
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
            <svg className="absolute top-0 left-0" width={400} height={500}>
                {/* Parallel Lines */}
                <line x1={line1Start.x} y1={line1Start.y} x2={line1End.x} y2={line1End.y} stroke="blue" strokeWidth="2" />
                <line x1={line2Start.x} y1={line2Start.y} x2={line2End.x} y2={line2End.y} stroke="blue" strokeWidth="2" />

                {/* Transversal Line */}
                <line x1={transversalStart.x} y1={transversalStart.y} x2={transversalEnd.x} y2={transversalEnd.y} stroke="red" strokeWidth="2" />

                {/* Angles formed by transversal and parallel lines */}
                <text x={getAngleTextMidpoint(line1Start, transversalStart).x}
                    y={getAngleTextMidpoint(line1Start, transversalStart).y}
                    fill="black" fontSize="16" textAnchor="middle">
                    ∠
                </text>
                <text x={getAngleTextMidpoint(line2Start, transversalEnd).x}
                    y={getAngleTextMidpoint(line2Start, transversalEnd).y}
                    fill="black" fontSize="16" textAnchor="middle">
                    ∠
                </text>
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