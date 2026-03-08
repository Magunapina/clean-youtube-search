<script lang="ts">
  import type { VideoItem, ChannelItem } from "./api";
  import { timeFormat } from "./settings.svelte";
  import {
    formatDuration,
    formatCount,
    formatRelativeTime,
    formatAbsoluteTime,
    formatAbsoluteDateTime,
    bestThumbnailUrl,
    getLocales,
  } from "./format";
  import playIcon from "../assets/play.svg?raw";
  import thumbsUpIcon from "../assets/thumbs-up.svg?raw";
  import personIcon from "../assets/person.svg?raw";
  import normalVideoIcon from "../assets/normal-video.svg?raw";
  import liveVideoIcon from "../assets/live-video.svg?raw";
  import archiveVideoIcon from "../assets/archive-video.svg?raw";
  import upcomingVideoIcon from "../assets/upcoming-video.svg?raw";

  interface Props {
    video: VideoItem;
    channel?: ChannelItem;
  }

  let { video, channel }: Props = $props();

  let thumbnailUrl = $derived(bestThumbnailUrl(video.snippet?.thumbnails));
  let channelIconUrl = $derived(
    channel?.snippet?.thumbnails?.default?.url ?? "",
  );
  let duration = $derived(
    video.contentDetails?.duration
      ? formatDuration(video.contentDetails.duration)
      : "",
  );
  let lang = $derived(
    video.snippet?.defaultLanguage ||
      video.snippet?.defaultAudioLanguage ||
      undefined,
  );
  let channelLang = $derived(
    channel?.snippet?.defaultLanguage ||
      video.snippet?.defaultLanguage ||
      video.snippet?.defaultAudioLanguage ||
      undefined,
  );
  let broadcastStatus = $derived(video.snippet?.liveBroadcastContent);
  let broadcastLabel = $derived.by(() => {
    switch (broadcastStatus) {
      case "live":
        return "LIVE";
      case "upcoming":
        return "UPCOMING";
      default:
        return null;
    }
  });
  let displayDate = $derived.by(() => {
    if (broadcastStatus === "upcoming")
      return video.liveStreamingDetails?.scheduledStartTime;
    if (broadcastStatus === "live" || video.liveStreamingDetails?.actualEndTime)
      return video.liveStreamingDetails?.actualStartTime;
    return video.snippet?.publishedAt;
  });
  let displayViewCount = $derived.by(() => {
    if (broadcastStatus === "upcoming") return undefined;
    if (broadcastStatus === "live")
      return video.liveStreamingDetails?.concurrentViewers ?? "0";
    return video.statistics?.viewCount;
  });
</script>

<div
  class="group flex w-full flex-col gap-2 transition-colors lg:flex-row lg:gap-3 lg:p-2"
