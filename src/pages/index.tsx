import Link from "next/link";

const topics = [
  {
    name: "Angles",
    description: "Learn about different types of angles and their properties.",
    href: "/angle",
    icon: "📐",
  },
  {
    name: "Addition & Subtraction",
    description:
      "Master the basics of addition and subtraction on a number line.",
    href: "/addition",
    icon: "➕",
  },
  {
    name: "Triangles",
    description:
      "Explore the properties of triangles, from medians to altitudes.",
    href: "/triangle",
    icon: "🔺",
  },
  {
    name: "Symmetry",
    description: "Discover symmetry in shapes, patterns, and nature.",
    href: "/symmetry",
    icon: "🎨",
  },
  {
    name: "Cube Roots",
    description: "Challenge yourself with our interactive cube root quiz.",
    href: "/cube",
    icon: "🧊",
  },
  {
    name: "Rational Numbers",
    description: "Understand what rational numbers are and how they work.",
    href: "/rational",
    icon: "➗",
  },
  {
    name: "External Resources",
    description: "Find links to other great math learning websites and tools.",
    href: "/resources",
    icon: "🔗",
  },
];

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
          Master Math with{" "}
          <span className="text-blue-600">Fun, Interactive</span> Lessons
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          From angles to cube roots, we make learning math an engaging and
          visual experience. Dive into our topics and start your journey today!
        </p>
        <div className="mt-8">
          <a
            href="#topics"
            className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition duration-300 transform hover:scale-105 shadow-lg"
          >
            Explore Topics
          </a>
        </div>
      </main>

      {/* Topics Section */}
      <section id="topics" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            What do you want to learn?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topics.map((topic) => (
              <Link
                href={topic.href}
                key={topic.name}
                className="block p-8 bg-gray-50 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{topic.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {topic.name}
                </h3>
                <p className="text-gray-600">{topic.description}</p>
                <div className="mt-4 font-semibold text-blue-600 hover:underline">
                  Start Learning →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Why Math Teacher?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl text-blue-500 mb-4">💡</div>
              <h3 className="text-2xl font-bold mb-2">Interactive Visuals</h3>
              <p className="text-gray-600">
                Grasp complex concepts easily with our dynamic and draggable
                visualizations.
              </p>
            </div>
            <div className="p-6">
              <div className="text-4xl text-blue-500 mb-4">✅</div>
              <h3 className="text-2xl font-bold mb-2">Practice Quizzes</h3>
              <p className="text-gray-600">
                Test your knowledge and track your score with interactive
                quizzes.
              </p>
            </div>
            <div className="p-6">
              <div className="text-4xl text-blue-500 mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-2">Curated Resources</h3>
              <p className="text-gray-600">
                Access a hand-picked list of the best external math resources
                and tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-blue-600 text-white">
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">
            Sign in to save your progress and access all features.
          </p>
          <Link
            href="/cube"
            className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition duration-300 transform hover:scale-105 shadow-lg"
          >
            Take a Quiz
          </Link>
        </div>
      </section>
    </div>
  );
}
