import type { Thumbnails } from "./api";

export function getLocales(): string[] | undefined {
  if (typeof navigator !== "undefined" && navigator.languages?.length) {
    return navigator.languages as string[];
  }
  return undefined;
}

/**
 * Formats an ISO 8601 duration (e.g. "PT1H2M3S") into a human-readable string.
 */
export function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return iso;

  const h = parseInt(match[1] || "0", 10);
  const m = parseInt(match[2] || "0", 10);
  const s = parseInt(match[3] || "0", 10);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Formats a view/like count with locale-appropriate separators.
 */
export function formatCount(count: string | undefined): string {
  if (count === undefined || count === null) return "0";
  return new Intl.NumberFormat(getLocales(), { notation: "compact" }).format(
    Number(count),
  );
}

let rtf: Intl.RelativeTimeFormat;
function getRtf() {
  if (!rtf) {
    rtf = new Intl.RelativeTimeFormat(getLocales(), { numeric: "auto" });
  }
  return rtf;
}

/**
 * Returns a relative time string using Intl.RelativeTimeFormat.
 */
export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return getRtf().format(-sec, "second");
  const min = Math.floor(sec / 60);
  if (min < 60) return getRtf().format(-min, "minute");
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return getRtf().format(-hrs, "hour");
  const days = Math.floor(hrs / 24);
  if (days < 30) return getRtf().format(-days, "day");
  const mon = Math.floor(days / 30);
  if (mon < 12) return getRtf().format(-mon, "month");
  return getRtf().format(-Math.floor(days / 365), "year");
}

/**
 * Formats a date as a locale string.
 */
export function formatAbsoluteTime(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(getLocales(), {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a date as a locale string with time (hour and minute).
 */
export function formatAbsoluteDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString(getLocales(), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Picks the highest resolution thumbnail URL available.
 */
export function bestThumbnailUrl(thumbnails: Thumbnails | undefined): string {
  if (!thumbnails) return "";
  return (
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    ""
  );
}
