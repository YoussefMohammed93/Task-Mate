"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "react-circular-progressbar/dist/styles.css";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Info, OctagonX, Pause, Play, Power } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

export default function PomodoroPage() {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const userId = user?._id;
  const createPomodoroSession = useMutation(api.pomodoro.createPomodoroSession);
  const pausePomodoroSession = useMutation(api.pomodoro.pausePomodoroSession);
  const resumePomodoroSession = useMutation(api.pomodoro.resumePomodoroSession);
  const stopPomodoroSession = useMutation(api.pomodoro.stopPomodoroSession);
  const deletePomodoroSessionAfterCompletion = useMutation(
    api.pomodoro.deletePomodoroSessionAfterCompletion
  );
  const [studyTime, setStudyTime] = useState<number>(25);
  const [breakTime, setBreakTime] = useState<number>(5);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showDadDialog, setShowDadDialog] = useState<boolean>(false);
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const pomodoroSession = useQuery(api.pomodoro.getPomodoroSession, {
    userId: userId || "",
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  console.log("pomodoroSession:", pomodoroSession);

  useEffect(() => {
    audioRef.current = new Audio("/alarm.MP3");
  }, []);

  const handleAudioPlay = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn("Audio playback failed:", err);
      });
    }
  };

  useEffect(() => {
    if (pomodoroSession) {
      if (
        !pomodoroSession.isRunning &&
        !pomodoroSession.isBreak &&
        !pomodoroSession.pausedAt
      ) {
        setIsRunning(false);
        setIsPaused(false);
        setTimeLeft(0);
        setTotalTime(0);
        return;
      }

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
        setTotalTime(totalTime);
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
        setTotalTime(totalTime);
        setIsRunning(true);
        setIsPaused(false);
      }

      setStudyTime(Math.floor(pomodoroSession.studyTime / 60));
      setBreakTime(Math.floor(pomodoroSession.breakTime / 60));
      setTimeLeft(remainingTime);
      setIsBreak(pomodoroSession.isBreak);
    }
  }, [pomodoroSession]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      clearInterval(timerRef.current as NodeJS.Timeout);

      if (!isBreak) {
        handleAudioPlay();
        setIsBreak(true);
        setTimeLeft(breakTime * 60);
        setTotalTime(breakTime * 60);
        toast.success("Time for a break!");
      } else {
        handleAudioPlay();
        setIsRunning(false);
        setTimeLeft(0);
        setTotalTime(0);
        toast.success("Pomodoro session completed!");

        if (userId) {
          deletePomodoroSessionAfterCompletion({ userId });
        }
      }
    }
    return () => clearInterval(timerRef.current as NodeJS.Timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timeLeft, isBreak, studyTime, breakTime]);

  const handleStartTimer = async () => {
    if (!userId) {
      toast.error("You must be signed in to start a Pomodoro session.");
      return;
    }

    const total = studyTime * 60;
    setTimeLeft(total);
    setTotalTime(total);
    setIsRunning(true);
    setIsBreak(false);
    setIsPaused(false);

    await createPomodoroSession({
      userId,
      name: "Pomodoro Session",
      studyTime: total,
      breakTime: breakTime * 60,
    });

    toast.success("Pomodoro session started!");
  };

  const handlePauseTimer = async () => {
    setIsPaused(true);
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (userId) {
      await pausePomodoroSession({ userId });
    } else {
      toast.error("User ID is undefined. Cannot pause session.");
    }

    toast.warning("Pomodoro session paused.");
  };

  const handleResumeTimer = async () => {
    setIsPaused(false);
    setIsRunning(true);

    if (userId) {
      await resumePomodoroSession({ userId });
    } else {
      toast.error("User ID is undefined. Cannot resume session.");
    }

    toast.success("Pomodoro session resumed!");
  };

  const handleStopTimer = async () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(0);
    setTotalTime(0);

    if (timerRef.current) clearInterval(timerRef.current);

    if (userId) {
      await stopPomodoroSession({ userId });
    } else {
      toast.error("User ID is undefined. Cannot stop session.");
    }

    toast.success("Pomodoro session stopped.");
  };

  const handleLeavePage = async () => {
    setShowDadDialog(false);
    if (isRunning || isPaused) {
      await handleStopTimer();
    }
    if (navigationTarget) router.push(navigationTarget);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  useEffect(() => {
    const handleNavigation = (url: string) => {
      if (isRunning) {
        setShowDadDialog(true);
        setNavigationTarget(url);
        return false;
      }
      return true;
    };

    const originalPush = router.push;
    router.push = (url: string) => {
      if (handleNavigation(url)) {
        originalPush(url);
      }
    };

    return () => {
      router.push = originalPush;
    };
  }, [router, isRunning]);

  const progress =
    totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  return (
    <div className="h-[90vh] sm:h-auto flex flex-col items-center justify-center px-5">
      <h1 className="flex gap-3 text-3xl sm:text-4xl font-bold font-mono mt-1">
        Pomodoro Timer
        <span>
          <HoverCard>
            <HoverCardTrigger>
              <Info className="text-muted-foreground size-5" />
            </HoverCardTrigger>
            <HoverCardContent className="text-sm" align="start">
              It is recommended not to leave the page while the Pomodoro Timer
              is running.
            </HoverCardContent>
          </HoverCard>
        </span>
      </h1>
      <p className="text-muted-foreground max-w-xl text-center pt-5">
        The Pomodoro Timer enhances focus, productivity, and time management by
        dividing tasks into work intervals with breaks. It prevents burnout,
        reduces procrastination, and supports healthy work habits.
      </p>
      <div className="pt-8">
        <CircularProgressbar
          value={progress}
          text={formatTime(timeLeft)}
          styles={buildStyles({
            textColor: "#000",
            pathColor: isBreak ? "#10b981" : "#16a34a",
            trailColor: "#d1d5db",
          })}
          className="w-48 h-48 sm:w-60 sm:h-60"
        />
      </div>
      <p className="text-xl sm:text-2xl font-medium sm:font-semibold pt-5">
        {isBreak ? "Break Time" : "Focus Time"}
      </p>
      <div className="w-full flex gap-5 max-w-md pt-5">
        <div className="flex flex-col gap-2 w-full">
          <label className="font-medium ml-0.5">Focus Time (minutes)</label>
          <Input
            type="number"
            min={1}
            value={studyTime}
            onChange={(e) => setStudyTime(Number(e.target.value))}
            disabled={isRunning || isPaused}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="font-medium ml-0.5">Break Time (minutes)</label>
          <Input
            type="number"
            min={1}
            value={breakTime}
            onChange={(e) => setBreakTime(Number(e.target.value))}
            disabled={isRunning || isPaused}
          />
        </div>
      </div>
      <div className="pt-5">
        {!isRunning && !isPaused && (
          <Button className="w-full" onClick={handleStartTimer}>
            Start Pomodoro
            <Power />
          </Button>
        )}
        <div className="w-full max-w-md flex items-center gap-5">
          {isRunning && (
            <Button className="w-full" onClick={handlePauseTimer}>
              Pause
              <Pause />
            </Button>
          )}
          {isPaused && (
            <Button className="w-full" onClick={handleResumeTimer}>
              Resume <Play />
            </Button>
          )}
          {(isRunning || isPaused) && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleStopTimer}
            >
              Stop Timer
              <OctagonX />
            </Button>
          )}
        </div>
      </div>
      <Dialog open={showDadDialog} onOpenChange={setShowDadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{"Don't leave the page!"}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            If you leave this page, the Pomodoro session will stop.
          </p>
          <div className="mt-4 flex justify-end gap-4">
            <Button onClick={() => setShowDadDialog(false)}>Stay</Button>
            <Button variant="destructive" onClick={handleLeavePage}>
              Leave and Stop Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
