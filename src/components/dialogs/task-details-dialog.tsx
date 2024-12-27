"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useMutation } from "convex/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { AlertTriangle, CalendarDays, Loader, Plus, Trash } from "lucide-react";

const formatCairoTime = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

type Task = {
  _id: string;
  name: string;
  category: string;
  createdAt: number;
  isCompleted: boolean;
  description?: string;
  subtasks?: { title: string; isCompleted: boolean }[];
  priority: "high" | "medium" | "low";
  tags?: string[];
  dueDate?: string;
  dueTime?: string;
};

const MAX_SUBTASKS = 3;

const timeAgo = (timestamp: number) => {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);
  const seconds = diffInSeconds;
  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(diffInSeconds / 3600);
  const days = Math.floor(diffInSeconds / 86400);
  const months = Math.floor(diffInSeconds / 2592000);
  const years = Math.floor(diffInSeconds / 31536000);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

export function TaskDetailsDialog({
  task,
  onClose,
}: {
  task: Task | null;
  onClose: () => void;
}) {
  const updateTaskMutation = useMutation(api.tasks.update);
  const deleteTaskMutation = useMutation(api.tasks.remove);
  const [taskName, setTaskName] = useState<string>(task?.name || "");
  const [description, setDescription] = useState<string>(
    task?.description || ""
  );
  const [category, setCategory] = useState<string>("");
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState<string>("");
  const [customCategoryColor, setCustomCategoryColor] =
    useState<string>("#000000");
  const [error, setError] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<
    { title: string; isCompleted: boolean }[]
  >(task?.subtasks || []);
  const [priority, setPriority] = useState<"high" | "medium" | "low">(
    task?.priority || "medium"
  );
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [newTag, setNewTag] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dueDateDialogOpen, setDueDateDialogOpen] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(
    task?.dueDate ? new Date(task.dueDate) : null
  );
  const [dueTime, setDueTime] = useState<string>(task?.dueTime || "12:00");
  const finalCategory = useCustomCategory
    ? `${customCategoryName} (${customCategoryColor})`
    : category;

  useEffect(() => {
    if (task?.category) {
      const customCategoryMatch = task.category.match(
        /^(.*) \((#[A-Fa-f0-9]{6})\)$/
      );
      if (customCategoryMatch) {
        setUseCustomCategory(true);
        setCustomCategoryName(customCategoryMatch[1]);
        setCustomCategoryColor(customCategoryMatch[2]);
      } else {
        setCategory(task.category);
        setUseCustomCategory(false);
      }
    }
    if (task?.priority) setPriority(task.priority);
    if (task?.tags) setTags(task.tags);
  }, [task]);

  const handleSaveDueDate = () => {
    if (!dueDate) {
      toast.error("Please select a due date!");
      return;
    }

    const [hours, minutes] = dueTime.split(":").map(Number);
    const now = new Date();
    const selectedDateTime = new Date(dueDate);
    selectedDateTime.setHours(hours, minutes);

    if (
      selectedDateTime < now &&
      selectedDateTime.toDateString() === now.toDateString()
    ) {
      toast.error("Cannot set due time in the past for today!");
      return;
    }

    toast.success(`Due date updated to: ${formatCairoTime(selectedDateTime)}`);
    setDueDate(selectedDateTime);
    setDueDateDialogOpen(false);
  };

  const handleSaveChanges = async () => {
    if (!task) return;

    if (taskName.length < 3) {
      setError("Task name must be at least 3 letters long.");
      return;
    }

    if (useCustomCategory && !customCategoryName.trim()) {
      setError("Custom category name is required!");
      return;
    }

    if (!finalCategory) {
      setError("Category is required!");
      return;
    }

    if (!priority) {
      setError("Priority is required!");
      return;
    }

    if (!dueDate) {
      setError("Due date is required!");
      return;
    }

    for (const subtask of subtasks) {
      if (!subtask.title.trim()) {
        setError("Subtask titles cannot be empty.");
        return;
      }
    }

    try {
      const isoDueDate = dueDate ? new Date(dueDate).toISOString() : null;

      await updateTaskMutation({
        id: task._id as Id<"tasks">,
        name: taskName,
        description,
        dueDate: isoDueDate || undefined,
        dueTime,
        tags,
        subtasks: subtasks.map((subtask) => ({
          title: subtask.title.trim(),
          isCompleted: subtask.isCompleted,
        })),
        priority,
        category: finalCategory,
      });

      toast.success("Task updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task.");
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    setIsDeleting(true);
    try {
      await deleteTaskMutation({ id: task._id as Id<"tasks"> });
      toast.success("Task deleted successfully!");
      onClose();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddTag = () => {
    if (tags.length >= 3 || !newTag.trim()) {
      toast.error("You can add up to 3 tags.");
      return;
    }
    setTags([...tags, newTag.trim()]);
    setNewTag("");
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleAddSubtask = () => {
    if (subtasks.length >= MAX_SUBTASKS) {
      toast.error("You can add up to 3 subtasks.");
      return;
    }
    setSubtasks([...subtasks, { title: "", isCompleted: false }]);
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index].title = value;
    setSubtasks(newSubtasks);
  };

  const handleSubtaskCompletionChange = (index: number) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index].isCompleted = !newSubtasks[index].isCompleted;
    setSubtasks(newSubtasks);
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const getTaskStatus = (): "In Progress" | "Pending" | "Done" => {
    if (task?.isCompleted) return "Done";

    const now = new Date();
    const dueDateTime = dueDate ? new Date(dueDate) : null;

    if (dueDateTime && now > dueDateTime) return "Pending";

    return "In Progress";
  };

  const taskStatus = getTaskStatus();

  if (!task) return null;

  return (
    <>
      <Dialog open={!!task} onOpenChange={onClose}>
        <DialogContent className="p-6 xl:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Edit Task -
              <span
                className={`px-2 py-1 rounded text-sm ${
                  taskStatus === "Done"
                    ? "bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100"
                    : taskStatus === "Pending"
                      ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100"
                      : "bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-100"
                }`}
              >
                {taskStatus}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-3">
            <Label>Task name</Label>
            <Input
              placeholder="Task name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
            <Label>Task description</Label>
            <Textarea
              placeholder="Task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => setDueDateDialogOpen(true)}
            >
              Set Due Date
              <CalendarDays />
            </Button>
            {dueDate && (
              <p className="mt-2 text-muted-foreground">
                <span>Due Date : </span>
                {dueDate &&
                  `${new Intl.DateTimeFormat("en-GB", {
                    timeZone: "Africa/Cairo",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(new Date(dueDate))} at ${new Date(
                    `${new Date(dueDate).toDateString()} ${dueTime}`
                  ).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Africa/Cairo",
                  })}`}
              </p>
            )}
            <h3 className="font-medium">Category</h3>
            <Select
              value={useCustomCategory ? "Custom" : category}
              onValueChange={(value) => {
                if (value === "Custom") {
                  setUseCustomCategory(true);
                } else {
                  setCategory(value);
                  setUseCustomCategory(false);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Sport">Sport</SelectItem>
                <SelectItem value="Reading">Reading</SelectItem>
                <SelectItem value="Learning">Learning</SelectItem>
                <SelectItem value="Worship">Worship</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {useCustomCategory && (
              <div className="w-full flex flex-col md:flex-row gap-2 sm:gap-5">
                <div className="md:w-3/4">
                  <Input
                    placeholder="Custom category name"
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                  />
                </div>
                <div className="md:w-1/4 flex items-center gap-2">
                  <label htmlFor="color" className="font-medium">
                    Category Color
                  </label>
                  <Input
                    id="color"
                    type="color"
                    className="w-8 h-8 p-0 rounded-none shadow-none border-none cursor-pointer"
                    value={customCategoryColor}
                    onChange={(e) => setCustomCategoryColor(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="w-full flex items-center gap-2">
              <div className="w-1/4">
                <h3 className="font-medium mb-1">Priority</h3>
                <Select
                  value={priority}
                  onValueChange={(value) =>
                    setPriority(value as "high" | "medium" | "low")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-3/4">
                <h3 className="font-medium mb-1">Tags</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                  />
                  <Button
                    onClick={handleAddTag}
                    disabled={tags.length >= 3 || !newTag.trim()}
                  >
                    Add Tag
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 dark:bg-[#27272a] bg-gray-200/70 px-3 py-1 rounded text-sm"
                >
                  <p>{tag}</p>
                  <button
                    onClick={() => handleRemoveTag(index)}
                    className="text-destructive"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ))}
            </div>
            <h3 className="font-medium">Subtasks</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              {subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Subtask ${index + 1}`}
                    value={subtask.title}
                    onChange={(e) => handleSubtaskChange(index, e.target.value)}
                  />
                  <Checkbox
                    checked={subtask.isCompleted}
                    className="size-8 rounded-none"
                    onCheckedChange={() => handleSubtaskCompletionChange(index)}
                  />
                  <Button
                    variant="destructive"
                    className="px-3"
                    onClick={() => handleRemoveSubtask(index)}
                  >
                    <Trash />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              onClick={handleAddSubtask}
              disabled={subtasks.length >= MAX_SUBTASKS}
            >
              Add Subtask <Plus />
            </Button>
            <p className="text-sm text-muted-foreground">
              Last updated: {timeAgo(task.createdAt)}
            </p>
            {error && (
              <div className="flex items-center text-destructive gap-2">
                <AlertTriangle className="text-destructive" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader className="animate-spin" />
                ) : (
                  "Delete Task"
                )}
              </Button>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {showDeleteConfirm && (
        <DeleteConfirmDialog
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isDeleting={isDeleting}
        />
      )}
      <Dialog open={dueDateDialogOpen} onOpenChange={setDueDateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Due Date</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 items-center">
            <Calendar
              onChange={(value) => {
                const selectedDate = value as Date;
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selectedDate < today) {
                  toast.error("Cannot select a past date!");
                  return;
                }

                setDueDate(selectedDate);
              }}
              value={dueDate}
              minDate={new Date()}
              className="dark:bg-[#121111]"
            />
            <div className="flex items-center gap-2">
              <label htmlFor="time">Time:</label>
              <Input
                id="time"
                type="time"
                value={dueTime}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value
                    .split(":")
                    .map(Number);
                  const now = new Date();
                  const selectedDateTime = new Date(dueDate || now);
                  selectedDateTime.setHours(hours, minutes);

                  if (
                    selectedDateTime < now &&
                    selectedDateTime.toDateString() === now.toDateString()
                  ) {
                    toast.error("Cannot set time in the past for today!");
                    return;
                  }

                  setDueTime(e.target.value);
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDueDateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveDueDate}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DeleteConfirmDialog({
  onConfirm,
  onCancel,
  isDeleting,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">
          Are you sure you want to delete this task?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader className="animate-spin" /> : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
