import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
    
      <h1 className="text-4xl font-bold mb-4">Welcome to Math Learning Resources</h1>
      <p className="text-lg mb-8">Explore a variety of resources to enhance your math skills.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/resources" className="p-4 border rounded shadow hover:bg-gray-100">
          Math Tutorials
        </Link>
        <Link href="/resources" className="p-4 border rounded shadow hover:bg-gray-100">
          Practice Exercises
        </Link>
        <Link href="/resources" className="p-4 border rounded shadow hover:bg-gray-100">
          Articles and Guides
        </Link>
        <Link href="/resources" className="p-4 border rounded shadow hover:bg-gray-100">
          Online Courses
        </Link>
      </div>
    </div>
  );
}