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

export default function Main() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex items-center justify-between py-2.5 px-5 border-b bg-gray-100">
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
      <div className="pl-2 py-1">Main content</div>
    </div>
  );
}
