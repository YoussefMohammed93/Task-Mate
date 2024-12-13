"use client";

import { LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface TaskItemProps {
  label: string;
  path?: string;
  icon: LucideIcon;
  isSearch?: boolean;
  onClick?: () => void;
  toggleSidebar?: () => void;
}

const TaskItem = ({
  label,
  path,
  isSearch,
  onClick,
  toggleSidebar,
  icon: Icon,
  isFirst,
  isLast,
}: TaskItemProps & { isFirst?: boolean; isLast?: boolean }) => {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === path;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(path ?? "");
    }

    if (toggleSidebar && window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <div
      role="button"
      onClick={handleClick}
      className={`group w-full min-h-[28px] flex items-center text-sm font-medium py-1 px-5 hover:bg-primary/5 cursor-pointer ${
        isActive ? "bg-primary/5 text-primary" : "text-muted-foreground"
      } ${!isSearch ? "border-y" : ""} 
      ${isFirst ? "border-t-2" : ""} 
      ${isLast ? "border-b-2" : ""}`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0 mr-2" />
      <span className="truncate mt-0.5">{label}</span>
      {isSearch && (
        <kbd className="hidden md:inline-flex items-center gap-1 rounded h-6 text-[10px] ml-auto pointer-events-none select-none px-1.5 border bg-muted font-mono font-medium text-muted-foreground opacity-100">
          <span className="text-xs">CTRL + K</span>
        </kbd>
      )}
    </div>
  );
};

export default TaskItem;
