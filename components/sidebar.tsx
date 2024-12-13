"use client";

import React from "react";
import { XIcon } from "lucide-react";
import { useSidebar } from "./contexts/sidebar-context";

export const Sidebar = () => {
  const { isSidebarVisible, toggleSidebar } = useSidebar();

  return (
    <div
      className={`bg-gray-100 h-screen transition-all duration-300 overflow-hidden ${
        isSidebarVisible ? "w-0" : "w-full absolute z-50"
      } md:w-[250px] md:block`}
    >
      <button className="md:hidden py-2.5 px-5" onClick={toggleSidebar}>
        <XIcon />
      </button>
      <div>Sidebar content</div>
    </div>
  );
};
