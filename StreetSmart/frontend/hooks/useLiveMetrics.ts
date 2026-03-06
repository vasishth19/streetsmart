// ─── hooks/useLiveMetrics.ts ──────────────────────────────────────

import { useState, useEffect, useRef } from 'react';

export interface LiveMetrics {
  active_users:      number;
  routes_generated:  number;
  safety_reports:    number;
  reviews_submitted: number;
  routes_per_minute: number;
  online_cities:     number;
}

const BASE: LiveMetrics = {
  active_users:      1893,
  routes_generated:  2744,
  safety_reports:    138,
  reviews_submitted: 92,
  routes_per_minute: 4,
  online_cities:     12,
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useLiveMetrics(pollInterval = 5000) {
  const [metrics, setMetrics]   = useState<LiveMetrics>(BASE);
  const [connected, setConnected] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const fetchMetrics = async () => {
    try {
      const res  = await fetch(`${API}/metrics/live`);
      const data = await res.json();
      setMetrics(data);
      setConnected(true);
    } catch {
      // Simulate live ticks in demo mode
      setMetrics((prev) => ({
        ...prev,
        active_users:     prev.active_users     + Math.floor(Math.random() * 3 - 1),
        routes_generated: prev.routes_generated + Math.floor(Math.random() * 4),
        routes_per_minute: 3 + Math.floor(Math.random() * 4),
      }));
      setConnected(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    timerRef.current = setInterval(fetchMetrics, pollInterval);
    return () => clearInterval(timerRef.current);
  }, [pollInterval]);

  return { metrics, connected };
}