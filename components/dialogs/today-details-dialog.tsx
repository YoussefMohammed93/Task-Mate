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
import { AlertTriangle, Edit, Loader, Plus, Trash } from "lucide-react";

type Task = {
  _id: string;
  name: string;
  category: string;
  createdAt: number;
  isCompleted: boolean;
  description?: string;
  subtasks?: { title: string; isCompleted: boolean }[];
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
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [customCategoryColor, setCustomCategoryColor] =
    useState<string>("#000000");
  const [subtasks, setSubtasks] = useState<
    { title: string; isCompleted: boolean }[]
  >(task?.subtasks || []);

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

    for (const subtask of subtasks) {
      if (!subtask.title.trim()) {
        setError("Subtask titles cannot be empty.");
        return;
      }
    }

    if (!task) {
      setError("No task to update.");
      return;
    }

    try {
      setError(null);
      await updateTaskMutation({
        id: task._id as Id<"tasks">,
        name: taskName.trim(),
        category: finalCategory,
        description: description.trim(),
        subtasks: subtasks.map((subtask) => ({
          title: subtask.title.trim(),
          isCompleted: subtask.isCompleted,
        })),
      });
      toast.success("Task updated successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      setError("Failed to update task.");
    }
  };

  const handleDelete = async () => {
    if (!task) {
      toast.error("No task to delete.");
      return;
    }

    try {
      setIsDeleting(true);
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

  const handleAddSubtask = () => {
    if (subtasks.length >= MAX_SUBTASKS) {
      setError(`A task can have a maximum of ${MAX_SUBTASKS} subtasks.`);
      return;
    }
    setSubtasks([...subtasks, { title: "", isCompleted: false }]);
    setError(null);
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].title = value;
    setSubtasks(updatedSubtasks);
  };

  const handleSubtaskCompletionChange = (index: number) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].isCompleted = !updatedSubtasks[index].isCompleted;
    setSubtasks(updatedSubtasks);

    toast.success(
      `Subtask ${index + 1} ${updatedSubtasks[index].isCompleted ? "completed" : "not completed"}!`
    );
  };

  const handleRemoveSubtask = (index: number) => {
    const updatedSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(updatedSubtasks);
  };

  if (!task) return null;

  return (
    <>
      <Dialog open={!!task} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Task name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
            <Textarea
              placeholder="Task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
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
              <>
                <div className="w-full flex items-center justify-between gap-2">
                  <div className="w-full md:w-4/6">
                    <Input
                      placeholder="Custom category name"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                    />
                  </div>
                  <div className="flex md:w-2/6 gap-2 items-center justify-end">
                    <label className="font-medium hidden md:block">
                      Category Color
                    </label>
                    <Input
                      type="color"
                      value={customCategoryColor}
                      className="w-8 h-8 p-0 rounded-none shadow-none border-none cursor-pointer"
                      onChange={(e) => setCustomCategoryColor(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
            <h3 className="font-medium">Subtasks</h3>
            {subtasks.map((subtask, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder={`Subtask ${index + 1}`}
                  value={subtask.title}
                  onChange={(e) => handleSubtaskChange(index, e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`subtask-checkbox-${index}`}
                    checked={subtask.isCompleted}
                    className="size-8"
                    onCheckedChange={() => handleSubtaskCompletionChange(index)}
                  />
                </div>
                <Button
                  variant="destructive"
                  className="px-4"
                  size="icon"
                  onClick={() => handleRemoveSubtask(index)}
                >
                  <Trash />
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              className="border border-gray-300"
              onClick={handleAddSubtask}
              disabled={subtasks.length >= MAX_SUBTASKS}
            >
              Add Subtask <Plus />
            </Button>
            <p className="text-muted-foreground text-sm">
              Last edited: {timeAgo(task.createdAt)}
            </p>
            {error && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-destructive" />
                <span className="text-destructive text-sm">{error}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full"
                disabled={isDeleting}
              >
                Delete Task <Trash />
              </Button>
              <Button onClick={handleSave} className="w-full">
                Save Changes <Edit />
              </Button>
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
