// hooks/useLiveMatchClock.ts
import { useEffect, useState } from "react";

type MatchStatus =
  | "Not Started"
  | "Live First Half"
  | "Half Time"
  | "Live Second Half"
  | "Full Time"
  | "Extra Time"
  | "Penalties";

interface UseLiveMatchClockOptions {
  startTime: Date | null;
  isLive: boolean;
  extraTime?: number;
}

interface MatchClock {
  minute: number;
  phase: MatchStatus;
  startClock: () => void;
  stopClock: () => void;
  resetClock: () => void;
}

export default function useLiveMatchClock({
  startTime,
  isLive,
  extraTime = 0,
}: UseLiveMatchClockOptions): MatchClock {
  const [minute, setMinute] = useState(0);
  const [phase, setPhase] = useState<MatchStatus>("Not Started");
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [half, setHalf] = useState<1 | 2>(1);

  const startClock = () => {
    if (!intervalId && isLive) {
      const id = setInterval(() => {
        setMinute((prev) => prev + 1);
      }, 60000);
      setIntervalId(id);
      setPhase(half === 1 ? "Live First Half" : "Live Second Half");
    }
  };

  const stopClock = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const resetClock = () => {
    setMinute(0);
    setHalf(1);
    setPhase("Not Started");
    stopClock();
  };

  useEffect(() => {
    if (!isLive) {
      stopClock();
      return;
    }

    if (startTime) {
      const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000);
      setMinute(elapsed);
      if (elapsed < 45) {
        setPhase("Live First Half");
        setHalf(1);
      } else if (elapsed < 60) {
        setPhase("Half Time");
        setHalf(2);
      } else if (elapsed < 90 + extraTime) {
        setPhase("Live Second Half");
        setHalf(2);
      } else {
        setPhase("Full Time");
        stopClock();
      }
    }

    startClock();
    return () => stopClock();
  }, [startTime, isLive]);

  useEffect(() => {
    if (phase === "Live First Half" && minute >= 45) {
      setPhase("Half Time");
      stopClock();
      setTimeout(() => {
        setHalf(2);
        setMinute(46);
        setPhase("Live Second Half");
        startClock();
      }, 1000);
    }

    if (phase === "Live Second Half" && minute >= 90 + extraTime) {
      setPhase("Full Time");
      stopClock();
    }
  }, [minute, phase]);

  return {
    minute,
    phase,
    startClock,
    stopClock,
    resetClock,
  };
}
