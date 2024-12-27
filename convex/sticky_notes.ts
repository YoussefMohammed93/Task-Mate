import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("stickyNotes")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .order("asc")
      .collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    color: v.string(),
    icon: v.string(),
    position: v.object({
      x: v.number(),
      y: v.number(),
      order: v.number(),
    }),
    columnId: v.string(),
    isPinned: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { name, description, color, icon, position, columnId, isPinned }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const note = {
      name,
      description,
      color,
      icon,
      userId: identity.subject,
      position,
      columnId,
      isPinned: isPinned || false,
      createdAt: Date.now(),
      lastModified: Date.now(),
    };

    return await ctx.db.insert("stickyNotes", note);
  },
});

export const remove = mutation({
  args: {
    id: v.id("stickyNotes"),
  },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const note = await ctx.db.get(id);
    if (!note || note.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.delete(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("stickyNotes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    position: v.optional(
      v.object({
        x: v.number(),
        y: v.number(),
        order: v.number(),
      })
    ),
    columnId: v.optional(v.string()),
    isPinned: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { id, name, description, color, icon, position, columnId, isPinned }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const note = await ctx.db.get(id);
    if (!note || note.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const updates: Partial<{
      name: string;
      description: string;
      color: string;
      icon: string;
      position: {
        x: number;
        y: number;
        order: number;
      };
      columnId: string;
      isPinned: boolean;
      lastModified: number;
    }> = {};

    if (name !== undefined) updates.name = name;
    if (icon !== undefined) updates.icon = icon;
    if (color !== undefined) updates.color = color;
    if (position !== undefined) updates.position = position;
    if (columnId !== undefined) updates.columnId = columnId;
    if (isPinned !== undefined) updates.isPinned = isPinned;
    if (description !== undefined) updates.description = description;

    if (name || description || color || icon) {
      updates.lastModified = Date.now();
    }

    return await ctx.db.patch(id, updates);
  },
});

export const updateOrder = mutation({
  args: {
    notes: v.array(
      v.object({
        id: v.id("stickyNotes"),
        position: v.object({
          x: v.number(),
          y: v.number(),
          order: v.number(),
        }),
        columnId: v.string(),
      })
    ),
  },
  handler: async (ctx, { notes }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    for (const note of notes) {
      const existingNote = await ctx.db.get(note.id);
      if (!existingNote || existingNote.userId !== identity.subject) {
        throw new Error("Unauthorized");
      }

      await ctx.db.patch(note.id, {
        position: note.position,
        columnId: note.columnId,
      });
    }

    return { success: true };
  },
});

export const removeAll = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const notes = await ctx.db
      .query("stickyNotes")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    for (const note of notes) {
      await ctx.db.delete(note._id);
    }
    return { success: true };
  },
});
