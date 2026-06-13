// symmetrical lines, shapes, and patterns tringles, and quadrilaterals, pentagons, and hexagons 
// playing with punching holes, and folding paper 
// rotation, reflection, and translation , center of rotation, and angle of rotation
// symmetry in nature, art, and architecture
// symmetry in everyday objects, like leaves, flowers, and animals

import React, { useState } from 'react';
import Image from 'next/image';

// Helper component for displaying a shape with its lines of symmetry
const ShapeWithSymmetry: React.FC<{ name: string; lines: number; svgPath: string; symmetryLinesSvg?: string }> = ({ name, lines, svgPath, symmetryLinesSvg }) => {
    const [showLines, setShowLines] = useState(false);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-between transition-all duration-300 hover:shadow-xl">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">{name}</h3>
            <div className="relative w-48 h-48 mb-4 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d={svgPath} fill="#60A5FA" stroke="#3B82F6" strokeWidth="2" />
                    {showLines && symmetryLinesSvg && (
                        <g dangerouslySetInnerHTML={{ __html: symmetryLinesSvg }} />
                    )}
                </svg>
            </div>
            <p className="text-lg text-gray-700 mb-4">Lines of Symmetry: <span className="font-bold text-blue-700">{lines === Infinity ? 'Infinite' : lines}</span></p>
            <button
                onClick={() => setShowLines(!showLines)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            >
                {showLines ? 'Hide Lines' : 'Show Lines'}
            </button>
        </div>
    );
};


// Helper component for interactive transformation (simplified visual)
const TransformationDemo: React.FC<{ title: string; description: string; type: 'rotation' | 'reflection' | 'translation' }> = ({ title, description, type }) => {
    const [angle, setAngle] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [letter, setLetter] = useState('A'); // New state for the letter

    const reset = () => {
        setAngle(0);
        setFlipped(false);
        setOffsetX(0);
        setOffsetY(0);
        setLetter('A'); // Reset letter as well
    };

    const shapeStyle: React.CSSProperties = {
        transition: 'all 0.5s ease-in-out',
        transform: '',
        cursor: 'grab'
    };

    if (type === 'rotation') {
        shapeStyle.transform = `rotate(${angle}deg)`;
    } else if (type === 'reflection') {
        shapeStyle.transform = `scaleX(${flipped ? -1 : 1})`;
    } else if (type === 'translation') {
        shapeStyle.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }

    // Simple drag functionality for translation
    const handleMouseDown = (e: React.MouseEvent) => {
        if (type !== 'translation') return;
        const startX = e.clientX - offsetX;
        const startY = e.clientY - offsetY;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            setOffsetX(moveEvent.clientX - startX);
            setOffsetY(moveEvent.clientY - startY);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };


    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center transition-all duration-300 hover:shadow-xl">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">{title}</h3>
            <p className="text-lg text-gray-700 mb-6 text-center">{description}</p>
            <div className="relative w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-6 overflow-hidden">
                <div
                    className="w-24 h-24 bg-purple-500 rounded-lg flex items-center justify-center text-white text-4xl font-bold"
                    style={shapeStyle}
                    onMouseDown={handleMouseDown}
                >
                    {letter}
                </div>
            </div>
            {type === 'rotation' && (
                <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={angle}
                    onChange={(e) => setAngle(parseInt(e.target.value))}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer mb-4"
                />
            )}
            {type === 'reflection' && (
                <button
                    onClick={() => setFlipped(!flipped)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
                >
                    {flipped ? 'Unflip' : 'Flip Horizontally'}
                </button>
            )}
            {type === 'translation' && (
                <div className="text-center text-gray-600">Drag the square to translate it!</div>
            )}
            <input
                type="text"
                maxLength={1}
                value={letter}
                onChange={(e) => setLetter(e.target.value.toUpperCase())}
                className="border border-gray-300 rounded-md p-2 w-20 text-center mt-4"
                placeholder="Letter"
            />
            <button
                onClick={reset}
                className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            >
                Reset
            </button>
        </div>
    );
};