>
  <!-- Thumbnail -->
  <a
    href="https://www.youtube.com/watch?v={video.id}"
    target="_blank"
    rel="noopener noreferrer"
    class="relative aspect-video shrink-0 overflow-hidden bg-neutral-700 outline-none focus-visible:ring-2 focus-visible:ring-red-500 lg:w-2/5 lg:self-start lg:rounded-lg"
  >
    {#if thumbnailUrl}
      <img
        src={thumbnailUrl}
        alt={video.snippet?.title ?? ""}
        class="h-full w-full object-cover"
        loading="lazy"
      />
    {/if}

    {#if duration && broadcastStatus !== "live" && broadcastStatus !== "upcoming"}
      <span
        class="absolute right-1.5 bottom-1.5 rounded bg-black/80 px-1.5 py-0.5 text-sm leading-tight font-medium tracking-wide text-neutral-100"
        >{duration}</span
      >
    {:else if broadcastLabel}
      <span
        class="absolute right-1.5 bottom-1.5 rounded px-1.5 py-0.5 text-sm font-medium tracking-wider text-white uppercase {broadcastStatus ===
        'live'
          ? 'bg-red-600'
          : 'bg-blue-600'}"
      >
        {broadcastLabel}
      </span>
    {/if}
  </a>

  <!-- Info -->
  <div
    class="flex min-w-0 flex-col px-4 pt-0.5 text-base font-medium text-neutral-400 lg:px-0"
  >
    <a
      href="https://www.youtube.com/watch?v={video.id}"
      target="_blank"
      rel="noopener noreferrer"
      class="w-fit outline-none focus-visible:underline"
      {lang}
    >
      <h3
        class="line-clamp-2 text-lg leading-snug font-medium text-neutral-100"
      >
        {video.snippet?.title ?? "Untitled"}
      </h3>
    </a>

    <div class="mt-2 flex items-center gap-2">
      {#if channelIconUrl}
        <a
          href="https://www.youtube.com/channel/{channel?.id ||
            video.snippet?.channelId}"
          target="_blank"
          rel="noopener noreferrer"
          class="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          aria-label="Visit channel"
        >
          <img
            src={channelIconUrl}
            alt=""
            class="h-12 w-12 rounded-full"
            loading="lazy"
          />
        </a>
      {/if}
      <div class="flex min-w-0 flex-col">
        <div class="flex flex-wrap items-center gap-3" lang={getLocales()?.[0]}>
          <span
            class="inline-flex h-5 w-5 shrink-0 items-center justify-center {broadcastStatus ===
            'live'
              ? 'text-red-600'
              : broadcastStatus === 'upcoming'
                ? 'text-blue-600'
                : video.liveStreamingDetails?.actualEndTime
                  ? 'text-amber-600'
                  : 'text-neutral-600'} [&>svg]:h-full [&>svg]:w-full"
            aria-label={broadcastStatus === "live"
              ? "Live"
              : broadcastStatus === "upcoming"
                ? "Upcoming"
                : video.liveStreamingDetails?.actualEndTime
                  ? "Archive"
                  : "Normal"}
            role="img"
          >
            {@html broadcastStatus === "live"
              ? liveVideoIcon
              : broadcastStatus === "upcoming"
                ? upcomingVideoIcon
                : video.liveStreamingDetails?.actualEndTime
                  ? archiveVideoIcon
                  : normalVideoIcon}
          </span>

          {#if displayDate}
            <span>
              {#if broadcastStatus === "upcoming"}
                {formatAbsoluteDateTime(displayDate)}
              {:else if broadcastStatus === "live"}
                {formatRelativeTime(displayDate)}
              {:else if timeFormat.value === "relative"}
                {formatRelativeTime(displayDate)}
              {:else}
                {formatAbsoluteTime(displayDate)}
              {/if}
            </span>
          {/if}
          {#if displayViewCount != null}
            <span class="inline-flex items-center gap-0.5"
              ><span class="inline-block h-4 w-4 [&>svg]:h-full [&>svg]:w-full"
                >{@html broadcastStatus === "live"
                  ? personIcon
                  : playIcon}</span
              >
              {formatCount(displayViewCount)}</span
            >
          {/if}
          <span class="inline-flex items-center gap-0.5"
            ><span class="inline-block h-4 w-4 [&>svg]:h-full [&>svg]:w-full"
              >{@html thumbsUpIcon}</span
            >
            {video.statistics?.likeCount
              ? formatCount(video.statistics.likeCount)
              : "N/A"}</span
          >
        </div>
        <a
          href="https://www.youtube.com/channel/{channel?.id ||
            video.snippet?.channelId}"
          target="_blank"
          rel="noopener noreferrer"
          class="w-fit truncate transition-colors outline-none hover:text-neutral-300 focus-visible:underline"
          lang={channelLang}
        >
          {channel?.snippet?.title ?? video.snippet?.channelTitle ?? "Unknown"}
        </a>
      </div>
    </div>

    {#if video.snippet?.description}
      <div class="hidden lg:mt-4 lg:block" {lang}>
        <p class="line-clamp-3 text-sm leading-relaxed font-normal">
          {video.snippet.description}
        </p>
      </div>
    {/if}
  </div>
</div>
