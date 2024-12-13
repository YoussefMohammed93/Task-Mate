"use client";

import React from "react";
import { Search, XIcon } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import Item from "@/app/(main)/_components/item";
import { useSidebar } from "./contexts/sidebar-context";

export const Sidebar = () => {
  const search = useSearch();
  const { isSidebarVisible, toggleSidebar } = useSidebar();

  return (
    <div
      className={`h-screen transition-all duration-300 overflow-hidden border-r bg-gray-100 ${
        isSidebarVisible ? "w-0" : "w-full absolute z-50"
      } md:w-[250px] md:block`}
    >
      <button className="md:hidden py-2.5 px-5" onClick={toggleSidebar}>
        <XIcon />
      </button>
      <div className="hidden md:block text-xl font-semibold absolute top-2.5 left-5">
        Menu
      </div>
      <div className="pt-2 md:pt-12">
        <Item onClick={search.onOpen} label="Search" icon={Search} isSearch />
      </div>
    </div>
  );
};
