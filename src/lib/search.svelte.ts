import { SvelteMap, SvelteDate, SvelteSet } from "svelte/reactivity";
import {
  searchYouTubeVideos,
  getVideosDetails,
  getChannelsDetails,
  ApiError,
  type SearchParams,
  type SearchResultItem,
  type VideoItem,
  type ChannelItem,
} from "./api";
import { apiKey } from "./settings.svelte";

// ── Types ────────────────────────────────────────────
export interface CachedPage {
  videos: VideoItem[];
  channelMap: Map<string, ChannelItem>;
  nextPageToken?: string;
  prevPageToken?: string;
  totalResults?: number;
  resultsPerPage?: number;
}

export interface SearchFormState {
  keyword: string;
  channelId: string;
  order: SearchParams["order"];
  videoDuration: SearchParams["videoDuration"];
  eventType: SearchParams["eventType"] | "";
  publishedAfter: string;
  publishedBefore: string;
  relevanceLanguage: string;
  videoDimension: SearchParams["videoDimension"];
  videoLicense: SearchParams["videoLicense"];
  safeSearch: SearchParams["safeSearch"];
}

// ── Search state ─────────────────────────────────────
export function createSearchState() {
  let videos = $state<VideoItem[]>([]);
  const channelMap = new SvelteMap<string, ChannelItem>();
  let hasSearched = $state(false);
  let errorMessage = $state("");
  let errorStatus = $state(0);
  let nextPageToken = $state<string | undefined>(undefined);
  let prevPageToken = $state<string | undefined>(undefined);
  let totalResults = $state<number | undefined>(undefined);
  let resultsPerPage = $state<number | undefined>(undefined);
  let pageIndex = $state(0);
  const pageCache = new SvelteMap<number, CachedPage>();
  const pageTokens = new SvelteMap<number, string>();
  pageTokens.set(0, "");
  let isSearching = $state(false);

  function applyPage(page: CachedPage) {
    videos = page.videos;
    channelMap.clear();
    for (const [k, v] of page.channelMap) channelMap.set(k, v);
    nextPageToken = page.nextPageToken;
    prevPageToken = page.prevPageToken;
    totalResults = page.totalResults;
    resultsPerPage = page.resultsPerPage;
  }

  async function fetchPage(
    form: SearchFormState,
    formRef: HTMLFormElement | undefined,
    targetPageIndex: number = 0,
  ) {
    if (!apiKey.value || !form.keyword) return;

    if (formRef && !formRef.checkValidity()) {
      formRef.reportValidity();
      return;
    }

    const cached = pageCache.get(targetPageIndex);
    if (cached) {
      applyPage(cached);
      pageIndex = targetPageIndex;
      return;
    }

    const pageToken = pageTokens.get(targetPageIndex);
    if (pageToken === undefined) {
      console.error(
        `Cannot fetch page ${targetPageIndex} without a known token. Resetting to 0.`,
      );
      return fetchPage(form, formRef, 0);
    }

    isSearching = true;
    errorMessage = "";
    errorStatus = 0;

    try {
      const params: SearchParams = {
        q: form.keyword,
        order: form.order,
        safeSearch: form.safeSearch,
        videoDimension: form.videoDimension,
        videoDuration: form.videoDuration,
        videoLicense: form.videoLicense,
        channelId: form.channelId || undefined,
        eventType: form.eventType || undefined,
        relevanceLanguage: form.relevanceLanguage || undefined,

        publishedAfter: form.publishedAfter
          ? new SvelteDate(form.publishedAfter).toISOString()
          : undefined,

        publishedBefore: form.publishedBefore
          ? new SvelteDate(form.publishedBefore).toISOString()
          : undefined,
        pageToken: pageToken || undefined,
      };

      const searchResult = await searchYouTubeVideos(apiKey.value, params);

      const videoIds = (searchResult.items ?? [])
        .map((item: SearchResultItem) => item.id?.videoId)
        .filter((v): v is string => Boolean(v));

      const channelIds = [
        ...new SvelteSet(
          (searchResult.items ?? [])
            .map((item: SearchResultItem) => item.snippet?.channelId)
            .filter((v): v is string => Boolean(v)),
        ),
      ];

      const [videosResult, channelsResult] = await Promise.all([
        getVideosDetails(apiKey.value, videoIds),
        getChannelsDetails(apiKey.value, channelIds),
      ]);

      const page: CachedPage = {
        videos: videosResult.items,
        channelMap: new SvelteMap(
          channelsResult.items.map((ch) => [ch.id, ch]),
        ),
        nextPageToken: searchResult.nextPageToken,
        prevPageToken: searchResult.prevPageToken,
        totalResults: searchResult.pageInfo?.totalResults,
        resultsPerPage: searchResult.pageInfo?.resultsPerPage,
      };

      if (searchResult.nextPageToken) {
        pageTokens.set(targetPageIndex + 1, searchResult.nextPageToken);
      }

      pageCache.set(targetPageIndex, page);
      applyPage(page);
      pageIndex = targetPageIndex;
      hasSearched = true;
    } catch (e) {
      if (e instanceof ApiError) {
        errorStatus = e.status;
        errorMessage = e.message;
      } else {
        errorStatus = 0;
        errorMessage =
          e instanceof Error ? e.message : "An unknown error occurred.";
      }
      hasSearched = true;
      videos = [];
      channelMap.clear();
    } finally {
      isSearching = false;
    }
  }

  function resetCache() {
    pageCache.clear();
    pageTokens.clear();
    pageTokens.set(0, "");
    pageIndex = 0;
  }

  function resetAll() {
    videos = [];
    channelMap.clear();
    hasSearched = false;
    errorMessage = "";
    errorStatus = 0;
    nextPageToken = undefined;
    prevPageToken = undefined;
    totalResults = undefined;
    resultsPerPage = undefined;
    pageIndex = 0;
    pageCache.clear();
    pageTokens.clear();
    pageTokens.set(0, "");
    isSearching = false;
  }

  return {
    get videos() {
      return videos;
    },
    get channelMap() {
      return channelMap;
    },
    get hasSearched() {
      return hasSearched;
    },
    get errorMessage() {
      return errorMessage;
    },
    get errorStatus() {
      return errorStatus;
    },
    get nextPageToken() {
      return nextPageToken;
    },
    get prevPageToken() {
      return prevPageToken;
    },
    get totalResults() {
      return totalResults;
    },
    get resultsPerPage() {
      return resultsPerPage;
    },
    get pageIndex() {
      return pageIndex;
    },
    set pageIndex(v: number) {
      pageIndex = v;
    },
    get isSearching() {
      return isSearching;
    },
    fetchPage,
    resetCache,
    resetAll,
  };
}
