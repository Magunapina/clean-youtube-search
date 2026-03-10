<script lang="ts">
  import type { SearchParams } from "./lib/api";
  import { createSearchState, type SearchFormState } from "./lib/search.svelte";
  import SearchSidebar from "./lib/SearchSidebar.svelte";
  import SearchResults from "./lib/SearchResults.svelte";
  import menuIcon from "./assets/menu.svg?raw";
  import { onMount } from "svelte";

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
  let searchedKeyword = $state("");

  function loadStateFromUrl() {
    const params = new URLSearchParams(window.location.search);

    // Reset to defaults first to handle deleted keys during history pop
    keyword = "";
    channelId = "";
    order = "relevance";
    videoDuration = "any";
    eventType = "";
    publishedAfter = "";
    publishedBefore = "";
    relevanceLanguage = "";
    videoDimension = "any";
    videoLicense = "any";
    safeSearch = "none";

    for (const [key, value] of params.entries()) {
      handleFieldUpdate(key === "q" ? "keyword" : key, value);
    }
  }

  onMount(() => {
    loadStateFromUrl();

    if (keyword || channelId) {
      // Small delay to ensure form bindings are ready
      // Seed initial history state so popping back to page 0 works securely
      window.history.replaceState({ pageIndex: 0 }, "", window.location.href);
      setTimeout(() => search.fetchPage(getFormState(), formRef, 0), 0);
    }
  });

  function onPopState(e: PopStateEvent) {
    loadStateFromUrl();
    if (keyword || channelId) {
      const targetPageIndex = e.state?.pageIndex ?? 0;
      search.fetchPage(getFormState(), formRef, targetPageIndex);
      searchedKeyword = keyword; // Restore tab title
    } else {
      search.resetAll();
      searchedKeyword = "";
    }
  }

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

  async function handleSearch(pushHistory = true) {
    search.resetCache();

    const state = getFormState();
    const defaults: Record<string, string> = {
      order: "relevance",
      videoDuration: "any",
      videoDimension: "any",
      videoLicense: "any",
      safeSearch: "none",
    };

    if (pushHistory) {
      // Update URL with current form state
      // eslint-disable-next-line
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(state)) {
        if (value && value !== defaults[key]) {
          params.set(key === "keyword" ? "q" : key, String(value));
        }
      }

      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.pushState({ pageIndex: 0 }, "", newUrl);
    }

    await search.fetchPage(state, formRef, 0);
    searchedKeyword = state.keyword;
    sidebarOpen = false;
    resultsRef?.scrollToTop();
  }

  async function goNextPage() {
    if (!search.nextPageToken) return;
    const targetIndex = search.pageIndex + 1;
    window.history.pushState(
      { pageIndex: targetIndex },
      "",
      window.location.href,
    );
    await search.fetchPage(getFormState(), formRef, targetIndex);
    resultsRef?.scrollToTop();
  }

  async function goPrevPage() {
    if (search.pageIndex === 0) return;
    const targetIndex = search.pageIndex - 1;
    window.history.pushState(
      { pageIndex: targetIndex },
      "",
      window.location.href,
    );
    await search.fetchPage(getFormState(), formRef, targetIndex);
    resultsRef?.scrollToTop();
  }
</script>

<svelte:head>
  <title>
    {search.hasSearched && searchedKeyword
      ? `${searchedKeyword} - Clean YouTube Search`
      : "Clean YouTube Search"}
  </title>
</svelte:head>

<svelte:window onkeydown={onGlobalKeydown} onpopstate={onPopState} />

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
