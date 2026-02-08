import "./styles.css";
import React, { useState, useEffect, useCallback } from "react";

/* ── Timezone config ──────────────────────────────────────── */
const ZONES = {
  brisbane: {
    id: "brisbane",
    tz: "Australia/Brisbane",
    city: "Brisbane",
    region: "Queensland, Australia",
    emoji: "\uD83E\uDD98",
  },
  reno: {
    id: "reno",
    tz: "America/Los_Angeles",
    city: "Reno",
    region: "Nevada, USA",
    emoji: "\uD83C\uDFB0",
  },
};

const VIEWS = [
  { key: "brisbane", label: "Brisbane" },
  { key: "reno", label: "Reno" },
  { key: "both", label: "Both" },
];

/* ── Helpers ──────────────────────────────────────────────── */
function getTimeParts(tz) {
  const now = new Date();

  const timeFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const dayFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = timeFmt.formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value || "";

  // Figure out if the date in this tz is today, tomorrow, or yesterday
  // relative to the user's local date
  const localDay = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const remoteDay = dayFmt.format(now);

  const localDate = new Date(localDay);
  const remoteDate = new Date(remoteDay);
  const diffDays = Math.round((remoteDate - localDate) / 86400000);

  let dayLabel = null;
  if (diffDays === 0) dayLabel = "today";
  else if (diffDays === 1) dayLabel = "tomorrow";
  else if (diffDays === -1) dayLabel = "yesterday";

  return {
    hours: get("hour"),
    minutes: get("minute"),
    seconds: get("second"),
    ampm: get("dayPeriod"),
    date: dateFmt.format(now),
    dayLabel,
  };
}

/* ── Clock Card Component ─────────────────────────────────── */
function ClockCard({ zone }) {
  const [time, setTime] = useState(() => getTimeParts(zone.tz));

  const tick = useCallback(() => {
    setTime(getTimeParts(zone.tz));
  }, [zone.tz]);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <div className="clock-card">
      <div className="city-label">
        <span className="city-emoji">{zone.emoji}</span>
        <span className="city-name">{zone.city}</span>
      </div>
      <div className="city-region">{zone.region}</div>

      <div className="time-display">
        <span className="hours">{time.hours}</span>
        <span className="colon">:</span>
        <span className="minutes">{time.minutes}</span>
        <span className="seconds">{time.seconds}</span>
        <span className="ampm">{time.ampm}</span>
      </div>

      <div className="date-display">{time.date}</div>

      {time.dayLabel && (
        <div className={`day-indicator ${time.dayLabel}`}>
          <span className="day-dot" />
          {time.dayLabel === "today"
            ? "Same day as you"
            : time.dayLabel === "tomorrow"
            ? "Tomorrow for you"
            : "Yesterday for you"}
        </div>
      )}
    </div>
  );
}

/* ── App ──────────────────────────────────────────────────── */
export default function App() {
  const [view, setView] = useState("both");

  const zones = view === "both" ? [ZONES.brisbane, ZONES.reno] : [ZONES[view]];

  return (
    <div className="app">
      <header className="header">
        <h1>Bret & Natalie's Totally Awesome World Clock</h1>
        <p>Brisbane &amp; Reno</p>
      </header>

      <div className="selector-wrapper">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            className={`selector-btn ${view === v.key ? "active" : ""}`}
            onClick={() => setView(v.key)}
          >
            {v.key === "brisbane" && "\uD83E\uDD98 "}
            {v.key === "reno" && "\uD83C\uDFB0 "}
            {v.key === "both" && "\uD83C\uDF0F "}
            {v.label}
          </button>
        ))}
      </div>

      <div className="clocks-container" key={view}>
        {zones.map((z) => (
          <ClockCard key={z.id} zone={z} />
        ))}
      </div>

      <footer className="footer">Live local time</footer>
    </div>
  );
}
