import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ItemProps {
  label: string;
  active?: boolean;
  icon: LucideIcon;
  isSearch?: boolean;
  onClick?: () => void;
}

const Item = ({ label, active, isSearch, onClick, icon: Icon }: ItemProps) => {
  return (
    <div
      role="button"
      onClick={onClick}
      className={cn(
        "group w-full min-h-[28px] flex items-center text-sm text-muted-foreground font-medium py-1 px-5 hover:bg-primary/5",
        active && "bg-primary/5 text-primary"
      )}
    >
      <div>
        <Icon className="h-[18px] w-[18px] shrink-0 mr-2 text-muted-foreground" />
      </div>
      <span className="truncate mt-0.5">{label}</span>
      {isSearch && (
        <kbd className="hidden md:inline-flex items-center gap-1 rounded h-6 text-[10px] ml-auto pointer-events-none select-none px-1.5 border bg-muted font-mono font-medium text-muted-foreground opacity-100">
          <span className="text-xs">CTRL + K</span>
        </kbd>
      )}
    </div>
  );
};

export default Item;
