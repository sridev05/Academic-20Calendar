import { AcademicEvent, EventType } from "@shared/api";
import { useMemo, useState } from "react";
import { addMonths, format } from "date-fns";
import { MonthCalendar, EventTypeLegend } from "@/components/calendar/MonthCalendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useEvents } from "@/lib/events";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

export default function Index() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filter, setFilter] = useState<"all" | EventType>("all");
  const monthKey = useMemo(() => format(currentMonth, "yyyy-MM"), [currentMonth]);
  const { data } = useEvents(monthKey);

  const [selected, setSelected] = useState<{ date: Date; items: AcademicEvent[] } | null>(null);

  const monthsOptions = useMemo(() => {
    const base = new Date();
    const arr: { key: string; label: string; date: Date }[] = [];
    for (let i = -6; i <= 6; i++) {
      const d = addMonths(base, i);
      arr.push({ key: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy"), date: d });
    }
    return arr;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2 text-primary font-extrabold text-xl">
            <CalendarDays className="h-6 w-6" />
            Campus Calendar
          </div>
          <div className="text-sm text-muted-foreground">Academic Portal</div>
        </div>
      </header>

      <main className="container mx-auto py-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl sm:text-2xl">{format(currentMonth, "MMMM yyyy")}</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Select value={monthKey} onValueChange={(v) => {
                  const found = monthsOptions.find((m) => m.key === v);
                  if (found) setCurrentMonth(found.date);
                }}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthsOptions.map((m) => (
                      <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="holiday">Holidays</SelectItem>
                    <SelectItem value="exam">Exams</SelectItem>
                    <SelectItem value="semester_break">Semester Breaks</SelectItem>
                  </SelectContent>
                </Select>
                <EventTypeLegend />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
              <MonthCalendar
                monthDate={currentMonth}
                events={data?.events ?? []}
                filter={filter}
                onSelectDate={(d, items) => setSelected({ date: d, items })}
              />
              <SheetContent side="right" className="sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>{selected ? format(selected.date, "EEEE, MMM d, yyyy") : ""}</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {selected?.items.length ? (
                    selected.items.map((ev) => (
                      <div key={ev.id} className="rounded-lg border p-4 bg-card shadow-sm">
                        <div className="text-sm text-muted-foreground">{ev.type.replace("_", " ")}</div>
                        <div className="font-semibold text-foreground mt-1">{ev.name}</div>
                        {ev.description && <div className="text-sm mt-1">{ev.description}</div>}
                        <div className="text-sm mt-2"><span className="font-medium">Timings:</span> {ev.startTime ?? "--:--"} - {ev.endTime ?? "--:--"}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No events for this date.</div>
                  )}
                </div>
              </SheetContent>
              <SheetTrigger asChild></SheetTrigger>
            </Sheet>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Campus Calendar
      </footer>
    </div>
  );
}
