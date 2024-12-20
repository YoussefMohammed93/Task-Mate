"use client";

import {
  AlignJustify,
  CalendarClock,
  ChevronRight,
  Clock4,
  Loader,
  Square,
  Table,
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
import { Label } from "@/components/ui/label";

type Task = {
  _id: Id<"tasks">;
  name: string;
  category: string;
  createdAt: number;
  isCompleted: boolean;
  description?: string;
  _creationTime: number;
  priority: "high" | "medium" | "low";
  tags?: string[];
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
    "newest" | "oldest" | "completed" | "high" | "medium" | "low" | "dueDate"
  >("newest");
  const [viewMode, setViewMode] = useState<"default" | "table" | "board">(
    "default"
  );

  const sortedTasks = tasks
    ? [...tasks]
        .filter((task) => {
          if (sortOption === "completed") return task.isCompleted;
          if (sortOption === "high") return task.priority === "high";
          if (sortOption === "medium") return task.priority === "medium";
          if (sortOption === "low") return task.priority === "low";
          return true;
        })
        .sort((a, b) => {
          if (sortOption === "newest") {
            return b.createdAt - a.createdAt;
          }
          if (sortOption === "oldest") {
            return a.createdAt - b.createdAt;
          }
          if (sortOption === "dueDate") {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return dateA - dateB;
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
      toast.success("All tasks deleted successfully!");
      setShowConfirmDialog(false);
    } catch (error) {
      toast.error("Failed to delete tasks, Please try again.");
      console.error("Error deleting tasks:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderDefaultView = () =>
    sortedTasks.map((task) => (
      <div
        key={task._id}
        role="button"
        className="border-b px-3 py-3 flex items-center justify-between hover:bg-[#aeaeae17]"
        onClick={() => setSelectedTask(task)}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Checkbox
              id={`task-${task._id}`}
              checked={task.isCompleted}
              className="size-6 rounded-none"
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={() => toggleCompletion(task)}
            />
            <h2 className="text-xl font-medium">{task.name}</h2>
            <p
              className={`hidden md:block text-sm ml-2 p-1 px-1.5 rounded ${
                task.priority === "high"
                  ? "bg-red-100 text-red-950"
                  : task.priority === "medium"
                    ? "bg-orange-100 text-orange-950"
                    : "bg-green-100 text-green-950"
              }`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}{" "}
              priority
            </p>
            <div
              className={`hidden md:flex text-[12.5px] items-center gap-1.5 p-1 px-1.5 rounded ${
                task.dueDate
                  ? (() => {
                      const now = new Date();
                      const dueDate = new Date(task.dueDate);
                      const timeDiff = dueDate.getTime() - now.getTime();
                      const hoursLeft = timeDiff / (1000 * 60 * 60);

                      if (hoursLeft > 24) return "bg-green-100 text-green-950";
                      if (hoursLeft <= 24 && hoursLeft > 12)
                        return "bg-orange-100 text-orange-950";
                      if (hoursLeft <= 12 && hoursLeft > 4)
                        return "bg-orange-100 text-orange-950";
                      if (hoursLeft <= 4) return "bg-red-100 text-red-950";
                      return "bg-gray-100 text-gray-950";
                    })()
                  : "bg-gray-100 text-gray-950"
              }`}
            >
              <Clock4 className="size-3.5" />
              <p>
                {task.dueDate
                  ? `${new Intl.DateTimeFormat("en-GB", {
                      timeZone: "Africa/Cairo",
                      day: "2-digit",
                      month: "short",
                    }).format(new Date(task.dueDate))}`
                  : "No due date"}
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-5">
            <div className="flex items-center gap-1.5 sm:gap-3 text-muted-foreground">
              <CalendarClock className="size-5" />
              <p className="text-sm md:text-base">
                Created at : {formatDate(task.createdAt)}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1 sm:gap-2">
                <p className="text-sm sm:text-base font-medium text-muted-foreground">
                  {task.subtasks?.length || 0} Subtasks
                </p>
              </div>
              <div className="flex items-center gap-1">
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
            <div className="flex flex-wrap relative right-1">
              {task.tags?.map((tag, index) => {
                const bgColors = [
                  "bg-red-100 text-red-950",
                  "bg-blue-100 text-blue-950",
                  "bg-emerald-100 text-emerald-950",
                ];
                const bgColor = bgColors[index % bgColors.length];

                return (
                  <span
                    key={index}
                    className={`inline-block text-xs mx-1 p-1 px-1.5 rounded ${bgColor}`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
            <div className="flex gap-2 md:hidden">
              <p
                className={`text-sm p-1 px-1.5 rounded ${
                  task.priority === "high"
                    ? "bg-red-100 text-red-950"
                    : task.priority === "medium"
                      ? "bg-orange-100 text-orange-950"
                      : "bg-green-100 text-green-950"
                }`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}{" "}
                priority
              </p>
              <div
                className={`flex text-[12.5px] items-center gap-1.5 p-1 px-1.5 rounded ${
                  task.dueDate
                    ? (() => {
                        const now = new Date();
                        const dueDate = new Date(task.dueDate);
                        const timeDiff = dueDate.getTime() - now.getTime();
                        const hoursLeft = timeDiff / (1000 * 60 * 60);

                        if (hoursLeft > 24)
                          return "bg-green-100 text-green-950";
                        if (hoursLeft <= 24 && hoursLeft > 12)
                          return "bg-orange-100 text-orange-950";
                        if (hoursLeft <= 12 && hoursLeft > 4)
                          return "bg-orange-100 text-orange-950";
                        if (hoursLeft <= 4) return "bg-red-100 text-red-950";
                        return "bg-gray-100 text-gray-950";
                      })()
                    : "bg-gray-100 text-gray-950"
                }`}
              >
                <Clock4 className="size-3.5" />
                <p>
                  {task.dueDate
                    ? `${new Intl.DateTimeFormat("en-GB", {
                        timeZone: "Africa/Cairo",
                        day: "2-digit",
                        month: "short",
                      }).format(new Date(task.dueDate))}`
                    : "No due date"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <ChevronRight className="block size-6" />
      </div>
    ));

  const renderTableView = () => (
    <table className="table-auto w-full border border-gray-300">
      <thead>
        <tr>
          <th className="border px-4 py-2">Task Name</th>
          <th className="border px-4 py-2">Priority</th>
          <th className="border px-4 py-2">Category</th>
          <th className="border px-4 py-2">Due Date</th>
        </tr>
      </thead>
      <tbody>
        {sortedTasks.map((task) => (
          <tr key={task._id}>
            <td className="border px-4 py-2">{task.name}</td>
            <td className="border px-4 py-2">{task.priority}</td>
            <td className="border px-4 py-2">{task.category}</td>
            <td className="border px-4 py-2">
              {task.dueDate || "No Due Date"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderBoardView = () => (
    <div className="grid grid-cols-3 gap-4">
      {["high", "medium", "low"].map((priority) => (
        <div key={priority}>
          <h3 className="font-bold text-lg">{priority.toUpperCase()}</h3>
          {sortedTasks
            .filter((task) => task.priority === priority)
            .map((task) => (
              <div key={task._id} className="border p-3 mb-2 rounded-lg">
                <h4>{task.name}</h4>
                <p className="text-sm text-gray-600">{task.category}</p>
              </div>
            ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="pl-5 md:pl-0">
      <div className="flex flex-col lg:flex-row sm:items-baseline justify-between gap-4 pr-5">
        <div className="flex items-center gap-3 sm:gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-3xl sm:text-4xl font-semibold">
                Tasks
              </h1>
              {isLoading ? (
                <Skeleton className="animate-pulse size-9 sm:size-10 rounded-md mt-2" />
              ) : (
                <span className="flex items-center justify-center size-9 text-2xl sm:size-10 font-mono font-semibold border rounded-md mt-2">
                  {tasks?.length}
                </span>
              )}
            </div>
            <div className="font-medium text-muted-foreground">
              {getCurrentDate()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <Label className="text-sm ml-1">View as</Label>
            <Select
              value={sortOption}
              onValueChange={(value) =>
                setSortOption(
                  value as
                    | "newest"
                    | "oldest"
                    | "completed"
                    | "high"
                    | "medium"
                    | "low"
                )
              }
            >
              <SelectTrigger className="w-[125px] sm:w-[150px] mt-1">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm ml-1">Customize views</Label>
            <Select
              value={viewMode}
              onValueChange={(value) =>
                setViewMode(value as "default" | "table" | "board")
              }
            >
              <SelectTrigger className="w-[125px] sm:w-[150px] mt-1">
                <SelectValue placeholder="View Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">
                  <span className="flex items-center gap-1.5">
                    <AlignJustify className="size-4" />
                    Default
                  </span>
                </SelectItem>
                <SelectItem value="table">
                  <span className="flex items-center gap-1.5">
                    <Table className="size-4" />
                    Table
                  </span>
                </SelectItem>
                <SelectItem value="board">
                  <span className="flex items-center gap-1.5">
                    <Square className="size-4" />
                    Board
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-5 pt-4">
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
                  Delete all tasks
                  <Trash />
                </>
              )}
            </Button>
          )
        )}
      </div>
      <div className="p-5 pl-0">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="w-full h-[110px] md:h-[80px] rounded-md my-2" />
            </div>
          ))
        ) : sortedTasks.length === 0 ? (
          <p className="text-muted-foreground text-lg">No tasks found.</p>
        ) : viewMode === "default" ? (
          renderDefaultView()
        ) : viewMode === "table" ? (
          renderTableView()
        ) : (
          renderBoardView()
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
            <DialogTitle>Delete all tasks</DialogTitle>
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
