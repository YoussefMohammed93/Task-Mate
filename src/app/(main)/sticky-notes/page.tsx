"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";
import { useState } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { CirclePicker } from "react-color";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { X, Pin, PinOff, Plus, GripVertical } from "lucide-react";

interface Note {
  _id: Id<"stickyNotes">;
  _creationTime: number;
  isPinned?: boolean;
  name: string;
  userId: string;
  createdAt: number;
  description: string;
  color: string;
  icon: string;
  lastModified: number;
  position: {
    x: number;
    y: number;
    order: number;
  };
  columnId: string;
}

export default function StickyNotes() {
  const queryResult = useQuery(api.sticky_notes.get);
  const notes: Note[] = queryResult || [];
  const isLoading: boolean = queryResult === undefined;
  const addNote = useMutation(api.sticky_notes.add);
  const updateNote = useMutation(api.sticky_notes.update);
  const deleteNote = useMutation(api.sticky_notes.remove);
  const updateOrder = useMutation(api.sticky_notes.updateOrder);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [draggedNoteId, setDraggedNoteId] = useState<Id<"stickyNotes"> | null>(
    null
  );
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [newNoteData, setNewNoteData] = useState({
    name: "",
    description: "",
    icon: "📝",
    color: "#f59e0b",
  });
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const sortedNotes = [
    ...notes
      .filter((note) => note.isPinned)
      .sort((a, b) => a.position.order - b.position.order),
    ...notes
      .filter((note) => !note.isPinned)
      .sort((a, b) => a.position.order - b.position.order),
  ];

  const handleDragStart = (noteId: Id<"stickyNotes">) => {
    setDraggedNoteId(noteId);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async () => {
    if (draggedNoteId === null || dragOverIndex === null) return;

    const draggedIndex = sortedNotes.findIndex(
      (note) => note._id === draggedNoteId
    );
    if (draggedIndex === dragOverIndex) return;

    const reorderedNotes = [...sortedNotes];
    const [draggedNote] = reorderedNotes.splice(draggedIndex, 1);
    reorderedNotes.splice(dragOverIndex, 0, draggedNote);

    const updates = reorderedNotes.map((note, index) => ({
      id: note._id,
      columnId: note.columnId,
      position: {
        ...note.position,
        order: index,
      },
    }));

    try {
      await updateOrder({ notes: updates });
      toast.success("Notes reordered successfully!");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to reorder notes. Please try again.");
    }

    setDraggedNoteId(null);
    setDragOverIndex(null);
  };

  const handleCreateNote = async () => {
    if (!newNoteData.name.trim()) {
      toast.error("Title is required!");
      return;
    }

    try {
      await addNote({
        name: newNoteData.name,
        description: newNoteData.description,
        color: newNoteData.color,
        icon: newNoteData.icon,
        isPinned: false,
        position: {
          x: 0,
          y: 0,
          order: notes.length,
        },
        columnId: "default",
      });
      setIsCreateDialogOpen(false);
      setNewNoteData({
        name: "",
        description: "",
        icon: "📝",
        color: "#f59e0b",
      });
      toast.success("Note created successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create note. Please try again.");
    }
  };

  const handleEditNote = async () => {
    if (!editingNote?.name.trim()) {
      toast.error("Title is required!");
      return;
    }

    try {
      await updateNote({
        id: editingNote._id,
        name: editingNote.name,
        description: editingNote.description,
        color: editingNote.color,
        icon: editingNote.icon,
      });
      setIsEditDialogOpen(false);
      setEditingNote(null);
      toast.success("Note updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update note. Please try again.");
    }
  };

  const handleDeleteNote = async (id: Id<"stickyNotes">) => {
    try {
      await deleteNote({ id });
      toast.success("Note deleted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete note. Please try again.");
    }
  };

  const handleNoteClick = (note: Note) => {
    setEditingNote(note);
    setIsEditDialogOpen(true);
  };

  const handlePinToggle = async (id: Id<"stickyNotes">, isPinned: boolean) => {
    try {
      await updateNote({ id, isPinned: !isPinned });
      toast.success(
        isPinned ? "Note unpinned successfully!" : "Note pinned successfully!"
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to pin/unpin note. Please try again.");
    }
  };

  return (
    <div className="pb-8">
      <div className="flex justify-between items-center gap-5 px-5 md:px-0 md:pr-5 mb-7">
        <h1 className="font-mono text-3xl sm:text-4xl font-semibold mt-1">
          Sticky Notes
        </h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Add Note
          <Plus size={20} />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-5 md:pl-0">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={index}
              className="w-full h-60 rounded-none bg-primary/15"
            />
          ))
        ) : sortedNotes.length === 0 ? (
          <p className="col-span-full text-lg sm:text-xl text-gray-500">
            No notes available, Create one to get started!
          </p>
        ) : (
          sortedNotes.map((note, index) => (
            <div
              key={note._id}
              draggable
              onDragStart={() => handleDragStart(note._id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
              style={{
                backgroundColor: note.color,
                opacity: draggedNoteId === note._id ? 0.5 : 1,
              }}
              className={`relative cursor-pointer p-12 drop-shadow-2xl md:-rotate-2 transition-all duration-300 ${
                dragOverIndex === index ? "scale-105" : "md:hover:scale-[1.05]"
              }`}
              onClick={() => handleNoteClick(note)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-2xl flex items-center gap-2">
                  {note.icon}
                </div>
                <GripVertical
                  size={32}
                  className="absolute p-1 top-2 left-1.5 text-white hover:bg-white/15"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePinToggle(note._id, note.isPinned ?? false);
                    }}
                    className="text-white hover:bg-white/15 p-1.5 absolute top-1.5 right-10"
                  >
                    {note.isPinned ? <Pin size={20} /> : <PinOff size={20} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note._id);
                    }}
                    className="text-white hover:bg-white/15 p-1 absolute top-1.5 right-1.5"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              <h3 className="text-3xl font-semibold my-4 text-white">
                {note.name}
              </h3>
              <p className="text-white/80 line-clamp-2">{note.description}</p>
            </div>
          ))
        )}
      </div>

      {isCreateDialogOpen && (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Create Note</DialogTitle>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Title"
                value={newNoteData.name}
                onChange={(e) =>
                  setNewNoteData({ ...newNoteData, name: e.target.value })
                }
              />
              <Textarea
                placeholder="Description"
                value={newNoteData.description}
                onChange={(e) =>
                  setNewNoteData({
                    ...newNoteData,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold">Select Icon</p>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                  >
                    {newNoteData.icon}
                  </Button>
                </div>
                {isEmojiPickerOpen && (
                  <div className="absolute z-10">
                    <Picker
                      data={data}
                      onEmojiSelect={(emoji: { native: string }) => {
                        setNewNoteData({ ...newNoteData, icon: emoji.native });
                        setIsEmojiPickerOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Select Color</p>
                <CirclePicker
                  color={newNoteData.color}
                  className="bg-gray-100 rounded-sm border border-gray-300 p-6 dark:border-gray-700 dark:bg-[#202020]"
                  styles={{ default: { card: { width: "80%" } } }}
                  onChangeComplete={(color) =>
                    setNewNoteData({ ...newNoteData, color: color.hex })
                  }
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="destructive"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateNote}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {editingNote && (
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={() => setIsEditDialogOpen(false)}
        >
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Edit Note</DialogTitle>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Title"
                value={editingNote.name}
                onChange={(e) =>
                  setEditingNote({ ...editingNote, name: e.target.value })
                }
              />
              <Textarea
                placeholder="Description"
                value={editingNote.description}
                onChange={(e) =>
                  setEditingNote({
                    ...editingNote,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
              <div>
                <p className="mb-2 text-sm font-semibold">Select Icon</p>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                >
                  {editingNote.icon}
                </Button>
                {isEmojiPickerOpen && (
                  <div className="absolute z-10">
                    <Picker
                      data={data}
                      onEmojiSelect={(emoji: { native: string }) => {
                        setEditingNote({ ...editingNote, icon: emoji.native });
                        setIsEmojiPickerOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Select Color</p>
                <CirclePicker
                  color={editingNote.color}
                  className="bg-gray-100 rounded-sm border border-gray-300 p-6 dark:border-gray-700 dark:bg-[#202020]"
                  styles={{ default: { card: { width: "80%" } } }}
                  onChangeComplete={(color) =>
                    setEditingNote({ ...editingNote, color: color.hex })
                  }
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="destructive"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditNote}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
