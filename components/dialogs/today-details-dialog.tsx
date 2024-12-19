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
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Loader, Plus, Trash } from "lucide-react";

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
  const updateTaskMutation = useMutation(api.today.update);
  const deleteTaskMutation = useMutation(api.today.remove);
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

  const handleSave = async () => {
    if (!taskName.trim()) {
      setError("Task name is required!");
      return;
    }

    if (taskName.trim().length < 3) {
      setError("Task name must be at least 3 letters long.");
      return;
    }

    const finalCategory = useCustomCategory
      ? `${customCategoryName} (${customCategoryColor})`
      : category;

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

    for (const subtask of subtasks) {
      if (!subtask.title.trim()) {
        setError("Subtask titles cannot be empty.");
        return;
      }
    }

    try {
      setError(null);
      await updateTaskMutation({
        id: task!._id as Id<"tasks">,
        name: taskName.trim(),
        category: finalCategory,
        description: description.trim(),
        subtasks: subtasks.map((subtask) => ({
          title: subtask.title.trim(),
          isCompleted: subtask.isCompleted,
        })),
        priority,
        tags,
      });
      toast.success("Task updated successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      setError("Failed to update task.");
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
      console.error(error);
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

  if (!task) return null;

  return (
    <>
      <Dialog open={!!task} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Task name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
            <Textarea
              placeholder="Task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
                  className="flex items-center gap-3 bg-gray-200/70 px-3 py-1 rounded-full text-sm"
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
                    className="size-7 rounded-none"
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
              <Button onClick={handleSave}>Save Changes</Button>
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
