"use client";

import {
  CalendarDays,
  ChevronsRight,
  Clock1,
  ListChecks,
  LogOut,
  NotepadText,
  Search,
  Settings,
  XIcon,
} from "lucide-react";
import { useClerk } from "@clerk/clerk-react";
import { useSearch } from "@/hooks/use-search";
import { useSidebar } from "./contexts/sidebar-context";
import TaskItem from "@/app/(main)/_components/task-item";

export const Sidebar = () => {
  const search = useSearch();
  const { isSidebarVisible, toggleSidebar } = useSidebar();
  const { signOut } = useClerk();

  return (
    <div
      className={`fixed h-screen transition-all z-50 duration-300 overflow-hidden bg-gray-100 ${
        isSidebarVisible ? "w-0" : "w-full absolute"
      } md:w-[300px] flex flex-col`}
    >
      <div className="w-full absolute top-[6.9vh] h-[93.1vh] -z-10 border-r"></div>
      <button className="md:hidden py-2.5 px-5" onClick={toggleSidebar}>
        <XIcon />
      </button>
      <div className="block text-2xl font-semibold absolute top-2.5 right-5 md:left-5">
        Taskmate
      </div>
      <div className="pt-2 md:pt-12">
        <TaskItem
          onClick={search.onOpen}
          label="Search"
          icon={Search}
          isSearch
          toggleSidebar={toggleSidebar}
        />
        <div className="pl-5 pt-5 pb-2 font-medium">Tasks</div>
        <div>
          <TaskItem
            label="Today"
            path="/"
            icon={ListChecks}
            toggleSidebar={toggleSidebar}
          />
          <TaskItem
            label="Upcoming"
            path="/upcoming"
            icon={ChevronsRight}
            toggleSidebar={toggleSidebar}
          />
          <TaskItem
            label="Calendar"
            path="/calendar"
            icon={CalendarDays}
            toggleSidebar={toggleSidebar}
          />
          <TaskItem
            label="Pomodoro"
            path="/pomodoro"
            icon={Clock1}
            toggleSidebar={toggleSidebar}
          />
          <TaskItem
            label="Sticky Wall"
            path="/sticky-wall"
            icon={NotepadText}
            toggleSidebar={toggleSidebar}
          />
        </div>
      </div>
      <div className="pt-5">
        <div className="pl-5 pt-5 pb-2 font-medium">Options</div>
        <TaskItem
          label="Settings"
          path="/settings"
          icon={Settings}
          toggleSidebar={toggleSidebar}
        />
        <TaskItem
          label="Log out"
          onClick={signOut}
          icon={LogOut}
          toggleSidebar={toggleSidebar}
        />
      </div>
    </div>
  );
};
