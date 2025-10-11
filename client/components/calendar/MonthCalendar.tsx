import { AcademicEvent, EventType } from "@shared/api";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { colorForType } from "@/lib/events";

export interface MonthCalendarProps {
  monthDate: Date; // any day within the month
  events: AcademicEvent[];
  filter: "all" | EventType;
  onSelectDate?: (date: Date, events: AcademicEvent[]) => void;
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthCalendar({
  monthDate,
  events,
  filter,
  onSelectDate,
}: MonthCalendarProps) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);

  const eventsByDate = new Map<string, AcademicEvent[]>();
  for (const ev of events) {
    if (filter !== "all" && ev.type !== filter) continue;
    const key = ev.date;
    const arr = eventsByDate.get(key) ?? [];
    arr.push(ev);
    eventsByDate.set(key, arr);
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 text-xs sm:text-sm text-muted-foreground mb-2">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="px-2 py-1 text-center font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate.get(key) ?? [];
          const inMonth = isSameMonth(day, monthStart);
          return (
            <button
              key={key}
              onClick={() => onSelectDate?.(day, dayEvents)}
              className={cn(
                "group flex flex-col rounded-md border px-1.5 py-1.5 sm:px-2 sm:py-2 min-h-20 sm:min-h-28 bg-card hover:shadow-md transition-shadow text-left",
                inMonth ? "" : "opacity-50",
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "text-sm sm:text-base font-semibold",
                    isSameDay(day, new Date()) ? "text-primary" : "",
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border px-1 py-0.5 text-[10px] sm:text-xs",
                      colorForType(ev.type),
                    )}
                  >
                    <span className="truncate">{ev.name}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] sm:text-xs text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function EventTypeLegend() {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <Badge className="border-blue-200 bg-blue-100 text-blue-700">
        Holiday
      </Badge>
      <Badge className="border-red-200 bg-red-100 text-red-700">Exam</Badge>
      <Badge className="border-green-200 bg-green-100 text-green-700">
        Semester Break
      </Badge>
    </div>
  );
}
