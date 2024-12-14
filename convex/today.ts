import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    createdAt: v.number(),
    isCompleted: v.boolean(),
    description: v.optional(v.string()),
    subtasks: v.optional(
      v.array(
        v.object({
          title: v.string(),
          isCompleted: v.boolean(),
        })
      )
    ),
  },
  handler: async (
    { db },
    { name, category, createdAt, isCompleted, description, subtasks }
  ) => {
    const task = {
      name,
      category,
      createdAt,
      isCompleted,
      description,
      subtasks: subtasks || [],
    };
    return await db.insert("tasks", task);
  },
});

export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async ({ db }, { id }) => {
    return await db.delete(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    isCompleted: v.optional(v.boolean()),
    description: v.optional(v.string()),
    subtasks: v.optional(
      v.array(
        v.object({
          title: v.string(),
          isCompleted: v.boolean(),
        })
      )
    ),
  },
  handler: async (
    { db },
    { id, name, category, isCompleted, description, subtasks }
  ) => {
    const updates: Partial<{
      name: string;
      category: string;
      isCompleted: boolean;
      description?: string;
      subtasks?: { title: string; isCompleted: boolean }[];
      createdAt: number;
    }> = {};

    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (isCompleted !== undefined) updates.isCompleted = isCompleted;
    if (description !== undefined) updates.description = description;
    if (subtasks !== undefined) updates.subtasks = subtasks;

    if (name || category || description) {
      updates.createdAt = Date.now();
    }

    return await db.patch(id, updates);
  },
});

export const removeAll = mutation({
  args: {},
  handler: async ({ db }) => {
    const tasks = await db.query("tasks").collect();
    for (const task of tasks) {
      await db.delete(task._id);
    }
    return { success: true };
  },
});
