import { RequestHandler } from "express";
import { AcademicEvent, EventsResponse } from "@shared/api";
import fs from "node:fs";
import path from "node:path";

const DATA_PATH = path.resolve(process.cwd(), "server/data/events.json");

function readEvents(): AcademicEvent[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw) as AcademicEvent[];
  } catch (e) {
    return [];
  }
}

export const listEvents: RequestHandler = (req, res) => {
  const events = readEvents();
  const { month } = req.query; // YYYY-MM optional
  if (typeof month === "string" && /\d{4}-\d{2}/.test(month)) {
    const [y, m] = month.split("-").map((n) => parseInt(n, 10));
    const filtered = events.filter((e) => {
      const d = new Date(e.date + "T00:00:00");
      return d.getUTCFullYear() === y && d.getUTCMonth() + 1 === m;
    });
    const payload: EventsResponse = { events: filtered };
    res.json(payload);
    return;
  }
  const payload: EventsResponse = { events };
  res.json(payload);
};

export const streamEvents: RequestHandler = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  const send = () => {
    const payload: EventsResponse = { events: readEvents() };
    res.write(`event: events\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  // Send initial snapshot
  send();

  // Watch for file changes
  const watcher = fs.watch(DATA_PATH, { persistent: true }, () => {
    send();
  });

  // Keep connection alive
  const interval = setInterval(() => {
    res.write(`: keep-alive\n\n`);
  }, 30000);

  req.on("close", () => {
    watcher.close();
    clearInterval(interval);
  });
};
