"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import { Textarea } from "../ui/textarea";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Plus, Trash } from "lucide-react";

export function TodayTaskDialog() {
  const addTaskMutation = useMutation(api.today.add);
  const [taskName, setTaskName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState<string>("");
  const [customCategoryColor, setCustomCategoryColor] =
    useState<string>("#000000");
  const [subtasks, setSubtasks] = useState<
    { title: string; isCompleted: boolean }[]
  >([]);

  const [priority, setPriority] = useState<"high" | "medium" | "low" | null>(
    null
  );
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");

  const handleAddTag = () => {
    if (tags.length < 3 && newTag.trim() !== "") {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    } else {
      toast.error("You can only add up to 3 tags.");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, tagIndex) => tagIndex !== index));
  };

  const handleAddSubtask = () => {
    if (subtasks.length < 3) {
      setSubtasks([...subtasks, { title: "", isCompleted: false }]);
    } else {
      toast.error("You can only add up to 3 subtasks.");
    }
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index].title = value;
    setSubtasks(newSubtasks);
  };

  const handleRemoveSubtask = (index: number) => {
    const newSubtasks = subtasks.filter(
      (_, subtaskIndex) => subtaskIndex !== index
    );
    setSubtasks(newSubtasks);
  };

  const handleAddTask = async () => {
    if (!taskName) {
      setError("Task name is required!");
      return;
    }

    for (const subtask of subtasks) {
      if (!subtask.title.trim()) {
        setError("Subtask titles cannot be empty.");
        return;
      }
    }

    if (taskName.length < 3) {
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

    try {
      setError(null);
      await addTaskMutation({
        name: taskName,
        category: finalCategory,
        description,
        subtasks,
        isCompleted: false,
        createdAt: Date.now(),
        priority,
        tags,
      });

      setTaskName("");
      setDescription("");
      setCategory(undefined);
      setUseCustomCategory(false);
      setCustomCategoryName("");
      setCustomCategoryColor("#000000");
      setSubtasks([]);
      setPriority(null);
      setTags([]);

      toast.success("Task added successfully!");
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      setError("Failed to add task.");
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          Add new task
          <Plus className="mr-2 hidden sm:block" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Task</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 sm:gap-3">
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
            onValueChange={(value) => {
              if (value === "Custom") {
                setUseCustomCategory(true);
              } else {
                setCategory(value);
                setUseCustomCategory(false);
              }
            }}
          >
            <SelectTrigger className="w-full">
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
                    type="color"
                    id="color"
                    className="w-8 h-8 p-0 rounded-none shadow-none border-none cursor-pointer"
                    value={customCategoryColor}
                    onChange={(e) => setCustomCategoryColor(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
          <div className="w-full flex gap-2">
            <div className="w-1/4">
              <h3 className="font-medium mb-1">Priority</h3>
              <Select
                onValueChange={(value) =>
                  setPriority(value as "high" | "medium" | "low")
                }
              >
                <SelectTrigger className="w-full">
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
              <div key={index} className="w-full flex gap-2 items-center">
                <Input
                  placeholder={`Subtask ${index + 1}`}
                  value={subtask.title}
                  onChange={(e) => handleSubtaskChange(index, e.target.value)}
                />
                <Button
                  variant="destructive"
                  className="px-4"
                  size="icon"
                  onClick={() => handleRemoveSubtask(index)}
                >
                  <Trash size={16} />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            className="border border-gray-300"
            onClick={handleAddSubtask}
          >
            Add Subtask <Plus />
          </Button>
          {error && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              <span className="text-destructive text-sm">{error}</span>
            </div>
          )}
          <Button onClick={handleAddTask}>
            Add Task <Plus />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
