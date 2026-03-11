export interface SearchParams {
  q: string;
  channelId?: string;
  eventType?: "live" | "completed" | "upcoming";
  order: "relevance" | "date" | "viewCount" | "rating" | "title";
  pageToken?: string;
  publishedAfter?: string; // RFC 3339
  publishedBefore?: string; // RFC 3339
  relevanceLanguage?: string; // ISO 639-1
  safeSearch: "none" | "moderate" | "strict";
  videoDimension: "any" | "2d" | "3d";
  videoDuration: "any" | "short" | "medium" | "long";
  videoLicense: "any" | "creativeCommon" | "youtube";
}

export interface SearchResultItem {
  id?: { videoId?: string };
  snippet?: { channelId?: string };
}

interface SearchResponse {
  items?: SearchResultItem[];
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo?: {
    totalResults: number;
    resultsPerPage: number;
  };
}

// ── Thumbnail ─────────────────────────────────────────
interface Thumbnail {
  url: string;
  width?: number;
  height?: number;
}

export interface Thumbnails {
  default?: Thumbnail;
  medium?: Thumbnail;
  high?: Thumbnail;
  standard?: Thumbnail;
  maxres?: Thumbnail;
}

// ── Videos ────────────────────────────────────────────
export interface VideoItem {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    channelId?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: Thumbnails;
    defaultLanguage?: string;
    defaultAudioLanguage?: string;
    liveBroadcastContent?: "live" | "upcoming" | "none";
  };
  contentDetails?: {
    duration?: string; // ISO 8601 duration
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
  liveStreamingDetails?: {
    actualStartTime?: string;
    actualEndTime?: string;
    scheduledStartTime?: string;
    concurrentViewers?: string;
  };
}

export interface VideosResponse {
  items: VideoItem[];
}

// ── Channels ──────────────────────────────────────────
export interface ChannelItem {
  id: string;
  snippet?: {
    title?: string;
    thumbnails?: Thumbnails;
    defaultLanguage?: string;
  };
}

export interface ChannelsResponse {
  items: ChannelItem[];
}

// ── API Error ─────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Common helper to call any YouTube Data API v3 endpoint.
 */
async function fetchYouTubeAPI<T>(
  endpoint: string,
  apiKey: string,
  params: Record<string, string | undefined>,
): Promise<T> {
  const entries = Object.entries({ key: apiKey, ...params }).filter(
    (entry): entry is [string, string] => Boolean(entry[1]),
  );
  const query = new URLSearchParams(entries);

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/${endpoint}?${query}`,
  );
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error?.message || `${endpoint} API request failed`,
    );
  }
  return data as T;
}

/**
 * Executes a search query using the YouTube Data API v3.
 */
export function searchYouTubeVideos(apiKey: string, params: SearchParams) {
  const {
    q,
    order,
    safeSearch,
    videoDimension,
    videoDuration,
    videoLicense,
    ...optional
  } = params;
  const filtered = Object.fromEntries(
    Object.entries(optional).filter((entry): entry is [string, string] =>
      Boolean(entry[1]),
    ),
  );
  return fetchYouTubeAPI<SearchResponse>("search", apiKey, {
    part: "snippet",
    maxResults: "50",
    type: "video",
    q,
    order,
    safeSearch,
    videoDimension,
    videoDuration,
    videoLicense,
    ...filtered,
  });
}

/**
 * Fetches detailed video information.
 */
export function getVideosDetails(apiKey: string, videoIds: string[]) {
  if (videoIds.length === 0)
    return Promise.resolve<VideosResponse>({ items: [] });

  return fetchYouTubeAPI<VideosResponse>("videos", apiKey, {
    part: "snippet,contentDetails,statistics,liveStreamingDetails",
    id: videoIds.join(","),
  });
}

/**
 * Fetches channel information.
 */
export function getChannelsDetails(apiKey: string, channelIds: string[]) {
  if (channelIds.length === 0)
    return Promise.resolve<ChannelsResponse>({ items: [] });

  return fetchYouTubeAPI<ChannelsResponse>("channels", apiKey, {
    part: "snippet",
    id: channelIds.join(","),
  });
}

/**
 * Resolves a YouTube @handle to a Channel ID.
 */
export async function getChannelIdFromHandle(
  apiKey: string,
  handle: string,
): Promise<string | null> {
  try {
    const data = await fetchYouTubeAPI<ChannelsResponse>("channels", apiKey, {
      part: "id",
      forHandle: handle,
    });
    if (data.items && data.items.length > 0 && data.items[0].id) {
      return data.items[0].id;
    }
    return null;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return null;
    }
    throw e;
  }
}