export default function SymmetryPage() {
    return (
        <div className="container mx-auto px-4 py-12 font-sans bg-gray-50 min-h-screen">
            <h1 className="text-5xl font-extrabold mb-8 text-center text-gray-900 leading-tight">
                Discovering Symmetry 🎨
            </h1>
            <p className="text-xl text-gray-700 mb-12 text-center max-w-3xl mx-auto">
                Symmetry is a fundamental concept in mathematics, art, and nature. It describes how parts of an object or pattern are arranged in a balanced way. Let&apos;s explore its fascinating aspects!
            </p>

            {/* Section: Lines of Symmetry */}
            <section className="mb-16">
                <h2 className="text-4xl font-bold mb-8 text-center text-blue-800">
                    Lines of Symmetry in Shapes 📏
                </h2>
                <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl mx-auto">
                    A line of symmetry is an imaginary line that divides a shape into two identical halves, where one half is the mirror image of the other.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <ShapeWithSymmetry
                        name="Equilateral Triangle"
                        lines={3}
                        svgPath="M50 10 L85 80 L15 80 Z"
                        symmetryLinesSvg={`
                            <line x1="50" y1="10" x2="50" y2="80" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="70" y1="45" x2="15" y2="80" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="25" y1="45" x2="85" y2="80" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            `}
                    />
                    <ShapeWithSymmetry
                        name="Square"
                        lines={4}
                        svgPath="M20 20 H80 V80 H20 Z"
                        symmetryLinesSvg={`
                            <line x1="50" y1="20" x2="50" y2="80" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="20" y1="50" x2="80" y2="50" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="20" y1="20" x2="80" y2="80" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="80" y1="20" x2="20" y2="80" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                        `}
                    />
                    <ShapeWithSymmetry
                        name="Rectangle"
                        lines={2}
                        svgPath="M15 35 H85 V65 H15 Z"
                        symmetryLinesSvg={`
                            <line x1="50" y1="35" x2="50" y2="65" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="15" y1="50" x2="85" y2="50" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                        `}
                    />
                    <ShapeWithSymmetry
                        name="Regular Pentagon"
                        lines={5}
                        svgPath="M50 15 L75 35 L68 65 L32 65 L25 35 Z"
                        symmetryLinesSvg={`
                            <line x1="50" y1="15" x2="50" y2="65" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="25" y1="50" x2="75" y2="35" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="35" y1="15" x2="68" y2="65" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="65" y1="20" x2="32" y2="65" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="70" y1="50" x2="25" y2="35" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            `}
                    />
                    <ShapeWithSymmetry
                        name="Regular Hexagon"
                        lines={6}
                        svgPath="M50 15 L75 30 L75 60 L50 75 L25 60 L25 30 Z"
                        symmetryLinesSvg={`
                            <line x1="50" y1="15" x2="50" y2="75" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="25" y1="45" x2="75" y2="45" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="25" y1="30" x2="75" y2="60" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="75" y1="30" x2="25" y2="60" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="37.5" y1="22.5" x2="62.5" y2="67.5" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="62.5" y1="22.5" x2="37.5" y2="67.5" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                        `}
                    />
                    <ShapeWithSymmetry
                        name="Circle"
                        lines={Infinity} // Representing infinite lines
                        svgPath="M50,50 m-35,0 a35,35 0 1,0 70,0 a35,35 0 1,0 -70,0"
                        symmetryLinesSvg={`
                            <line x1="50" y1="15" x2="50" y2="85" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="15" y1="50" x2="85" y2="50" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="25" y1="25" x2="75" y2="75" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="75" y1="25" x2="25" y2="75" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="32" y1="18" x2="68" y2="82" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <line x1="68" y1="18" x2="32" y2="82" stroke="red" stroke-width="2" stroke-dasharray="5 3" />
                            <text x="50" y="95" text-anchor="middle" font-size="10" fill="red">...and infinitely more!</text>
                        `}
                    />
                </div>
            </section>

            {/* Section: Playing with Punching Holes and Folding Paper */}
            <section className="mb-16 bg-yellow-50 p-8 rounded-xl shadow-md">
                <h2 className="text-4xl font-bold mb-8 text-center text-yellow-800">
                    Interactive: Folding & Punching Holes ✂️
                </h2>
                <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl mx-auto">
                    Imagine folding a piece of paper and punching holes in it. When you unfold it, the holes will appear symmetrically!
                    Click on the paper to punch a hole, then click Unfold&apos; to see the symmetrical pattern.
                </p>
                <PaperFoldingDemo />
            </section>

            {/* Section: Geometric Transformations */}
            <section className="mb-16">
                <h2 className="text-4xl font-bold mb-8 text-center text-purple-800">
                    Geometric Transformations & Symmetry 🔄
                </h2>
                <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl mx-auto">
                    Symmetry is deeply connected to geometric transformations: movements that change the position or orientation of a shape, but not its size or form.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <TransformationDemo
                        title="Rotation"
                        description="Turning a shape around a fixed point (center of rotation) by a certain angle (angle of rotation)."
                        type="rotation"
                    />
                    <TransformationDemo
                        title="Reflection"
                        description="Flipping a shape over a line (line of reflection) to create a mirror image."
                        type="reflection"
                    />
                    <TransformationDemo
                        title="Translation"
                        description="Sliding a shape from one position to another without rotating or flipping it."
                        type="translation"
                    />
                </div>
            </section>

            {/* Section: Symmetry in the Real World */}
            <section className="mb-16 bg-green-50 p-8 rounded-xl shadow-md">
                <h2 className="text-4xl font-bold mb-8 text-center text-green-800">
                    Symmetry All Around Us! 🌍
                </h2>
                <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl mx-auto">
                    Symmetry is not just a mathematical concept; it&apos;s prevalent in nature, art, architecture, and everyday objects, often contributing to beauty and balance.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
                        <h3 className="text-2xl font-semibold mb-4 text-gray-800">Nature 🌿</h3>
                        <Image
                            src="/images/butterfly.png"
                            alt="Butterfly with symmetry"
                            width={300}
                            height={300}
                            className="w-full h-auto rounded-lg mb-4 object-cover aspect-video"
                        />
                        <p className="text-lg text-gray-700 text-center">
                            Many animals (like butterflies), flowers, and leaves exhibit bilateral symmetry. Snowflakes show rotational symmetry.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
                        <h3 className="text-2xl font-semibold mb-4 text-gray-800">Art & Architecture 🏛️</h3>
                        <Image
                            src="/images/taj_mahal.png"
                            alt="Taj Mahal with symmetry"
                            width={300}
                            height={300}
                            className="w-full h-auto rounded-lg mb-4 object-cover aspect-video"
                        />
                        <p className="text-lg text-gray-700 text-center">
                            From ancient temples to modern buildings, artists and architects use symmetry to create visually pleasing and stable structures.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
                        <h3 className="text-2xl font-semibold mb-4 text-gray-800">Everyday Objects ⏰</h3>
                        <Image
                            src="/images/clock.png"
                            alt="Symmetrical wall clock"
                            width={300}
                            height={300}
                            className="w-full h-auto rounded-lg mb-4 object-cover aspect-video"
                        />
                        <p className="text-lg text-gray-700 text-center">
                            Many common items like clocks, steering wheels, and decorative items utilize symmetrical designs for both balance and aesthetic appeal.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}


// Component for the interactive paper folding/punching holes
const PaperFoldingDemo: React.FC = () => {
    const [holes, setHoles] = useState<{ x: number; y: number }[]>([]);
    const [unfoldedHoles, setUnfoldedHoles] = useState<{ x: number; y: number }[]>([]);
    const [unfolded, setUnfolded] = useState(false);

    const paperSize = 400; // Increased size of the square paper in pixels for better interaction

    const handlePunchHole = (e: React.MouseEvent<HTMLDivElement>) => {
        if (unfolded) return; // Cannot punch holes after unfolding
        const rect = e.currentTarget.getBoundingClientRect();
        // Calculate click position relative to the top-left quadrant (where punching is allowed)
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Only allow punching in the top-left quadrant for a simple fold simulation
        if (x <= paperSize / 2 && y <= paperSize / 2) {
            setHoles([...holes, { x, y }]);
        } else {
            // Optional: Provide feedback to the user that they can only punch in the top-left
            console.log("Please click within the top-left quadrant to punch a hole.");
        }
    };

    const handleUnfold = () => {
        const newUnfoldedHoles: { x: number; y: number }[] = [];
        const uniqueHoles = new Set<string>(); // To store unique hole positions as strings

        holes.forEach(hole => {
            // Original hole (top-left quadrant)
            addUniqueHole(newUnfoldedHoles, uniqueHoles, hole.x, hole.y);

            // Reflection across the vertical fold (x-axis symmetry)
            addUniqueHole(newUnfoldedHoles, uniqueHoles, paperSize - hole.x, hole.y);

            // Reflection across the horizontal fold (y-axis symmetry)
            addUniqueHole(newUnfoldedHoles, uniqueHoles, hole.x, paperSize - hole.y);

            // Reflection across both folds (point symmetry through center)
            addUniqueHole(newUnfoldedHoles, uniqueHoles, paperSize - hole.x, paperSize - hole.y);
        });

        setUnfoldedHoles(newUnfoldedHoles);
        setUnfolded(true);
    };

    // Helper function to add a hole if it's unique
    const addUniqueHole = (arr: { x: number; y: number }[], uniqueSet: Set<string>, x: number, y: number) => {
        const key = `${x.toFixed(0)},${y.toFixed(0)}`; // Use fixed-point for consistent keys
        if (!uniqueSet.has(key)) {
            uniqueSet.add(key);
            arr.push({ x, y });
        }
    };

    const handleReset = () => {
        setHoles([]);
        setUnfoldedHoles([]);
        setUnfolded(false);
    };

    return (
        <div className="flex flex-col items-center">
            <div
                className={`relative bg-gray-200 border-2 border-gray-400 rounded-lg overflow-hidden cursor-pointer transition-all duration-500`}
                style={{ width: `${paperSize}px`, height: `${paperSize}px` }}
                onClick={handlePunchHole}
            >
                {/* Visual representation of a folded paper (only top-left quadrant active for punching) */}
                {!unfolded && (
                    <>
                        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-white border-r border-b border-gray-300 flex items-center justify-center text-gray-500 text-sm">
                            Click to Punch Hole (Top-Left)
                        </div>
                        <div className="absolute top-0 left-1/2 w-1/2 h-1/2 bg-gray-100 border-l border-b border-gray-300" />
                        <div className="absolute top-1/2 left-0 w-1/2 h-1/2 bg-gray-100 border-r border-t border-gray-300" />
                        <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-gray-100 border-l border-t border-gray-300" />
                        <div className="absolute top-0 left-1/2 h-full w-px bg-gray-400" /> {/* Vertical Fold */}
                        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-400" /> {/* Horizontal Fold */}
                    </>
                )}

                {/* Display holes */}
                {(unfolded ? unfoldedHoles : holes).map((hole, index) => (
                    <div
                        key={index}
                        className={`absolute w-3 h-3 bg-blue-600 rounded-full ${unfolded ? 'opacity-100' : 'opacity-70'}`}
                        style={{ left: hole.x - 6, top: hole.y - 6 }} // Center the dot
                    />
                ))}
            </div>

            <div className="mt-6 flex gap-4">
                <button
                    onClick={handleUnfold}
                    disabled={unfolded || holes.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Unfold Paper
                </button>
                <button
                    onClick={handleReset}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};
