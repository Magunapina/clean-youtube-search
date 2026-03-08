import type { SearchParams } from "./api";

export const ORDER_OPTIONS = [
  { v: "relevance", l: "Relevance" },
  { v: "date", l: "Date" },
  { v: "viewCount", l: "View Count" },
  { v: "rating", l: "Rating" },
  { v: "title", l: "Title" },
] as const satisfies readonly { v: SearchParams["order"]; l: string }[];

export const DURATION_OPTIONS = [
  { v: "any", l: "Any" },
  { v: "short", l: "< 4 min" },
  { v: "medium", l: "4 – 20 min" },
  { v: "long", l: "> 20 min" },
] as const satisfies readonly { v: SearchParams["videoDuration"]; l: string }[];

export const EVENT_TYPE_OPTIONS = [
  { v: "", l: "Any" },
  { v: "live", l: "Live" },
  { v: "completed", l: "Archive" },
  { v: "upcoming", l: "Upcoming" },
] as const;

export const DIMENSION_OPTIONS = [
  { v: "any", l: "Any" },
  { v: "2d", l: "2D" },
  { v: "3d", l: "3D" },
] as const satisfies readonly {
  v: SearchParams["videoDimension"];
  l: string;
}[];

export const LICENSE_OPTIONS = [
  { v: "any", l: "Any" },
  { v: "creativeCommon", l: "Creative Commons" },
  { v: "youtube", l: "Standard" },
] as const satisfies readonly { v: SearchParams["videoLicense"]; l: string }[];

export const SAFE_SEARCH_OPTIONS = [
  { v: "none", l: "None" },
  { v: "moderate", l: "Moderate" },
  { v: "strict", l: "Strict" },
] as const satisfies readonly { v: SearchParams["safeSearch"]; l: string }[];

export const TIME_FORMAT_OPTIONS = [
  { v: "relative", l: "Relative" },
  { v: "absolute", l: "Absolute" },
] as const;
