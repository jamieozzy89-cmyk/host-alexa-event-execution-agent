const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};
const WEEKDAYS: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
};

interface LocalParts { year: number; month: number; day: number; hour: number; minute: number; weekday: number; }

function partsFor(date: Date, timezone: string): LocalParts {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    hourCycle: "h23", weekday: "long",
  });
  const entries = Object.fromEntries(formatter.formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const weekday = WEEKDAYS[(entries.weekday ?? "").toLowerCase()];
  if (!entries.year || !entries.month || !entries.day || !entries.hour || !entries.minute || weekday === undefined) throw new Error(`Unable to resolve timezone ${timezone}.`);
  return {
    year: Number(entries.year), month: Number(entries.month), day: Number(entries.day),
    hour: Number(entries.hour), minute: Number(entries.minute), weekday,
  };
}

function zonedToUtc(year: number, month: number, day: number, hour: number, minute: number, timezone: string): Date {
  const target = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  let candidate = target;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = partsFor(new Date(candidate), timezone);
    const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0, 0);
    candidate -= represented - target;
  }
  return new Date(candidate);
}

function parseTime(text: string): { hour: number; minute: number } {
  const match = text.match(/(?:\bat\s*\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b|\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b|\b(\d{1,2}):(\d{2})\b)/i);
  if (!match) return { hour: 19, minute: 0 };
  const hourText = match[1] ?? match[4] ?? match[7];
  const minuteText = match[2] ?? match[5] ?? match[8];
  const suffix = (match[3] ?? match[6])?.toLowerCase();
  if (!hourText) return { hour: 19, minute: 0 };
  let hour = Number(hourText);
  const minute = minuteText ? Number(minuteText) : 0;
  if (minute > 59 || hour > 23) return { hour: 19, minute: 0 };
  if (suffix === "pm" && hour < 12) hour += 12;
  if (suffix === "am" && hour === 12) hour = 0;
  return { hour, minute };
}

function addDays(parts: LocalParts, days: number): { year: number; month: number; day: number } {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days, 12, 0, 0));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

export function parseNaturalStartAt(text: string, now: Date, timezone: string): string | undefined {
  const trimmed = text.trim();
  const direct = Date.parse(trimmed);
  if (!Number.isNaN(direct) && /\d{4}/.test(trimmed)) return new Date(direct).toISOString();

  const lower = trimmed.toLowerCase();
  const time = parseTime(lower);
  const localNow = partsFor(now, timezone);
  let target: { year: number; month: number; day: number } | undefined;

  const isoDate = lower.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (isoDate) target = { year: Number(isoDate[1]), month: Number(isoDate[2]), day: Number(isoDate[3]) };

  if (!target) {
    const namedDate = lower.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(20\d{2}))?\b/);
    if (namedDate) {
      const month = MONTHS[namedDate[2] ?? ""];
      if (month) target = { year: namedDate[3] ? Number(namedDate[3]) : localNow.year, month, day: Number(namedDate[1]) };
    }
  }

  if (!target && /\btomorrow\b/.test(lower)) target = addDays(localNow, 1);
  if (!target && /\btoday\b/.test(lower)) target = addDays(localNow, 0);

  if (!target) {
    for (const [name, weekday] of Object.entries(WEEKDAYS)) {
      if (!new RegExp(`\\b${name}\\b`, "i").test(lower)) continue;
      let delta = (weekday - localNow.weekday + 7) % 7;
      if (delta === 0 && (localNow.hour > time.hour || (localNow.hour === time.hour && localNow.minute >= time.minute))) delta = 7;
      target = addDays(localNow, delta);
      break;
    }
  }

  if (!target) return undefined;
  const result = zonedToUtc(target.year, target.month, target.day, time.hour, time.minute, timezone);
  return Number.isNaN(result.getTime()) ? undefined : result.toISOString();
}
