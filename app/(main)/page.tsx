"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/components/contexts/sidebar-context";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Main() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex items-center justify-between py-2.5 px-5 bg-gray-100">
        <button onClick={toggleSidebar} className="md:hidden">
          <Menu />
        </button>
        <header className="w-full flex justify-end">
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
      </div>
      <div>Main content</div>
    </div>
  );
}
