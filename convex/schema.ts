import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
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
  }).index("by_user", ["userId"]),

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
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "isRunning"]),
});
