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
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();
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
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (
    ctx,
    {
      name,
      category,
      createdAt,
      isCompleted,
      description,
      subtasks,
      priority,
      tags,
    }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const task = {
      name,
      category,
      userId: identity.subject,
      createdAt,
      isCompleted,
      description,
      subtasks: subtasks || [],
      priority,
      tags: tags || [],
    };
    return await ctx.db.insert("tasks", task);
  },
});

export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const task = await ctx.db.get(id);
    if (!task || task.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.delete(id);
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
    priority: v.optional(
      v.union(v.literal("high"), v.literal("medium"), v.literal("low"))
    ),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (
    ctx,
    { id, name, category, isCompleted, description, subtasks, priority, tags }
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const task = await ctx.db.get(id);
    if (!task || task.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const updates: Partial<{
      name: string;
      category: string;
      isCompleted: boolean;
      description?: string;
      subtasks?: { title: string; isCompleted: boolean }[];
      priority: "high" | "medium" | "low";
      tags: string[];
      createdAt: number;
    }> = {};

    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (isCompleted !== undefined) updates.isCompleted = isCompleted;
    if (description !== undefined) updates.description = description;
    if (subtasks !== undefined) updates.subtasks = subtasks;
    if (priority !== undefined) updates.priority = priority;
    if (tags !== undefined) updates.tags = tags;

    if (name || category || description) {
      updates.createdAt = Date.now();
    }

    return await ctx.db.patch(id, updates);
  },
});

export const removeAll = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }
    return { success: true };
  },
});
