import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  tasks: defineTable({
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
  }),
});
