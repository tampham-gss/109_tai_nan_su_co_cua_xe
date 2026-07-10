export function datesInRange(startDate: string, endDate: string): string[] {
  if (!startDate || !endDate || startDate > endDate) return [];

  const dates: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00`);
  const last = new Date(`${endDate}T00:00:00`);

  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

const VI_DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

export function formatViDate(isoDate: string): string {
  if (!isoDate) return "";

  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;

  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

export function parseViDate(viDate: string): string | null {
  const match = viDate.trim().match(VI_DATE_PATTERN);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function currentWeekDateRange(): { startDate: string; endDate: string } {
  const today = new Date("2026-07-09T00:00:00");
  const start = new Date(today);
  start.setDate(today.getDate() - 6);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: today.toISOString().slice(0, 10),
  };
}

export function currentMonthDateRange(): { startDate: string; endDate: string } {
  return {
    startDate: "2026-07-01",
    endDate: "2026-07-09",
  };
}
