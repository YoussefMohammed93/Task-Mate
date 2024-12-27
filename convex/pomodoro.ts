import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getPomodoroSession = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pomodoro")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const createPomodoroSession = mutation({
  args: {
    name: v.string(),
    userId: v.string(),
    studyTime: v.number(),
    breakTime: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("pomodoro", {
      name: args.name,
      userId: args.userId,
      createdAt: Date.now(),
      studyTime: args.studyTime,
      breakTime: args.breakTime,
      startTime: Date.now(),
      isRunning: true,
      isBreak: false,
      timeLeft: args.studyTime,
    });
  },
});

export const updatePomodoroSession = mutation({
  args: {
    userId: v.string(),
    timeLeft: v.number(),
    isRunning: v.boolean(),
    isBreak: v.boolean(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("pomodoro")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        timeLeft: args.timeLeft,
        isRunning: args.isRunning,
        isBreak: args.isBreak,
      });
    }
  },
});

export const pausePomodoroSession = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("pomodoro")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", args.userId).eq("isRunning", true)
      )
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        isRunning: false,
        pausedAt: Date.now(),
      });
    }
  },
});

export const resumePomodoroSession = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("pomodoro")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", args.userId).eq("isRunning", false)
      )
      .first();

    if (session) {
      const now = Date.now();
      const pausedDuration = now - (session.pausedAt || session.startTime);

      await ctx.db.patch(session._id, {
        isRunning: true,
        startTime: session.startTime + pausedDuration,
        pausedAt: undefined,
      });
    }
  },
});

export const stopPomodoroSession = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("pomodoro")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const deletePomodoroSessionAfterCompletion = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const session = await ctx.db
      .query("pomodoro")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (session) {
      const now = Date.now();
      const elapsedTime = Math.floor((now - session.startTime) / 1000);
      const totalTime = session.studyTime + session.breakTime;

      if (elapsedTime >= totalTime) {
        await ctx.db.delete(session._id);

        const progress = await ctx.db
          .query("userProgress")
          .withIndex("by_user_id", (q) => q.eq("userId", userId))
          .first();

        const newPoints = (progress?.points || 0) + 10;
        const newLevel = Math.floor(newPoints / 100);

        if (progress) {
          await ctx.db.patch(progress._id, {
            points: newPoints,
            level: newLevel,
            updatedAt: Date.now(),
          });
        } else {
          await ctx.db.insert("userProgress", {
            userId,
            points: newPoints,
            level: newLevel,
            updatedAt: Date.now(),
          });
        }
      }
    }
  },
});
