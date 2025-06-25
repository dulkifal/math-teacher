
import Link from "next/link";

export default function RationalNumbers() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4 text-blue-800">Rational Numbers & Their Properties</h1>
        <p className="mb-6 text-lg text-gray-700">
          <b>Rational numbers</b> are numbers that can be written as a fraction <b>p/q</b>, where <b>p</b> and <b>q</b> are integers and <b>q ≠ 0</b>.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-blue-700">Examples</h2>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li>1/2, -3/4, 5, 0, 7/1, -8/3</li>
          <li>All integers are rational numbers (e.g., 5 = 5/1)</li>
          <li>Decimals that terminate or repeat (e.g., 0.75 = 3/4, 0.333... = 1/3)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-blue-700">Properties of Rational Numbers</h2>
        <ul className="list-disc list-inside mb-6 text-gray-700">
          <li><b>Closure:</b> The sum, difference, and product of any two rational numbers is a rational number.</li>
          <li><b>Commutativity:</b> a + b = b + a and a × b = b × a for any rational numbers a and b.</li>
          <li><b>Associativity:</b> (a + b) + c = a + (b + c) and (a × b) × c = a × (b × c).</li>
          <li><b>Existence of Identity:</b> 0 is the additive identity; 1 is the multiplicative identity.</li>
          <li><b>Existence of Inverse:</b> For every rational number a, there is -a (additive inverse) and 1/a (multiplicative inverse, a ≠ 0).</li>
          <li><b>Distributivity:</b> a × (b + c) = a × b + a × c.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2 text-blue-700">Activities</h2>
        <div className="mb-8 space-y-6">
          {/* Activity 1 */}
          <div className="p-4 bg-white rounded shadow">
            <b>1. Place Rational Numbers on a Number Line (2D):</b>
            <div className="my-2">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Number-line.svg/512px-Number-line.svg.png"
                alt="Number line"
                className="w-full max-w-md mx-auto my-2"
              />
            </div>
            <div>
              <span>
                Place the following numbers on the number line: <b>1/2, -1, 0.75, -3/4, 2</b>
              </span>
            </div>
          </div>
          {/* Activity 2 */}
          <div className="p-4 bg-white rounded shadow">
            <b>2. Visualize Rational Numbers as Areas (2D):</b>
            <div className="flex flex-wrap gap-4 my-2">
              <div>
                <div className="w-24 h-24 border relative bg-gray-100 flex items-end">
                  <div className="bg-blue-400 w-full" style={{ height: "50%" }} />
                </div>
                <div className="text-center mt-1">1/2 shaded</div>
              </div>
              <div>
                <div className="w-24 h-24 border relative bg-gray-100 flex items-end">
                  <div className="bg-green-400 w-full" style={{ height: "75%" }} />
                </div>
                <div className="text-center mt-1">3/4 shaded</div>
              </div>
            </div>
            <div>
              <span>
                Shade <b>1/2</b> and <b>3/4</b> of a square. Which is greater? How do you know?
              </span>
            </div>
          </div>
          {/* Activity 3 */}
          <div className="p-4 bg-white rounded shadow">
            <b>3. Rational Numbers in 3D: Fraction of a Cube</b>
            <div className="my-2">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Cube_fraction.svg/320px-Cube_fraction.svg.png"
                alt="Fraction of a cube"
                className="w-40 mx-auto"
              />
            </div>
            <div>
              <span>
                Imagine a cube divided into 8 equal parts. If you shade 3 parts, what fraction is shaded? <b>3/8</b>
              </span>
            </div>
          </div>
          {/* Activity 4 */}
          <div className="p-4 bg-white rounded shadow">
            <b>4. Closure Property Practice:</b>
            <div>
              Add and multiply the following pairs. Are the results rational?
              <ul className="list-disc list-inside ml-4">
                <li>1/3 + 2/5 = ?</li>
                <li>-4/7 × 3/2 = ?</li>
              </ul>
            </div>
          </div>
          {/* Activity 5 */}
          <div className="p-4 bg-white rounded shadow">
            <b>5. Inverse and Commutativity:</b>
            <div>
              <ul className="list-disc list-inside ml-4">
                <li>What is the additive and multiplicative inverse of 5/8?</li>
                <li>Is 2/3 + 5/7 the same as 5/7 + 2/3? Try it!</li>
              </ul>
            </div>
          </div>
        </div>


        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}