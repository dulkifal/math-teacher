// add parrallel lines to the angle visualization and transversal lines to the angle visualization for leaning concepts of transversal lines and angles formed by parallel lines and transversal lines 
// corresponding angles, alternate interior angles, alternate exterior angles, same side interior angles, and same side exterior angles

import { animated } from 'react-spring';
import React, { useState } from 'react';
import { useDrag } from 'react-use-gesture';
import useMeasure from 'react-use-measure';
import { useWindowSize } from 'react-use';
import { Point} from '../types';  
// import {DraggablePoint} from './DraggablePoint'; 

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
    const [ref,] = useMeasure();
    const { width, height } = useWindowSize();
    const center = { x: width / 2, y: height / 2 };
    const radius = 150; // Radius of the circle

    // Points for parallel lines
    const [line1Start, setLine1Start] = useState<Point>({ x: center.x - radius, y: center.y - 50 });
    const [line1End, setLine1End] = useState<Point>({ x: center.x + radius, y: center.y - 50 });
    const [line2Start, setLine2Start] = useState<Point>({ x: center.x - radius, y: center.y + 50 });
    const [line2End, setLine2End] = useState<Point>({ x: center.x + radius, y: center.y + 50 });

    // Points for transversal line
    const [transversalStart, setTransversalStart] = useState<Point>({ x: center.x - radius / 2, y: center.y - 100 });
    const [transversalEnd, setTransversalEnd] = useState<Point>({ x: center.x + radius / 2, y: center.y + 100 });

    // Drag handlers for parallel lines
    const bindLine1Start = useDrag((state) => setLine1Start({ x: state.offset[0], y: state.offset[1] }), {
        from: [line1Start.x, line1Start.y]
    });
    const bindLine1End = useDrag((state) => setLine1End({ x: state.offset[0], y: state.offset[1] }), {
        from: [line1End.x, line1End.y]
    });
    const bindLine2Start = useDrag((state) => setLine2Start({ x: state.offset[0], y: state.offset[1] }), {
        from: [line2Start.x, line2Start.y]
    });
    const bindLine2End = useDrag((state) => setLine2End({ x: state.offset[0], y: state.offset[1] }), {
        from: [line2End.x, line2End.y]
    });

    // Drag handlers for transversal line
    const bindTransversalStart = useDrag((state) => setTransversalStart({ x: state.offset[0], y: state.offset[1] }), {
        from: [transversalStart.x, transversalStart.y]
    });
    const bindTransversalEnd = useDrag((state) => setTransversalEnd({ x: state.offset[0], y: state.offset[1] }), {
        from: [transversalEnd.x, transversalEnd.y]
    });

    return (    
        <div ref={ref} className="relative ">
            <div className="absolute top-0 left-0 flex items-center justify-center z-10">
                <h2>Transversal Lines and Angles Visualization</h2>
            </div>
            <svg width={1440} height={756} className="absolute top-0 left-0">
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

                {/* Draggable Points for Parallel Lines */}
                <DraggablePoint point={line1Start} onDrag={bindLine1Start} />
                <DraggablePoint point={line1End} onDrag={bindLine1End} />
                <DraggablePoint point={line2Start} onDrag={bindLine2Start} />
                <DraggablePoint point={line2End} onDrag={bindLine2End} />

                {/* Draggable Points for Transversal Line */}
                <DraggablePoint point={transversalStart} onDrag={bindTransversalStart} />
                <DraggablePoint point={transversalEnd} onDrag={bindTransversalEnd} />
            </svg>
        </div>
    );
}