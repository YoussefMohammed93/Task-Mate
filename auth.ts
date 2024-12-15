import { Auth } from "convex/server";
import { query } from "./convex/_generated/server";

export async function getUserIdentity(ctx: { auth: Auth }) {
  return await ctx.auth.getUserIdentity();
}

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.auth.getUserIdentity();
  },
});
