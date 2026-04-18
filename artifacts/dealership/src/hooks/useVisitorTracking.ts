import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

const SESSION_KEY = "ae_session_id";
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min

function getSessionId(): string {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const { id, ts } = JSON.parse(raw);
      if (id && ts && Date.now() - ts < SESSION_TTL_MS) {
        // Refresh timestamp
        localStorage.setItem(SESSION_KEY, JSON.stringify({ id, ts: Date.now() }));
        return id;
      }
    }
  } catch {}
  const id = (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id, ts: Date.now() }));
  return id;
}

export function useVisitorTracking() {
  const [location] = useLocation();
  const enterRef = useRef<number>(Date.now());
  const lastPathRef = useRef<string>("");

  useEffect(() => {
    if (location.startsWith("/admin")) return;
    if (location === lastPathRef.current) return;

    const sessionId = getSessionId();

    // Send duration for previous page
    const prevDuration = Math.floor((Date.now() - enterRef.current) / 1000);
    if (lastPathRef.current && prevDuration > 0 && prevDuration < 1800) {
      try {
        navigator.sendBeacon?.("/api/track/duration", new Blob([JSON.stringify({ sessionId, durationSeconds: prevDuration })], { type: "application/json" }));
      } catch {}
    }

    // Track new page
    fetch("/api/track/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        path: location,
        title: document.title,
        referrer: document.referrer || null,
      }),
    }).catch(() => {});

    enterRef.current = Date.now();
    lastPathRef.current = location;

    // Track car page
    const carMatch = location.match(/^\/cars\/([^/?]+)/);
    if (carMatch) {
      const slug = carMatch[1];
      fetch(`/api/cars/by-slug/${encodeURIComponent(slug)}`)
        .then(r => r.ok ? r.json() : null)
        .then(c => {
          if (c?.id) {
            fetch("/api/track/car", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId, carId: c.id }),
            }).catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, [location]);
}

export function getCurrentSessionId(): string {
  return getSessionId();
}
