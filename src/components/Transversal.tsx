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
        transversalStart: { x: 150, y: 10 },
        transversalEnd: { x: 300, y: 280 }
    };

    // State for all points
    const [line1Start, setLine1Start] = useState<Point>(initial.line1Start);
    const [line1End, setLine1End] = useState<Point>(initial.line1End);
    const [line2Start, setLine2Start] = useState<Point>(initial.line2Start);
    const [line2End, setLine2End] = useState<Point>(initial.line2End);
    const [transversalStart, setTransversalStart] = useState<Point>(initial.transversalStart);
    const [transversalEnd, setTransversalEnd] = useState<Point>(initial.transversalEnd);

    // Highlight state for corresponding/alternate angles
    const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
    const [highlightType, setHighlightType] = useState<'corresponding' | 'alternateInterior' | 'alternateExterior' | 'sameSideInterior' | null>(null);

    // Angle pairs
    const correspondingPairs = [
        [0, 4], // angle 1 and 5
        [1, 5], // angle 2 and 6
        [2, 6], // angle 3 and 7
        [3, 7], // angle 4 and 8
    ];
    const alternateInteriorPairs = [
        [2, 4], // angle 2 and 7
        [3, 5], // angle 3 and 6
    ];
    const alternateExteriorPairs = [
        [0, 6], // angle 1 and 2
        [1, 7], // angle 3 and 4
    ];
    const sameSideInteriorPairs = [
        [2, 5], // angle 2 and 6
        [3, 4], // angle 3 and 7
    ];

    // Reset handler
    const handleReset = () => {
        setLine1Start(initial.line1Start);
        setLine1End(initial.line1End);
        setLine2Start(initial.line2Start);
        setLine2End(initial.line2End);
        setTransversalStart(initial.transversalStart);
        setTransversalEnd(initial.transversalEnd);
    };

    // Handler for "Corresponding" button
    const handleCorresponding = async () => {
        setHighlightType('corresponding');
        for (let i = 0; i < correspondingPairs.length; i++) {
            setHighlightIdx(i);
            await new Promise(res => setTimeout(res, 3000));
        }
        setHighlightIdx(null);
        setHighlightType(null);
    };

    // Handler for "Alternate Interior" button
    const handleAlternateInterior = async () => {
        setHighlightType('alternateInterior');
        for (let i = 0; i < alternateInteriorPairs.length; i++) {
            setHighlightIdx(i);
            await new Promise(res => setTimeout(res, 3000));
        }
        setHighlightIdx(null);
        setHighlightType(null);
    };

    // Handler for "Alternate Exterior" button
    const handleAlternateExterior = async () => {
        setHighlightType('alternateExterior');
        for (let i = 0; i < alternateExteriorPairs.length; i++) {
            setHighlightIdx(i);
            await new Promise(res => setTimeout(res, 3000));
        }
        setHighlightIdx(null);
        setHighlightType(null);
    };

    // Handler for "Same Side Interior" button
    const handleSameSideInterior = async () => {
        setHighlightType('sameSideInterior');
        for (let i = 0; i < sameSideInteriorPairs.length; i++) {
            setHighlightIdx(i);
            await new Promise(res => setTimeout(res, 3000));
        }
        setHighlightIdx(null);
        setHighlightType(null);
    };

    // SVG size
    const svgWidth = 400;
    const svgHeight = 300;

    // Calculate offset to center SVG in the div
    const containerStyle: React.CSSProperties = {
        minHeight: '520px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        border: '2px solid #d1d5db',
        background: 'white',
        overflow: 'scroll',
        width: '100%',
    };

    return (
        <div ref={ref} style={containerStyle}>
            <div className="flex items-center justify-between w-full mb-2 px-4">
                <h2 className="text-center flex-1 text-slate-700 font-bold">Transversal Lines and Angles Visualization</h2>
            </div>
            <div className="flex items-center justify-center mb-4">

                <button
                    onClick={handleReset}
                    className="ml-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 rounded-xl transition duration-200 text-sm"
                >
                    Reset
                </button>
                <button
                    onClick={handleCorresponding}
                    className="ml-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold border border-amber-200 rounded-xl transition duration-200 text-sm"
                >
                    Corresponding
                </button>
                <button
                    onClick={handleAlternateInterior}
                    className="ml-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold border border-emerald-200 rounded-xl transition duration-200 text-sm"
                >
                    Alternate Interior
                </button>
                <button
                    onClick={handleAlternateExterior}
                    className="ml-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold border border-purple-200 rounded-xl transition duration-200 text-sm"
                >
                    Alternate Exterior
                </button>
                <button
                    onClick={handleSameSideInterior}
                    className="ml-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold border border-blue-200 rounded-xl transition duration-200 text-sm"
                >
                    Same Side Interior
                </button>
            </div>
            <div style={{ position: 'relative', width: svgWidth, height: svgHeight }}>
                <svg
                    width={svgWidth}
                    height={svgHeight}
                    style={{ display: 'block', margin: '0 auto', background: 'white', position: 'absolute', top: 0, left: 0 }}
                >
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

                            // Highlight logic
                            let highlight = false;
                            if (highlightIdx !== null) {
                                if (highlightType === 'corresponding' && correspondingPairs[highlightIdx]) {
                                    const [i1, i2] = correspondingPairs[highlightIdx];
                                    highlight = idx === i1 || idx === i2;
                                } else if (highlightType === 'alternateInterior' && alternateInteriorPairs[highlightIdx]) {
                                    const [i1, i2] = alternateInteriorPairs[highlightIdx];
                                    highlight = idx === i1 || idx === i2;
                                } else if (highlightType === 'alternateExterior' && alternateExteriorPairs[highlightIdx]) {
                                    const [i1, i2] = alternateExteriorPairs[highlightIdx];
                                    highlight = idx === i1 || idx === i2;
                                } else if (highlightType === 'sameSideInterior' && sameSideInteriorPairs[highlightIdx]) {
                                    const [i1, i2] = sameSideInteriorPairs[highlightIdx];
                                    highlight = idx === i1 || idx === i2;
                                }
                            }

                            return (
                                <g key={idx}>
                                    <path
                                        d={arcPath}
                                        fill="none"
                                        stroke={highlight ? "#00C853" : color}
                                        strokeWidth={highlight ? 5 : 2}
                                        opacity={highlight ? 1 : 0.8}
                                    />
                                    <text
                                        x={mid.x}
                                        y={mid.y}
                                        fontSize="15"
                                        fill={highlight ? "#00C853" : color}
                                        textAnchor="middle"
                                        fontWeight={highlight ? "bolder" : "bold"}
                                        alignmentBaseline="middle"
                                        style={highlight ? { filter: "drop-shadow(0 0 4px #00C853)" } : {}}
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
        </div>
    );
}