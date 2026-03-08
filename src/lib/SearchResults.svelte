<script lang="ts">
  import type { VideoItem, ChannelItem } from "./api";
  import VideoCard from "./VideoCard.svelte";
  import Pagination from "./Pagination.svelte";
  import searchIcon from "../assets/search.svg?raw";
  import alertCircleIcon from "../assets/alert-circle.svg?raw";

  interface Props {
    videos: VideoItem[];
    channelMap: Map<string, ChannelItem>;
    hasSearched: boolean;
    errorMessage: string;
    errorStatus: number;
    isSearching: boolean;
    pageIndex: number;
    hasNextPage: boolean;
    totalResults?: number;
    resultsPerPage?: number;
    sidebarOpen: boolean;
    onnext: () => void;
    onprev: () => void;
  }

  let {
    videos,
    channelMap,
    hasSearched,
    errorMessage,
    errorStatus,
    isSearching,
    pageIndex,
    hasNextPage,
    totalResults,
    resultsPerPage,
    sidebarOpen,
    onnext,
    onprev,
  }: Props = $props();

  let mainRef = $state<HTMLElement>();

  export function scrollToTop() {
    mainRef?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }
</script>

<main
  bind:this={mainRef}
  class="min-w-0 flex-1 bg-neutral-900 lg:mx-auto lg:max-w-7xl lg:overflow-y-auto"
  class:max-lg:hidden={sidebarOpen}
>
  {#if errorMessage}
    <!-- Error display -->
    <div
      class="flex h-full flex-col items-center justify-center p-6 text-center"
    >
      <span
        class="mb-4 block h-16 w-16 text-red-600 [&>svg]:h-full [&>svg]:w-full"
        >{@html alertCircleIcon}</span
      >
      {#if errorStatus}
        <p class="mb-2 text-2xl font-medium text-red-600">
          Error {errorStatus}
        </p>
      {/if}
      <p class="mb-4 max-w-md text-xl text-neutral-100">{errorMessage}</p>
    </div>
  {:else if hasSearched && videos.length === 0}
    <!-- No results -->
    <div
      class="flex h-full flex-col items-center justify-center p-6 text-center"
    >
      <span class="mb-3 block h-12 w-12 [&>svg]:h-full [&>svg]:w-full"
        >{@html searchIcon}</span
      >
      <p class="text-2xl">No results found.</p>
      <p class="mt-1 text-xl">Try adjusting your search filters.</p>
    </div>
  {:else if hasSearched}
    <!-- Results list -->
    <div class="grid grid-cols-1 gap-4 px-0 pb-4 lg:gap-0 lg:p-4">
      {#each videos as video (video.id)}
        <VideoCard
          {video}
          channel={channelMap.get(video.snippet?.channelId ?? "")}
        />
      {/each}
    </div>
    <Pagination
      {pageIndex}
      hasNext={hasNextPage}
      {isSearching}
      {totalResults}
      {resultsPerPage}
      {onnext}
      {onprev}
    />
  {:else}
    <!-- Initial empty state (desktop) -->
    <div class="hidden h-full flex-col items-center justify-center p-6 lg:flex">
      <span class="mb-3 block h-12 w-12 [&>svg]:h-full [&>svg]:w-full"
        >{@html searchIcon}</span
      >
      <p class="text-2xl">No results yet.</p>
      <p class="mt-1 text-xl">Search results will appear here.</p>
    </div>
  {/if}
</main>
