"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Loader } from "lucide-react";
import { useQuery } from "convex/react";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { api } from "../../../../convex/_generated/api";

export default function AchievementsPage() {
  const userProgress = useQuery(api.user_progress.getUserProgress);

  const [motivationalSentences, setMotivationalSentences] = useState<string[]>(
    []
  );
  const [randomMotivationalSentence, setRandomMotivationalSentence] =
    useState<string>("");

  useEffect(() => {
    async function fetchMotivationalSentences() {
      const response = await fetch("/motivational_sentences.json");
      const data = await response.json();
      setMotivationalSentences(data.motivational_sentences);
      setRandomMotivationalSentence(
        data.motivational_sentences[
          Math.floor(Math.random() * data.motivational_sentences.length)
        ]
      );
    }

    fetchMotivationalSentences();
  }, []);

  if (!userProgress) {
    return (
      <div className="w-full h-[90vh] flex items-center justify-center">
        <Loader className="animate-spin size-6" />
      </div>
    );
  }

  const { points, level, progress, requiredPoints } = userProgress;

  return (
    <>
      <div className="mt-2">
        <h1 className="font-mono text-3xl sm:text-4xl font-semibold">
          Achievements
        </h1>
        <div className="mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
      </div>
      {motivationalSentences.length > 0 && (
        <div className="flex flex-col items-center sm:items-start gap-3 bg-[#f9f9f9] border dark:bg-secondary p-5 rounded-lg shadow-sm dark:border-zinc-700">
          <h1 className="font-mono text-3xl sm:text-4xl font-semibold pb-4">
            Motivational Quote
          </h1>
          <p className="text-xl text-center font-semibold text-primary">
            <q>{randomMotivationalSentence}</q>
          </p>
        </div>
      )}
      <div className="mt-6 pb-6">
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
              For every task you complete, you get 10 points.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
