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
    title: v.string(),
    description: v.string(),
    isCompleted: v.boolean(),
    userId: v.id("users"),
  }).index("by_user_id", ["userId"]),
});
