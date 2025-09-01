import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useState } from "react";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="w-full bg-blue-100 text-gray-800 shadow ">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Math Teacher
        </Link>
        <div className="flex gap-6 items-center"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Link href="/" className="hover:underline">Home</Link>
          <div
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            // onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="hover:underline focus:outline-none">
              Class 2
            </button>
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 text-gray-800">
                <div className="py-1">
                  <Link href="/angle" className="block px-4 py-2 text-sm hover:bg-blue-50">Angle</Link>
                <Link href="/addition" className="block px-4 py-2 text-sm hover:bg-blue-50">Addition</Link>
                <Link href="/resources" className="block px-4 py-2 text-sm hover:bg-blue-50">Resources</Link>
                <Link href="/triangle" className="block px-4 py-2 text-sm hover:bg-blue-50">Triangle</Link>
                <Link href="/symmetry" className="block px-4 py-2 text-sm hover:bg-blue-50">Symmetry</Link>
                </div>
              </div>
            )}
          </div>
            <Link href="/cube" className="block px-4 py-2 text-sm hover:bg-blue-50">Cube</Link>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="ml-4 bg-white text-blue-700 px-3 py-1 rounded hover:bg-blue-100 transition">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}