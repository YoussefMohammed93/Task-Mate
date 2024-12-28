import { query } from "./_generated/server";

export const getLeaderboard = query({
  handler: async (ctx) => {
    const allUsers = await ctx.db
      .query("userProgress")
      .withIndex("by_points")
      .order("desc")
      .collect();

    const top10Users = allUsers.slice(0, 20);

    const userDetails = await Promise.all(
      top10Users.map(async (entry) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_user_id")
          .filter((q) => q.eq(q.field("userId"), entry.userId))
          .first();
        return {
          ...entry,
          firstName: user?.firstName ?? "Anonymous",
          lastName: user?.lastName ?? "User",
          imageUrl: user?.imageUrl ?? "/avatar.png",
        };
      })
    );

    return {
      leaderboard: userDetails,
      totalUsers: allUsers.length,
    };
  },
});
