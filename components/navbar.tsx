"use client";

import {
  ClerkLoading,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar } from "@/components/contexts/sidebar-context";

const Navbar = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="w-full flex fixed z-40 items-center justify-between py-2.5 px-5 border-b bg-gray-100">
      <button onClick={toggleSidebar} className="md:hidden">
        <Menu />
      </button>
      <header className="w-full flex justify-end">
        <ClerkLoading>
          <Skeleton className="w-7 h-7 rounded-full" />
        </ClerkLoading>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
    </div>
  );
};

export default Navbar;
