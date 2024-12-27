"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { Button } from "./ui/button";
import { useQuery } from "convex/react";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import { Avatar, AvatarImage } from "./ui/avatar";
import { api } from "../../convex/_generated/api";
import { Menu, Settings, User } from "lucide-react";
import { useSidebar } from "@/components/contexts/sidebar-context";

export const Navbar = () => {
  const { toggleSidebar } = useSidebar();
  const user = useQuery(api.users.currentUser);

  return (
    <nav className="w-full flex fixed z-40 items-center justify-between py-2.5 px-5 border-b bg-[#f9f9f9] dark:bg-[#242424]">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden"
        >
          <Menu className="size-6" />
        </Button>
      </div>
      <header className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="size-8">
              {user ? (
                <AvatarImage
                  src={user.imageUrl}
                  className="size-8 object-cover rounded-full"
                  alt={`${user.firstName}'s Image`}
                />
              ) : (
                <Skeleton className="size-8 rounded-full" />
              )}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={5} className="w-40 mr-5 p-1">
            <DropdownMenuItem>
              <Link href="/profile">
                <div className="flex items-center space-x-2">
                  <User className="size-5" />
                  <span className="text-sm">Profile</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <Separator className="my-1" />
            <DropdownMenuItem>
              <Link href="/settings">
                <div className="flex items-center space-x-2">
                  <Settings className="size-5" />
                  <span className="text-sm">Settings</span>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    </nav>
  );
};
