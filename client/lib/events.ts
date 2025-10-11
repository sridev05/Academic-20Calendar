import { AcademicEvent, EventsResponse, EventType } from "@shared/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function fetchEvents(month?: string): Promise<EventsResponse> {
  const params = new URLSearchParams();
  if (month) params.set("month", month);
  return fetch(`/api/events?${params.toString()}`).then((r) => r.json());
}

export function useEvents(monthKey?: string) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["events", monthKey ?? "all"],
    queryFn: () => fetchEvents(monthKey),
    staleTime: 30_000,
  });

  useEffect(() => {
    const es = new EventSource("/api/events/stream");
    const onMessage = (e: MessageEvent) => {
      if ((e as any).type !== "message") return; // fallback
      try {
        const parsed = JSON.parse((e as MessageEvent).data) as EventsResponse;
        qc.setQueryData(["events", monthKey ?? "all"], (old: any) => {
          if (!old) return parsed;
          // If monthKey is defined, filter; else just replace
          if (monthKey && /\d{4}-\d{2}/.test(monthKey)) {
            const [y, m] = monthKey.split("-").map((n) => parseInt(n, 10));
            const filtered = parsed.events.filter((ev) => {
              const d = new Date(ev.date + "T00:00:00");
              return d.getUTCFullYear() === y && d.getUTCMonth() + 1 === m;
            });
            return { events: filtered } satisfies EventsResponse;
          }
          return parsed;
        });
      } catch {}
    };
    es.addEventListener("events", onMessage as any);
    return () => {
      es.removeEventListener("events", onMessage as any);
      es.close();
    };
  }, [qc, monthKey]);

  return query;
}

export function colorForType(type: EventType) {
  switch (type) {
    case "holiday":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "exam":
      return "bg-red-100 text-red-700 border-red-200";
    case "semester_break":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-muted text-muted-foreground";
  }
}
