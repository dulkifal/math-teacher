// number line to add negative and positive numbers, addition of fractions, addition of decimals, addition of whole numbers, addition of mixed numbers, properties of addition, associative property, commutative property, identity property
import React from 'react';

export default function Addition() {
    const [num1, setNum1] = React.useState<number>(0);
    const [num2, setNum2] = React.useState<number>(0);
    const [result, setResult] = React.useState<number | null>(null);
    const [operation, setOperation] = React.useState<'add' | 'subtract'>('add');

    // Function to handle addition or subtraction
    const calculateResult = (n1: number, n2: number, op: 'add' | 'subtract') => {
        if (op === 'add') {
            return n1 + n2;
        } else {
            return n1 - n2;
        }
    };

    // Calculate result when numbers or operation change
    React.useEffect(() => {
        setResult(calculateResult(num1, num2, operation));
    }, [num1, num2, operation]);

    // Define the range for the number line. Adjust these values to fit your expected number range.
    // The number line will dynamically scale based on these min/max values.
    const MIN_NUMBER_LINE = -30; // Minimum value for the number line
    const MAX_NUMBER_LINE = 30;  // Maximum value for the number line
    const NUMBER_LINE_UNIT_WIDTH = 20; // Pixels per unit on the number line, controls spacing of numbers

    // Calculate bird's starting position on the number line
    const birdStartLeft = `${(num1 - MIN_NUMBER_LINE) * NUMBER_LINE_UNIT_WIDTH}px`;

    // Calculate bird's ending position (result) on the number line
    const birdEndLeft = result !== null ? `${(result - MIN_NUMBER_LINE) * NUMBER_LINE_UNIT_WIDTH}px` : birdStartLeft;

    // Determine the direction of movement for bird rotation and path color
    const movementDirection = result !== null ? (result - num1) : 0;
    const birdScaleX = movementDirection < 0 ? -1 : 1; // -1 for left, 1 for right

    // Calculate the left position and width of the movement path
    // The path should always start at the numerically smaller value and extend to the larger value
    const pathLeftCoord = Math.min(num1, result !== null ? result : num1);
    const pathRightCoord = Math.max(num1, result !== null ? result : num1);

    const pathLeft = `${(pathLeftCoord - MIN_NUMBER_LINE) * NUMBER_LINE_UNIT_WIDTH}px`;
    const pathWidth = (pathRightCoord - pathLeftCoord) * NUMBER_LINE_UNIT_WIDTH;

    // Determine path color based on movement direction
    const pathColorClass = movementDirection >= 0 ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className="container mx-auto px-4 py-8 font-sans">
            <h1 className="text-4xl font-extrabold mb-6 text-center text-gray-800">
                Interactive Math on a Number Line 🧮
            </h1>
            <p className="text-lg text-gray-700 mb-8 text-center max-w-2xl mx-auto">
                Explore addition and subtraction visually! Input numbers, select an operation, and watch a bird move on the number line to show the result.
            </p>

            {/* Input and Operation Section */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12 p-6 border border-blue-200 rounded-xl shadow-lg bg-blue-50">
                <input
                    type="number"
                    className="border border-blue-300 rounded-lg p-3 w-36 text-center text-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                    value={num1}
                    onChange={(e) => setNum1(parseFloat(e.target.value))}
                    placeholder="First number"
                    aria-label="First number input"
                />
                <select
                    className="border border-blue-300 rounded-lg p-3 bg-white text-lg cursor-pointer shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                    value={operation}
                    onChange={(e) => setOperation(e.target.value as 'add' | 'subtract')}
                    aria-label="Operation selector"
                >
                    <option value="add" className="text-lg">+</option>
                    <option value="subtract" className="text-lg">-</option>
                </select>
                <input
                    type="number"
                    className="border border-blue-300 rounded-lg p-3 w-36 text-center text-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                    value={num2}
                    onChange={(e) => setNum2(parseFloat(e.target.value))}
                    placeholder="Second number"
                    aria-label="Second number input"
                />
                <span className="text-3xl font-bold text-blue-700">=</span>
                <span className="text-4xl font-extrabold text-purple-700">{result !== null ? result : '...'}</span>
            </div>

            {/* Number Line Display */}
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Number Line Visualization 🔢</h2>
            <div className="relative h-40 mb-12 border border-gray-300 rounded-xl p-6 flex items-center justify-center overflow-hidden bg-white shadow-inner">
                {/* Main Number Line */}
                <div
                    className="absolute h-1 bg-gray-600"
                    style={{ left: 0, right: 0, top: '50%', transform: 'translateY(-50%)' }}
                />
                {/* Number Line Ticks and Labels */}
                {Array.from({ length: MAX_NUMBER_LINE - MIN_NUMBER_LINE + 1 }).map((_, i) => {
                    const number = MIN_NUMBER_LINE + i;
                    const leftPosition = `${i * NUMBER_LINE_UNIT_WIDTH}px`;
                    return (
                        <div key={number} className="absolute flex flex-col items-center" style={{ left: leftPosition, top: '50%', transform: 'translateY(-50%)' }}>
                            <div className="w-px h-4 bg-gray-600 mb-1" /> {/* Tick mark */}
                            <span className="text-sm text-gray-800 font-medium">{number}</span> {/* Label */}
                        </div>
                    );
                })}

                {/* Bird Icon - Starting Point */}
                <div
                    className="absolute z-20 transition-all duration-1000 ease-out"
                    style={{ left: birdStartLeft, bottom: '60%', transform: 'translateX(-50%)' }}
                >
                    <span role="img" aria-label="bird" className="text-5xl animate-bounce-bird" style={{ transform: `scaleX(${birdScaleX})` }}>🐦</span>
                    <div className="absolute -bottom-8 w-2 h-2 bg-red-500 rounded-full left-1/2 -translate-x-1/2 shadow-lg" /> {/* Start marker */}
                    <span className="absolute -bottom-14 text-sm font-bold text-red-600 whitespace-nowrap" style={{ left: '50%', transform: 'translateX(-50%)' }}>Start: {num1}</span>
                </div>

                {/* Movement Path */}
                {result !== null && pathWidth > 0 && (
                    <div
                        className={`absolute h-1 ${pathColorClass} rounded-full transition-all duration-1000 ease-in-out z-10`}
                        style={{
                            left: pathLeft,
                            width: `${pathWidth}px`,
                            bottom: '55%',
                        }}
                    />
                )}

                {/* Bird Icon - Ending Point (Result) */}
                {result !== null && (
                    <div
                        className="absolute z-20 transition-all duration-1000 ease-in-out"
                        style={{ left: birdEndLeft, bottom: '60%', transform: 'translateX(-50%)' }}
                    >
                        <span role="img" aria-label="bird" className="text-5xl animate-bounce-bird" style={{ transform: `scaleX(${birdScaleX})` }}>🐦</span>
                        <div className="absolute -bottom-8 w-2 h-2 bg-purple-500 rounded-full left-1/2 -translate-x-1/2 shadow-lg" /> {/* End marker */}
                        <span className="absolute -bottom-14 text-sm font-bold text-purple-600 whitespace-nowrap" style={{ left: '50%', transform: 'translateX(-50%)' }}>End: {result}</span>
                    </div>
                )}
            </div>

            {/* Tailwind CSS for custom bird animation */}
            <style jsx>{`
                @keyframes bounce-bird {
                    0%, 100% { transform: translateY(0) scaleX(var(--bird-scale-x, 1)); }
                    50% { transform: translateY(-10px) scaleX(var(--bird-scale-x, 1)); }
                }
                .animate-bounce-bird {
                    animation: bounce-bird 2s infinite ease-in-out;
                }
            `}</style>

            <hr className="my-12 border-gray-200" />

            {/* Properties of Addition */}
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Properties of Addition 📚</h2>
            <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl mx-auto">
                Understanding these fundamental properties can simplify calculations and build a stronger foundation in mathematics.
            </p>

            {/* Associative Property */}
            <div className="mb-8 p-6 border border-purple-200 rounded-xl shadow-md bg-purple-50">
                <h3 className="text-2xl font-semibold mb-3 flex items-center text-purple-800">
                    <span role="img" aria-label="associative" className="mr-3 text-3xl">🔗</span> **Associative Property**
                </h3>
                <p className="text-gray-800 mb-4 leading-relaxed">
                    The associative property states that **when adding three or more numbers, the way the numbers are grouped (using parentheses) does not change the sum**. You can rearrange the parentheses without affecting the final result.
                </p>
                <div className="font-mono bg-purple-100 p-3 rounded-lg inline-block text-lg text-purple-700 shadow-inner">
                    $$(a + b) + c = a + (b + c)$$
                </div>
                <p className="text-gray-700 mt-4 leading-relaxed">
                    **Example:** Consider the numbers $2, 3,$ and $4$.
                    <br />
                    $(2 + 3) + 4 = 5 + 4 = 9$.
                    <br />
                    Also, $2 + (3 + 4) = 2 + 7 = 9$.
                    <br />
                    Both groupings yield the same sum, demonstrating the associative property.
                </p>
            </div>

            <hr className="my-12 border-gray-200" />

            {/* Commutative Property */}
            <div className="mb-8 p-6 border border-green-200 rounded-xl shadow-md bg-green-50">
                <h3 className="text-2xl font-semibold mb-3 flex items-center text-green-800">
                    <span role="img" aria-label="commutative" className="mr-3 text-3xl">🔄</span> **Commutative Property**
                </h3>
                <p className="text-gray-800 mb-4 leading-relaxed">
                    The commutative property states that **the order in which two numbers are added does not affect their sum**. You can swap the positions of the numbers, and the result will remain identical.
                </p>
                <div className="font-mono bg-green-100 p-3 rounded-lg inline-block text-lg text-green-700 shadow-inner">
                    $$a + b = b + a$$
                </div>
                <p className="text-gray-700 mt-4 leading-relaxed">
                    **Example:** Let&apos;s take the numbers $5$ and $8$.
                    <br />
                    $5 + 8 = 13$.
                    <br />
                    And $8 + 5 = 13$.
                    <br />
                    The sum remains $13$, regardless of the order of the addends.
                </p>
            </div>

            <hr className="my-12 border-gray-200" />

            {/* Identity Property */}
            <div className="mb-8 p-6 border border-yellow-200 rounded-xl shadow-md bg-yellow-50">
                <h3 className="text-2xl font-semibold mb-3 flex items-center text-yellow-800">
                    <span role="img" aria-label="identity" className="mr-3 text-3xl">✨</span> **Identity Property (Additive Identity)**
                </h3>
                <p className="text-gray-800 mb-4 leading-relaxed">
                    The identity property of addition states that **the sum of any number and zero is that number itself**. For this reason, zero is called the **additive identity**. Adding zero to any number does not change the number&apos;s value.
                </p>
                <div className="font-mono bg-yellow-100 p-3 rounded-lg inline-block text-lg text-yellow-700 shadow-inner">
                    $$a + 0 = a$$
                </div>
                <p className="text-gray-700 mt-4 leading-relaxed">
                    **Example:**
                    <br />
                    $15 + 0 = 15$.
                    <br />
                    $0 + 27 = 27$.
                    <br />
                    In both cases, adding zero leaves the original number unchanged.
                </p>
            </div>
        </div>
    );
}

