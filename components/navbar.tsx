"use client";

import {
  useUser,
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  ClerkLoading,
} from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar } from "@/components/contexts/sidebar-context";

const Navbar = () => {
  const { toggleSidebar } = useSidebar();
  const { user } = useUser();

  return (
    <div className="w-full flex fixed z-40 items-center justify-between py-2.5 px-5 border-b bg-gray-100 dark:bg-[#242424]">
      <button onClick={toggleSidebar} className="md:hidden">
        <Menu />
      </button>
      <header className="w-full flex items-center justify-end gap-2">
        <div className="cursor-default font-medium">{user?.fullName}</div>
        <ClerkLoading>
          <Skeleton className="w-40 h-6 rounded-md" />
        </ClerkLoading>
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
