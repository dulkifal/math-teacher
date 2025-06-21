import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="w-full bg-blue-700 text-white shadow mb-8">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Math Teacher
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/cube" className="hover:underline">Cube Quiz</Link>
          <Link href="/resources" className="hover:underline">Resources</Link>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="ml-4 bg-white text-blue-700 px-3 py-1 rounded hover:bg-blue-100 transition">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}