import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    userId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    tasks: v.optional(v.array(v.id("tasks"))),
  }).index("by_user_id", ["userId"]),

  tasks: defineTable({
    name: v.string(),
    category: v.string(),
    userId: v.string(),
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
    dueDate: v.optional(v.string()),
    dueTime: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  stickyNotes: defineTable({
    name: v.string(),
    description: v.string(),
    color: v.string(),
    icon: v.string(),
    userId: v.string(),
    createdAt: v.number(),
    lastModified: v.number(),
    position: v.object({
      x: v.number(),
      y: v.number(),
      order: v.number(),
    }),
    columnId: v.string(),
    isPinned: v.optional(v.boolean()),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_and_column", ["userId", "columnId", "position.order"]),

  pomodoro: defineTable({
    name: v.string(),
    userId: v.string(),
    createdAt: v.number(),
    studyTime: v.number(),
    breakTime: v.number(),
    startTime: v.number(),
    timeLeft: v.number(),
    isRunning: v.boolean(),
    isBreak: v.boolean(),
    pausedAt: v.optional(v.number()),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_and_status", ["userId", "isRunning"]),

  userProgress: defineTable({
    userId: v.string(),
    points: v.number(),
    level: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_points", ["points"]),

  userProgressLogs: defineTable({
    userId: v.string(),
    points: v.number(),
    description: v.string(),
    timestamp: v.number(),
  }).index("by_user_id", ["userId"]),
});
