/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export type EventType = "holiday" | "exam" | "semester_break";

export interface AcademicEvent {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  name: string;
  description?: string;
  type: EventType;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
}

export interface EventsResponse {
  events: AcademicEvent[];
}
