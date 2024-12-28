import { query } from "./_generated/server";

export const getUserProgress = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .first();

    if (!progress) {
      return {
        points: 0,
        level: 1,
        progress: 0,
        requiredPoints: 20,
      };
    }

    const {
      level,
      progress: levelProgress,
      requiredPoints,
    } = calculateLevel(progress.points);

    return {
      points: progress.points,
      level,
      progress: levelProgress,
      requiredPoints,
    };
  },
});

function calculateLevel(points: number): {
  level: number;
  progress: number;
  requiredPoints: number;
} {
  const increment = 10;
  const basePoints = 20;

  let level = 1;
  let cumulativePoints = 0;
  let nextLevelPoints = basePoints;

  while (points >= cumulativePoints + nextLevelPoints) {
    cumulativePoints += nextLevelPoints;
    level++;
    nextLevelPoints = basePoints + increment * (level - 1);
  }

  const progress = points - cumulativePoints;
  const requiredPoints = nextLevelPoints;

  return { level, progress, requiredPoints };
}
