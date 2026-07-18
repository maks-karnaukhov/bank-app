import { useEffect, useMemo, useState } from "react";

export function useRetryTime(retryAt?: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!retryAt) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [retryAt]);

  return useMemo(() => {
    if (!retryAt) return null;

    const diff = Math.max(
      0,
      new Date(retryAt).getTime() - now
    );

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);

    let formatted = "";

    if (hours > 0) {
      formatted += `${hours}h`;
    }

    if (minutes > 0) {
      if (formatted) formatted += " ";
      formatted += `${minutes}m`;
    }

    if (!formatted) {
      formatted = "less than 1 minute";
    }

    return {
      hours,
      minutes,
      formatted,
    };
  }, [retryAt, now]);
}