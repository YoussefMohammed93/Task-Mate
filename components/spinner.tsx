import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

const spinnerVariants = cva("tet-muted-forground animate-spin", {
  variants: {
    size: {
      default: "w-4 h-4",
      sm: "w-2 h-2",
      lg: "w-6 h-6",
      icon: "w-10 h-10",
    },
  },
  defaultVariants: {
    size: "default",
  },
});
type SpinnerProps = VariantProps<typeof spinnerVariants>;
export const Spinner = ({ size }: SpinnerProps) => {
  return <Loader className={cn(spinnerVariants({ size }))} />;
};
