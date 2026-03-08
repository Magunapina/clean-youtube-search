<script lang="ts">
  import type { SearchParams } from "./lib/api";
  import { createSearchState, type SearchFormState } from "./lib/search.svelte";
  import SearchSidebar from "./lib/SearchSidebar.svelte";
  import SearchResults from "./lib/SearchResults.svelte";
  import menuIcon from "./assets/menu.svg?raw";

  // ── Search form state ───────────────────────────────
  let keyword = $state("");
  let channelId = $state("");
  let order = $state<SearchParams["order"]>("relevance");
  let videoDuration = $state<SearchParams["videoDuration"]>("any");
  let eventType = $state<SearchParams["eventType"] | "">("");
  let publishedAfter = $state("");
  let publishedBefore = $state("");
  let relevanceLanguage = $state("");
  let videoDimension = $state<SearchParams["videoDimension"]>("any");
  let videoLicense = $state<SearchParams["videoLicense"]>("any");
  let safeSearch = $state<SearchParams["safeSearch"]>("none");
  let formRef = $state<HTMLFormElement>();

  // ── Results state ───────────────────────────────────
  const search = createSearchState();
  let resultsRef: SearchResults;

  // ── Mobile layout state ─────────────────────────────
  let sidebarOpen = $state(true);

  // ── Keyboard shortcuts ──────────────────────────────
  function onGlobalKeydown(e: KeyboardEvent) {
    const active = document.activeElement;
    const isInputActive =
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      active instanceof HTMLSelectElement;

    if (isInputActive) return;

    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "/") {
      e.preventDefault();
      document.getElementById("search-input")?.focus();
    } else if (e.key === "ArrowLeft") {
      goPrevPage();
    } else if (e.key === "ArrowRight") {
      goNextPage();
    }
  }

  function getFormState(): SearchFormState {
    return {
      keyword,
      channelId,
      order,
      videoDuration,
      eventType,
      publishedAfter,
      publishedBefore,
      relevanceLanguage,
      videoDimension,
      videoLicense,
      safeSearch,
    };
  }

  function handleFieldUpdate(field: string, value: string) {
    switch (field) {
      case "keyword":
        keyword = value;
        break;
      case "channelId":
        channelId = value;
        break;
      case "order":
        order = value as SearchParams["order"];
        break;
      case "videoDuration":
        videoDuration = value as SearchParams["videoDuration"];
        break;
      case "eventType":
        eventType = value as SearchParams["eventType"] | "";
        break;
      case "publishedAfter":
        publishedAfter = value;
        break;
      case "publishedBefore":
        publishedBefore = value;
        break;
      case "relevanceLanguage":
        relevanceLanguage = value;
        break;
      case "videoDimension":
        videoDimension = value as SearchParams["videoDimension"];
        break;
      case "videoLicense":
        videoLicense = value as SearchParams["videoLicense"];
        break;
      case "safeSearch":
        safeSearch = value as SearchParams["safeSearch"];
        break;
    }
  }

  async function handleSearch() {
    search.resetCache();
    await search.fetchPage(getFormState(), formRef);
    sidebarOpen = false;
    resultsRef?.scrollToTop();
  }

  async function goNextPage() {
    if (!search.nextPageToken) return;
    search.pageIndex++;
    await search.fetchPage(getFormState(), formRef, search.nextPageToken);
    resultsRef?.scrollToTop();
  }

  async function goPrevPage() {
    if (!search.prevPageToken && search.pageIndex === 0) return;
    search.pageIndex--;
    if (search.pageIndex === 0) {
      await search.fetchPage(getFormState(), formRef);
    } else {
      await search.fetchPage(getFormState(), formRef, search.prevPageToken);
    }
    resultsRef?.scrollToTop();
  }
</script>

<svelte:window onkeydown={onGlobalKeydown} />

<div
  class="flex min-h-screen bg-neutral-950 text-base font-medium text-neutral-100 antialiased lg:h-screen"
>
  <!-- Hamburger button (mobile only, after search) -->
  {#if search.hasSearched}
    <button
      class="fixed right-5 bottom-20 z-50 flex items-center justify-center rounded-full bg-red-600 transition-colors hover:bg-red-500 lg:hidden"
      style="width: 3.25rem; height: 3.25rem;"
      onclick={() => {
        sidebarOpen = !sidebarOpen;
        window.scrollTo(0, 0);
      }}
      aria-label="Toggle sidebar"
    >
      <span class="h-6 w-6 text-white [&>svg]:h-full [&>svg]:w-full">
        {@html menuIcon}
      </span>
    </button>
  {/if}

  <SearchSidebar
    {keyword}
    {channelId}
    {order}
    {videoDuration}
    {eventType}
    {publishedAfter}
    {publishedBefore}
    {relevanceLanguage}
    {videoDimension}
    {videoLicense}
    {safeSearch}
    isSearching={search.isSearching}
    hasSearched={search.hasSearched}
    {sidebarOpen}
    bind:formRef
    onupdate={handleFieldUpdate}
    onsearch={handleSearch}
  />

  <SearchResults
    bind:this={resultsRef}
    videos={search.videos}
    channelMap={search.channelMap}
    hasSearched={search.hasSearched}
    errorMessage={search.errorMessage}
    errorStatus={search.errorStatus}
    isSearching={search.isSearching}
    pageIndex={search.pageIndex}
    hasNextPage={!!search.nextPageToken}
    totalResults={search.totalResults}
    resultsPerPage={search.resultsPerPage}
    {sidebarOpen}
    onnext={goNextPage}
    onprev={goPrevPage}
  />
</div>
