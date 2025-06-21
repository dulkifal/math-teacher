import Link from "next/link";
import Navbar from "../components/Navbar";

const resources = [
  {
    title: "Khan Academy",
    link: "https://www.khanacademy.org/math",
    description: "Free online courses, lessons, and practice in math.",
  },
  {
    title: "Coursera - Mathematics Courses",
    link: "https://www.coursera.org/browse/data-science/math-and-logic",
    description: "Online courses from top universities on various math topics.",
  },
  {
    title: "Brilliant.org",
    link: "https://www.brilliant.org/courses/",
    description: "Interactive learning in math and science through fun and engaging problems.",
  },
  {
    title: "Art of Problem Solving",
    link: "https://artofproblemsolving.com/",
    description: "Resources and community for students who love math.",
  },
  {
    title: "Paul's Online Math Notes",
    link: "http://tutorial.math.lamar.edu/",
    description: "Comprehensive math notes and tutorials for various topics.",
  },
];

export default function Resources() {
  return (
    <div className="min-h-screen p-8">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Math Learning Resources</h1>
      <ul className="list-disc list-inside">
        {resources.map((resource, index) => (
          <li key={index} className="mb-2">
            <Link href={resource.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {resource.title}
            </Link>: {resource.description}
          </li>
        ))}
      </ul>
    </div>
  );
}