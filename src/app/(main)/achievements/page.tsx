"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "../../../../convex/_generated/api";
import { ChevronDown, ChevronUp, Loader } from "lucide-react";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function AchievementsPage() {
  const initialLogsToShow = 5;
  const [isExpanded, setIsExpanded] = useState(false);
  const userLogs = useQuery(api.user_progress.getUserLogs);
  const userProgress = useQuery(api.user_progress.getUserProgress);

  if (!userProgress || !userLogs) {
    return (
      <div className="w-full h-[90vh] flex items-center justify-center">
        <Loader className="animate-spin size-6" />
      </div>
    );
  }

  const { points, level, progress, requiredPoints } = userProgress;
  const logsToDisplay = isExpanded
    ? userLogs
    : userLogs.slice(0, initialLogsToShow);

  return (
    <>
      <div className="mt-2">
        <h1 className="font-mono text-3xl sm:text-4xl font-semibold pl-5 md:pl-0">
          Achievements
        </h1>
        <div className="mt-5 px-5 md:px-0 md:pr-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-start gap-3 bg-[#f9f9f9] border dark:bg-secondary p-5 rounded-lg shadow-sm dark:border-zinc-700">
              <h2 className="text-xl font-bold">Level</h2>
              <p className="w-full text-7xl text-center font-bold text-primary">
                {level}
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 bg-[#f9f9f9] border dark:bg-secondary p-5 rounded-lg shadow-sm dark:border-zinc-700">
              <h2 className="text-xl font-bold">Total points</h2>
              <p className="w-full text-7xl text-center font-bold text-primary">
                {points}
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 bg-[#f9f9f9] border dark:bg-secondary p-5 rounded-lg shadow-sm dark:border-zinc-700">
              <h2 className="text-xl font-bold">Points in current level</h2>
              <p className="w-full text-7xl text-center font-bold text-primary">
                {progress}
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 bg-[#f9f9f9] border dark:bg-secondary p-5 rounded-lg shadow-sm dark:border-zinc-700">
              <h2 className="text-xl font-bold">Points to next level</h2>
              <p className="w-full text-7xl text-center font-bold text-primary">
                {requiredPoints - progress}
              </p>
            </div>
          </div>
          <div className="my-8">
            <h1 className="font-mono text-3xl sm:text-4xl font-semibold pb-5">
              Level progress
            </h1>
            <Progress
              value={(progress / requiredPoints) * 100}
              className="h-4"
            />
            <p className="mt-3 text-2xl font-semibold">
              {progress} / {requiredPoints}
            </p>
          </div>
        </div>
        {userLogs.length > 0 && (
          <div className="mt-8">
            <h1 className="font-mono text-3xl sm:text-4xl font-semibold pb-4 pl-5 md:pl-0">
              Points history
            </h1>
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <div className="pl-5 md:pl-0 pr-5">
                <table className="table-auto w-full text-left">
                  <thead className="bg-[#f1f1f1] dark:bg-secondary text-primary">
                    <tr className="border dark:border-zinc-700">
                      <th className="px-4 py-3 text-sm font-bold border-x dark:border-x-zinc-700">
                        Description
                      </th>
                      <th className="px-4 py-3 text-sm font-bold border-x dark:border-x-zinc-700">
                        Points
                      </th>
                      <th className="px-4 py-3 text-sm font-bold border-x dark:border-x-zinc-700">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#f9f9f9] dark:bg-[#282828]">
                    {logsToDisplay.map((log) => (
                      <tr key={log.timestamp} className="hover:bg-card/50">
                        <td className="px-4 py-3 text-lg font-medium dark:border-zinc-700">
                          {log.description}
                        </td>
                        <td
                          className={`px-4 py-3 font-bold dark:border-zinc-700 ${
                            log.points === -10
                              ? "text-destructive"
                              : "text-primary"
                          }`}
                        >
                          {log.points > 0 ? `+${log.points}` : log.points}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground dark:border-zinc-700">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 mb-8 text-center">
                {userLogs.length > initialLogsToShow && (
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="secondary"
                      className="mt-2 px-6 py-2 flex items-center justify-center gap-2 border dark:border-zinc-700"
                    >
                      {isExpanded ? (
                        <>
                          Show Less <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Show More <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                )}
              </div>
            </Collapsible>
          </div>
        )}
      </div>
      <div className="mt-12 px-5 md:px-0 md:pr-5 pb-6">
        <h1 className="font-mono text-3xl sm:text-4xl font-semibold pb-2">
          FAQ
        </h1>
        <Accordion type="single" collapsible>
          <AccordionItem value="q1">
            <AccordionTrigger className="text-lg font-semibold">
              What is the purpose of the achievements page?
            </AccordionTrigger>
            <AccordionContent>
              The achievements page helps you track your progress, view your
              points, and stay motivated as you level up.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger className="text-lg font-semibold">
              How are points calculated?
            </AccordionTrigger>
            <AccordionContent>
              Points are calculated based on your activities and contributions.
              Each action rewards a specific number of points, which contribute
              to your level progress.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3">
            <AccordionTrigger className="text-lg font-semibold">
              How can I view more points history?
            </AccordionTrigger>
            <AccordionContent>
              {
                "Click the ' Show More ' button to expand the list and view additional point history entries."
              }
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
