import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { useState } from "react";

const topicLinks = [
  { name: "Angles", href: "/angle" },
  { name: "Addition & Subtraction", href: "/addition" },
  { name: "Triangles", href: "/triangle" },
  { name: "Symmetry", href: "/symmetry" },
  { name: "Cube Roots", href: "/cube" },
  { name: "Rational Numbers", href: "/rational" },
  { name: "Fractions", href: "/fractions" },
  { name: "Linear Grapher", href: "/grapher" },
];

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="w-full bg-white text-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-blue-600 hover:text-blue-700 transition-colors"
        >
          Math Teacher
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            Home
          </Link>
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Dashboard
            </Link>
          </Show>
          <div
            className="relative"
            onClick={() => setIsDropdownOpen(isDropdownOpen => !isDropdownOpen)}
          >
            <button className="text-gray-600 hover:text-blue-600 font-medium focus:outline-none flex items-center transition-colors">
              <span>Topics</span>
              <svg
                className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1-0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-md shadow-xl z-20 border border-gray-100">
                <div className="py-2">
                  {topicLinks.map((link) => (
                    <Link
                      href={link.href}
                      key={link.name}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link
            href="/resources"
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            Resources
          </Link>
        </div>
        <div className="flex items-center">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition duration-300 transform hover:scale-105">
                Sign In
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </nav>
  );
}
