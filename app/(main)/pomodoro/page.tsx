"use client";

import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PomodoroPage() {
  const { user } = useUser();
  const userId = user?.id || "";

  const createPomodoroSession = useMutation(api.pomodoro.createPomodoroSession);
  const pausePomodoroSession = useMutation(api.pomodoro.pausePomodoroSession);
  const resumePomodoroSession = useMutation(api.pomodoro.resumePomodoroSession);
  const stopPomodoroSession = useMutation(api.pomodoro.stopPomodoroSession);
  const pomodoroSession = useQuery(api.pomodoro.getPomodoroSession, { userId });
  const [studyTime, setStudyTime] = useState<number>(50);
  const [breakTime, setBreakTime] = useState<number>(10);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (pomodoroSession) {
      const now = Date.now();
      let remainingTime = 0;

      if (pomodoroSession.pausedAt) {
        const elapsedPaused = Math.floor(
          (pomodoroSession.pausedAt - pomodoroSession.startTime) / 1000
        );
        const totalTime = pomodoroSession.isBreak
          ? pomodoroSession.breakTime
          : pomodoroSession.studyTime;

        remainingTime = totalTime - elapsedPaused;
        setIsPaused(true);
        setIsRunning(false);
      } else {
        const elapsedRunning = Math.floor(
          (now - pomodoroSession.startTime) / 1000
        );
        const totalTime = pomodoroSession.isBreak
          ? pomodoroSession.breakTime
          : pomodoroSession.studyTime;

        remainingTime = Math.max(totalTime - elapsedRunning, 0);
        setIsRunning(true);
        setIsPaused(false);
      }

      setTimeLeft(remainingTime);
      setIsBreak(pomodoroSession.isBreak);
    }
  }, [pomodoroSession]);

  const handleStartTimer = async () => {
    if (!userId) {
      toast.error("You must be signed in to start a Pomodoro session.");
      return;
    }

    setTimeLeft(studyTime * 60);
    setIsRunning(true);
    setIsBreak(false);
    setIsPaused(false);

    await createPomodoroSession({
      userId,
      name: "Pomodoro Session",
      studyTime: studyTime * 60,
      breakTime: breakTime * 60,
    });

    toast.success("Pomodoro session started!");
  };

  const handlePauseTimer = async () => {
    setIsPaused(true);
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    await pausePomodoroSession({ userId });

    toast.warning("Pomodoro session paused.");
  };

  const handleResumeTimer = async () => {
    setIsPaused(false);
    setIsRunning(true);

    await resumePomodoroSession({ userId });

    toast.success("Pomodoro session resumed!");
  };

  const handleStopTimer = async () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(0);
    if (timerRef.current) clearInterval(timerRef.current);

    await stopPomodoroSession({ userId });

    toast.warning("Pomodoro session stopped.");
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      clearInterval(timerRef.current as NodeJS.Timeout);

      const nextBreak = !isBreak;
      setIsBreak(nextBreak);
      setTimeLeft(nextBreak ? breakTime * 60 : studyTime * 60);

      toast.success(nextBreak ? "Time for a break!" : "Back to work!");

      createPomodoroSession({
        userId,
        name: "Pomodoro Session",
        studyTime: studyTime * 60,
        breakTime: breakTime * 60,
      });
    }
    return () => clearInterval(timerRef.current as NodeJS.Timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isRunning,
    timeLeft,
    isBreak,
    breakTime,
    studyTime,
    createPomodoroSession,
  ]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Pomodoro Timer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label>Study Time (mins)</label>
            <Input
              type="number"
              min={1}
              value={studyTime}
              onChange={(e) => setStudyTime(Number(e.target.value))}
              disabled={isRunning || isPaused}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label>Break Time (mins)</label>
            <Input
              type="number"
              min={1}
              value={breakTime}
              onChange={(e) => setBreakTime(Number(e.target.value))}
              disabled={isRunning || isPaused}
            />
          </div>
          {isRunning || isPaused ? (
            <div className="text-center">
              <p className="text-lg font-bold">
                {isBreak ? "Break Time" : "Study Time"}
              </p>
              <p className="text-3xl font-mono">{formatTime(timeLeft)}</p>
            </div>
          ) : null}
          {!isRunning && !isPaused && (
            <Button className="w-full" onClick={handleStartTimer}>
              Start Pomodoro
            </Button>
          )}
          {isRunning && (
            <Button className="w-full" onClick={handlePauseTimer}>
              Pause
            </Button>
          )}
          {isPaused && (
            <Button className="w-full" onClick={handleResumeTimer}>
              Resume
            </Button>
          )}
          {(isRunning || isPaused) && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleStopTimer}
            >
              Stop Timer
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
