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
import { Plus, Trash } from "lucide-react";
import React, { useState } from "react";
import { Textarea } from "../ui/textarea";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TodayTaskDialog() {
  const addTaskMutation = useMutation(api.today.add);
  const [taskName, setTaskName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [subtasks, setSubtasks] = useState<
    { title: string; isCompleted: boolean }[]
  >([]);

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

  // Remove subtask at the given index
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

    if (!category) {
      setError("Category is required!");
      return;
    }

    try {
      setError(null);
      await addTaskMutation({
        name: taskName,
        category,
        description,
        subtasks,
        isCompleted: false,
        createdAt: Date.now(),
      });

      setTaskName("");
      setDescription("");
      setCategory(undefined);
      setSubtasks([]);

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
          <Plus className="mr-2 hidden sm:block" />
          Add new task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Task</DialogTitle>
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
          <h3>Category</h3>
          <Select onValueChange={(value) => setCategory(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Sport">Sport</SelectItem>
              <SelectItem value="Reading">Reading</SelectItem>
              <SelectItem value="Learning">Learning</SelectItem>
              <SelectItem value="Worship">Worship</SelectItem>
            </SelectContent>
          </Select>

          <h3>Subtasks</h3>
          {subtasks.map((subtask, index) => (
            <div key={index} className="flex gap-2 items-center">
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
          <Button variant="outline" onClick={handleAddSubtask}>
            Add Subtask <Plus />
          </Button>
          {subtasks.length === 3 && (
            <p className="text-sm text-muted-foreground">
              You can only add up to 3 subtasks.
            </p>
          )}
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button onClick={handleAddTask}>
            Add Task <Plus />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
