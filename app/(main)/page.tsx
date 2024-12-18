"use client";

import {
  CalendarClock,
  ChevronRight,
  Loader,
  Square,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery } from "convex/react";
import { TodayTaskDialog } from "@/components/dialogs/today-task-dialog";
import { TaskDetailsDialog } from "@/components/dialogs/today-details-dialog";

type Task = {
  _id: Id<"tasks">;
  name: string;
  category: string;
  createdAt: number;
  isCompleted: boolean;
  description?: string;
  _creationTime: number;
};

export default function Today() {
  const tasks = useQuery(api.today.get);
  const updateTaskMutation = useMutation(api.today.update);
  const removeAllTasksMutation = useMutation(api.today.removeAll);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isLoading = tasks === undefined;
  const [sortOption, setSortOption] = useState<
    "newest" | "oldest" | "completed"
  >("newest");

  const sortedTasks = tasks
    ? [...tasks]
        .filter((task) => {
          if (sortOption === "completed") {
            return task.isCompleted;
          }
          return true;
        })
        .sort((a, b) => {
          if (sortOption === "newest") {
            return b.createdAt - a.createdAt;
          }
          if (sortOption === "oldest") {
            return a.createdAt - b.createdAt;
          }
          return 0;
        })
    : [];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getCurrentDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    };
    const formattedDate = today.toLocaleDateString("en-GB", options);

    const [weekday, ...rest] = formattedDate.split(" ");
    return `${weekday} ${rest.join(" ")}`;
  };

  const categoryColors: { [key: string]: string } = {
    Work: "orange",
    Sport: "red",
    Reading: "purple",
    Learning: "green",
    Worship: "gray",
  };

  const toggleCompletion = async (task: Task) => {
    const { _id, isCompleted } = task;

    task.isCompleted = !isCompleted;

    try {
      await updateTaskMutation({
        id: _id,
        isCompleted: !isCompleted,
      });

      toast.success("Task completion status updated successfully!");
    } catch (error) {
      console.error("Error updating task:", error);

      task.isCompleted = isCompleted;

      toast.error("Failed to update task completion status. Please try again.");
    }
  };

  const handleDeleteAllTasks = async () => {
    setIsDeleting(true);

    try {
      await removeAllTasksMutation();
      toast.success("All today tasks deleted successfully!");
      setShowConfirmDialog(false);
    } catch (error) {
      toast.error("Failed to delete tasks, Please try again.");
      console.error("Error deleting tasks:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="pl-5 md:pl-0">
      <div className="flex flex-col lg:flex-row sm:items-baseline justify-between gap-4 pr-5">
        <div className="flex items-center gap-3 sm:gap-8">
          <div className="flex items-center gap-5 sm:gap-8">
            <h1 className="font-mono text-3xl sm:text-4xl font-semibold">
              Today
            </h1>
            {isLoading ? (
              <Skeleton className="animate-pulse size-9 sm:size-10 rounded-md mt-2" />
            ) : (
              <span className="flex items-center justify-center size-9 text-2xl sm:size-10 font-mono font-semibold border rounded-md mt-2">
                {tasks?.length}
              </span>
            )}
          </div>
        </div>
        <div className="font-medium text-muted-foreground">
          {getCurrentDate()}
        </div>
        <div>
          <Select
            value={sortOption}
            onValueChange={(value) =>
              setSortOption(value as "newest" | "oldest" | "completed")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-5 pt-8">
        <TodayTaskDialog />
        {isLoading ? (
          <Skeleton className="animate-pulse w-[168px] h-9 rounded-md" />
        ) : (
          tasks &&
          tasks.length > 1 && (
            <Button
              variant="destructive"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  Deleting... <Loader className="animate-spin size-5" />
                </span>
              ) : (
                <>
                  Delete all today tasks
                  <Trash className="hidden sm:block" />
                </>
              )}
            </Button>
          )
        )}
      </div>
      <div className="p-5 pl-0">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse border-b p-3 flex items-center justify-between"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-7 rounded-md" />
                  <Skeleton className="w-24 h-6 rounded-md" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="w-[80px] sm:w-[100px] h-6 rounded-md" />
                  <Skeleton className="w-[80px] sm:w-[100px] h-6 rounded-md" />
                  <div className="flex gap-2">
                    <Skeleton className="w-[20px] sm:w-[25px] h-6 rounded" />
                    <Skeleton className="w-[80px] sm:w-[100px] h-6 rounded-md" />
                  </div>
                </div>
              </div>
              <Skeleton className="size-6 rounded-md hidden sm:block" />
            </div>
          ))
        ) : sortedTasks?.length > 0 ? (
          sortedTasks.map((task) => (
            <div
              key={task._id}
              role="button"
              className="border-b px-3 py-2 flex items-center justify-between hover:bg-[#aeaeae17]"
              onClick={() => setSelectedTask(task)}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`task-${task._id}`}
                    checked={task.isCompleted}
                    className="size-6"
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={() => toggleCompletion(task)}
                  />
                  <h2 className="text-xl font-medium">{task.name}</h2>
                </div>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-1 sm:gap-3 text-muted-foreground">
                    <CalendarClock className="size-5" />
                    <p>{formatDate(task.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <p className="text-sm sm:text-base font-medium text-muted-foreground">
                      {task.subtasks?.length || 0} Subtasks
                    </p>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    {(() => {
                      const customCategoryMatch = task.category.match(
                        /^(.*) \((#[A-Fa-f0-9]{6})\)$/
                      );
                      const categoryName = customCategoryMatch
                        ? customCategoryMatch[1]
                        : task.category;
                      const categoryColor = customCategoryMatch
                        ? customCategoryMatch[2]
                        : categoryColors[task.category] || "#6b7280";
                      return (
                        <>
                          <Square
                            className={`size-6 fill-[${categoryColor}] stroke-none`}
                            style={{ fill: categoryColor }}
                          />
                          <p className="text-sm sm:text-base font-medium text-zinc-600">
                            {categoryName}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
              <ChevronRight className="hidden sm:block size-6" />
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-lg">
            {"You don't have any tasks for today."}
          </p>
        )}
      </div>
      {selectedTask && (
        <TaskDetailsDialog
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete all today tasks</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete all tasks? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllTasks}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  Deleting <Loader className="animate-spin" />
                </>
              ) : (
                "Yes, Delete All"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
