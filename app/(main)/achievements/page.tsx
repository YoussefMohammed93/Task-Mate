"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Progress } from "@/components/ui/progress";

export default function GamificationPage() {
  const userLogs = useQuery(api.user_progress.getUserLogs);
  const userProgress = useQuery(api.user_progress.getUserProgress);

  if (!userProgress || !userLogs) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  const { points, level, progress, requiredPoints } = userProgress;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Achievements</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-semibold">Level: {level}</h2>
          <p className="text-lg">Total Points: {points}</p>
          <p className="text-lg">Points in Current Level: {progress}</p>
          <p className="text-sm text-muted-foreground">
            Points to Next Level:{" "}
            <span className="font-semibold">{requiredPoints - progress}</span>
          </p>
        </div>
        <div className="mt-6">
          <Progress
            value={(progress / requiredPoints) * 100}
            className="h-4 rounded-lg bg-gray-200"
          />
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {progress}/{requiredPoints}
          </p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Point History</h2>
        {userLogs.length === 0 ? (
          <p className="text-sm text-gray-500">No point logs available.</p>
        ) : (
          <ul className="bg-white shadow-md rounded-lg p-4 divide-y">
            {userLogs.map((log) => (
              <li key={log.timestamp} className="py-2">
                <p className="text-sm">{log.description}</p>
                <p className="text-xs text-muted-foreground">
                  {log.points > 0 ? `+${log.points}` : log.points} points
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
