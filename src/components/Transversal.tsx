import React, { useState } from 'react';
import useMeasure from 'react-use-measure';
import { Point } from '../types';
import { getArcPath } from '@/utils';
import { DraggablePoint } from '@/components/DraggablePoint';

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

export default function Transversal() {
    const [ref] = useMeasure();

    // Use fixed initial values for a consistent display
    const initial = {
        line1Start: { x: 80, y: 80 },
        line1End: { x: 320, y: 80 },
        line2Start: { x: 80, y: 200 },
        line2End: { x: 320, y: 200 },
        transversalStart: { x: 150, y: 15 },
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
        setHighlightIdx(null);
        setHighlightType(null);
    };

    // Handler for "Corresponding" button
    const handleCorresponding = async () => {
        setHighlightType('corresponding');
        for (let i = 0; i < correspondingPairs.length; i++) {
            setHighlightIdx(i);
            await new Promise(res => setTimeout(res, 2500));
        }
        setHighlightIdx(null);
        setHighlightType(null);
    };

    // Handler for "Alternate Interior" button
    const handleAlternateInterior = async () => {
        setHighlightType('alternateInterior');
        for (let i = 0; i < alternateInteriorPairs.length; i++) {
            setHighlightIdx(i);
            await new Promise(res => setTimeout(res, 2500));
        }
        setHighlightIdx(null);
        setHighlightType(null);
    };

    // Handler for "Alternate Exterior" button
    const handleAlternateExterior = async () => {
        setHighlightType('alternateExterior');
        for (let i = 0; i < alternateExteriorPairs.length; i++) {
            setHighlightIdx(i);
            await new Promise(res => setTimeout(res, 2500));
        }
        setHighlightIdx(null);
        setHighlightType(null);
    };

    // Handler for "Same Side Interior" button
    const handleSameSideInterior = async () => {
        setHighlightType('sameSideInterior');
        for (let i = 0; i < sameSideInteriorPairs.length; i++) {
            setHighlightIdx(i);
            await new Promise(res => setTimeout(res, 2500));
        }
        setHighlightIdx(null);
        setHighlightType(null);
    };

    // SVG size
    const svgWidth = 400;
    const svgHeight = 300;
    const bounds = { minX: 15, maxX: svgWidth - 15, minY: 15, maxY: svgHeight - 15 };

    return (
        <div ref={ref} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
            <div className="w-full mb-3 text-center">
                <h2 className="text-xl font-bold text-gray-900">Transversal Lines and Angles Visualization</h2>
                <p className="text-xs text-gray-500 mt-1">
                    Drag the colored pins to adjust the parallel lines or transversal angle. Notice how angle relationships hold!
                </p>
            </div>

            {/* Interactive Control Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                <button
                    onClick={handleReset}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 rounded-xl transition duration-200 text-xs shadow-sm cursor-pointer"
                >
                    ↺ Reset
                </button>
                <button
                    onClick={handleCorresponding}
                    className={`px-3.5 py-1.5 font-bold border rounded-xl transition duration-200 text-xs shadow-sm cursor-pointer ${
                        highlightType === 'corresponding'
                            ? "bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300"
                            : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                    }`}
                >
                    Corresponding Angles
                </button>
                <button
                    onClick={handleAlternateInterior}
                    className={`px-3.5 py-1.5 font-bold border rounded-xl transition duration-200 text-xs shadow-sm cursor-pointer ${
                        highlightType === 'alternateInterior'
                            ? "bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-300"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                    }`}
                >
                    Alternate Interior
                </button>
                <button
                    onClick={handleAlternateExterior}
                    className={`px-3.5 py-1.5 font-bold border rounded-xl transition duration-200 text-xs shadow-sm cursor-pointer ${
                        highlightType === 'alternateExterior'
                            ? "bg-purple-500 text-white border-purple-600 ring-2 ring-purple-300"
                            : "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200"
                    }`}
                >
                    Alternate Exterior
                </button>
                <button
                    onClick={handleSameSideInterior}
                    className={`px-3.5 py-1.5 font-bold border rounded-xl transition duration-200 text-xs shadow-sm cursor-pointer ${
                        highlightType === 'sameSideInterior'
                            ? "bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300"
                            : "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                    }`}
                >
                    Same Side Interior
                </button>
            </div>

            {/* Canvas Container */}
            <div className="relative bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-inner" style={{ width: svgWidth, height: svgHeight }}>
                <svg
                    width={svgWidth}
                    height={svgHeight}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Background Grid */}
                    <g stroke="#E2E8F0" strokeWidth="1">
                        {Array.from({ length: 8 }, (_, i) => (
                            <line key={`th-${i}`} x1="0" y1={i * 40} x2={svgWidth} y2={i * 40} />
                        ))}
                        {Array.from({ length: 10 }, (_, i) => (
                            <line key={`tv-${i}`} x1={i * 40} y1="0" x2={i * 40} y2={svgHeight} />
                        ))}
                    </g>

                    {/* Parallel Lines */}
                    <line x1={line1Start.x} y1={line1Start.y} x2={line1End.x} y2={line1End.y} stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                    <line x1={line2Start.x} y1={line2Start.y} x2={line2End.x} y2={line2End.y} stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" />
                    
                    {/* Transversal Line */}
                    <line x1={transversalStart.x} y1={transversalStart.y} x2={transversalEnd.x} y2={transversalEnd.y} stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />

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
                            if (Math.abs(det) < 0.001) return null;
                            const x = (b2 * c1 - b1 * c2) / det;
                            const y = (a1 * c2 - a2 * c1) / det;
                            return { x, y };
                        }
                        const P = getIntersection(line1Start, line1End, transversalStart, transversalEnd);
                        const Q = getIntersection(line2Start, line2End, transversalStart, transversalEnd);
                        if (!P || !Q) {
                            return (
                                <text x={svgWidth / 2} y={svgHeight / 2} textAnchor="middle" fill="#64748B" fontSize="13" fontWeight="bold">
                                    Lines are parallel — drag pins to cross transversal!
                                </text>
                            );
                        }

                        // Each intersection: four angles (show arc and label for each)
                        const angleData = [
                            // At P (top)
                            { A: transversalStart, B: P, C: line1Start, color: "#D97706" },
                            { A: line1End, B: P, C: transversalStart, color: "#D97706" },
                            { A: transversalEnd, B: P, C: line1End, color: "#D97706" },
                            { A: line1Start, B: P, C: transversalEnd, color: "#D97706" },
                            // At Q (bottom)
                            { A: transversalStart, B: Q, C: line2Start, color: "#7C3AED" },
                            { A: line2End, B: Q, C: transversalStart, color: "#7C3AED" },
                            { A: transversalEnd, B: Q, C: line2End, color: "#7C3AED" },
                            { A: line2Start, B: Q, C: transversalEnd, color: "#7C3AED" },
                        ];

                        return (
                            <g>
                                {/* Intersection points */}
                                <circle cx={P.x} cy={P.y} r="4" fill="#0F172A" />
                                <circle cx={Q.x} cy={Q.y} r="4" fill="#0F172A" />

                                {angleData.map(({ A, B, C, color }, idx) => {
                                    const angleRad = getAngleRad(A, B, C);
                                    const angleDeg = (angleRad * 180) / Math.PI;
                                    const arcRadius = 28;
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
                                                stroke={highlight ? "#10B981" : color}
                                                strokeWidth={highlight ? 4 : 2}
                                                opacity={highlight ? 1 : 0.85}
                                            />
                                            <text
                                                x={mid.x}
                                                y={mid.y}
                                                fontSize="12"
                                                fill={highlight ? "#059669" : color}
                                                textAnchor="middle"
                                                fontWeight="bold"
                                                alignmentBaseline="middle"
                                                className="filter drop-shadow-sm"
                                            >
                                                {angleDeg.toFixed(0)}°
                                            </text>
                                        </g>
                                    );
                                })}
                            </g>
                        );
                    })()}
                </svg>

                {/* Draggable Points for Line 1 */}
                <DraggablePoint position={line1Start} onDrag={setLine1Start} color="#2563EB" label="L1" bounds={bounds} />
                <DraggablePoint position={line1End} onDrag={setLine1End} color="#2563EB" label="L1" bounds={bounds} />

                {/* Draggable Points for Line 2 */}
                <DraggablePoint position={line2Start} onDrag={setLine2Start} color="#4F46E5" label="L2" bounds={bounds} />
                <DraggablePoint position={line2End} onDrag={setLine2End} color="#4F46E5" label="L2" bounds={bounds} />

                {/* Draggable Points for Transversal Line */}
                <DraggablePoint position={transversalStart} onDrag={setTransversalStart} color="#DC2626" label="T1" bounds={bounds} />
                <DraggablePoint position={transversalEnd} onDrag={setTransversalEnd} color="#DC2626" label="T2" bounds={bounds} />
            </div>
        </div>
    );
}
