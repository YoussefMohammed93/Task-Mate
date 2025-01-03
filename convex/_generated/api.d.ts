/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as http from "../http.js";
import type * as leaderboard from "../leaderboard.js";
import type * as pomodoro from "../pomodoro.js";
import type * as sticky_notes from "../sticky_notes.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";
import type * as user_progress from "../user_progress.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  http: typeof http;
  leaderboard: typeof leaderboard;
  pomodoro: typeof pomodoro;
  sticky_notes: typeof sticky_notes;
  tasks: typeof tasks;
  users: typeof users;
  user_progress: typeof user_progress;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
