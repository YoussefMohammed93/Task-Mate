"use client";

import {
  Clock1,
  ListChecks,
  LogOut,
  Medal,
  NotepadText,
  Search,
  Settings,
  Trophy,
  XIcon,
} from "lucide-react";
import SidebarItem from "./sidebar-item";
import { useClerk } from "@clerk/clerk-react";
import { useSearch } from "@/hooks/use-search";
import { useSidebar } from "./contexts/sidebar-context";

export const Sidebar = () => {
  const search = useSearch();
  const { isSidebarVisible, toggleSidebar } = useSidebar();
  const { signOut } = useClerk();

  const handleLogout = () => {
    signOut();
    toggleSidebar();
  };

  return (
    <div
      className={`fixed h-screen transition-all z-50 duration-300 overflow-hidden bg-[#f9f9f9] dark:bg-[#242424] ${
        isSidebarVisible ? "w-0" : "w-full absolute"
      } md:w-[220px] lg:w-[300px] flex flex-col`}
    >
      <div className="w-full absolute top-[7.3vh] h-[92.7vh] -z-10 border-r"></div>
      <button className="md:hidden py-2.5 px-5" onClick={toggleSidebar}>
        <XIcon />
      </button>
      <div className="block text-2xl font-semibold absolute top-2.5 right-5 md:left-5">
        Taskmate
      </div>
      <div className="pt-2 md:pt-12">
        <SidebarItem
          onClick={search.onOpen}
          label="Search"
          icon={Search}
          isSearch
          toggleSidebar={toggleSidebar}
        />
        <div>
          <SidebarItem
            label="Tasks"
            path="/"
            icon={ListChecks}
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            label="Pomodoro"
            path="/pomodoro"
            icon={Clock1}
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            label="Sticky Notes"
            path="/sticky-notes"
            icon={NotepadText}
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            label="Achievements"
            path="/achievements"
            icon={Trophy}
            toggleSidebar={toggleSidebar}
          />
          <SidebarItem
            label="Leaderboard"
            path="/leaderboard"
            icon={Medal}
            toggleSidebar={toggleSidebar}
          />
        </div>
      </div>
      <div className="pt-5">
        <div className="pl-5 pt-5 pb-2 font-medium">Options</div>
        <SidebarItem
          label="Settings"
          path="/settings"
          icon={Settings}
          toggleSidebar={toggleSidebar}
        />
        <SidebarItem
          label="Log out"
          icon={LogOut}
          onClick={handleLogout}
          toggleSidebar={toggleSidebar}
        />
      </div>
    </div>
  );
};
