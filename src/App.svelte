<script lang="ts">
  import {
    createSearchState,
    DEFAULT_FORM,
    type SearchFormState,
  } from "./lib/search.svelte";
  import SearchSidebar from "./lib/SearchSidebar.svelte";
  import SearchResults from "./lib/SearchResults.svelte";
  import { addHistory } from "./lib/storage";
  import menuIcon from "./assets/menu.svg?raw";
  import { onMount } from "svelte";

  // ── Search form state ───────────────────────────────
  let form = $state<SearchFormState>({ ...DEFAULT_FORM });
  let formRef = $state<HTMLFormElement>();
  let searchedKeyword = $state("");

  function loadStateFromUrl() {
    const params = new URLSearchParams(window.location.search);

    // Reset to defaults first to handle deleted keys during history pop
    form = { ...DEFAULT_FORM };

    for (const [key, value] of params.entries()) {
      handleFieldUpdate(key === "q" ? "keyword" : key, value);
    }
  }

  onMount(() => {
    loadStateFromUrl();

    if (form.keyword || form.channelId) {
      // Small delay to ensure form bindings are ready
      // Seed initial history state so popping back to page 0 works securely
      window.history.replaceState({ pageIndex: 0 }, "", window.location.href);
      setTimeout(() => search.fetchPage(form, formRef, 0), 0);
    }
  });

  function onPopState(e: PopStateEvent) {
    loadStateFromUrl();
    if (form.keyword || form.channelId) {
      const targetPageIndex = e.state?.pageIndex ?? 0;
      search.fetchPage(form, formRef, targetPageIndex);
      searchedKeyword = form.keyword; // Restore tab title
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
  const FIELD_SHORTCUTS: Record<string, [field: string, value: string]> = {
    r: ["order", "relevance"],
    d: ["order", "date"],
    n: ["eventType", ""],
    l: ["eventType", "live"],
    a: ["eventType", "completed"],
    u: ["eventType", "upcoming"],
  };

  function onGlobalKeydown(e: KeyboardEvent) {
    // Leave browser shortcuts (Ctrl+R, Ctrl+A, ...) alone
    if (e.ctrlKey || e.metaKey || e.altKey) return;

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
    } else if (e.key === "i") {
      e.preventDefault();
      document.getElementById("channel-id")?.focus();
    } else if (e.key === "ArrowLeft") {
      goPrevPage();
    } else if (e.key === "ArrowRight") {
      goNextPage();
    } else if (e.key in FIELD_SHORTCUTS) {
      const [field, value] = FIELD_SHORTCUTS[e.key];
      handleFieldUpdate(field, value);
    }
  }

  function handleFieldUpdate(field: string, value: string) {
    // All SearchFormState fields hold string values, so a single dynamic
    // assignment covers every case; unknown URL keys are ignored
    if (field in DEFAULT_FORM) {
      (form as unknown as Record<string, string>)[field] = value;
    }
  }

  function handleReset() {
    // Clear URL params and search results; settings (API key etc.) live in
    // localStorage and are untouched
    window.history.pushState({ pageIndex: 0 }, "", window.location.pathname);
    form = { ...DEFAULT_FORM };
    search.resetAll();
    searchedKeyword = "";
    sidebarOpen = true;
  }

  async function handleSearch(pushHistory = true) {
    search.resetCache();

    if (pushHistory) {
      // Update URL with current form state, omitting default values
      // eslint-disable-next-line svelte/prefer-svelte-reactivity -- transient, never rendered
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(form)) {
        if (value && value !== DEFAULT_FORM[key as keyof SearchFormState]) {
          params.set(key === "keyword" ? "q" : key, value);
        }
      }

      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.pushState({ pageIndex: 0 }, "", newUrl);
    }

    await search.fetchPage(form, formRef, 0);

    // Save to history
    if (form.keyword) addHistory("history-keyword", form.keyword);
    if (form.channelId) addHistory("history-channelId", form.channelId);
    if (form.relevanceLanguage)
      addHistory("history-language", form.relevanceLanguage);

    searchedKeyword = form.keyword;
    sidebarOpen = false;
    resultsRef?.scrollToTop();
  }

  async function goToPage(targetIndex: number) {
    window.history.pushState(
      { pageIndex: targetIndex },
      "",
      window.location.href,
    );
    await search.fetchPage(form, formRef, targetIndex);
    resultsRef?.scrollToTop();
  }

  function goNextPage() {
    if (search.nextPageToken) goToPage(search.pageIndex + 1);
  }

  function goPrevPage() {
    if (search.pageIndex > 0) goToPage(search.pageIndex - 1);
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
  class="flex h-dvh bg-neutral-950 text-base font-medium text-neutral-100 antialiased"
>
  <!-- Hamburger button (mobile only, after search) -->
  {#if search.hasSearched}
    <button
      class="fixed right-5 bottom-20 z-50 flex items-center justify-center rounded-full bg-red-600 transition-colors hover:bg-red-500 lg:hidden"
      style="width: 3.5rem; height: 3.5rem;"
      onclick={() => (sidebarOpen = !sidebarOpen)}
      aria-label="Toggle sidebar"
    >
      <span class="h-6 w-6 text-white [&>svg]:h-full [&>svg]:w-full">
        {@html menuIcon}
      </span>
    </button>
  {/if}

  <SearchSidebar
    {form}
    isSearching={search.isSearching}
    hasSearched={search.hasSearched}
    {sidebarOpen}
    bind:formRef
    onupdate={handleFieldUpdate}
    onsearch={handleSearch}
    onreset={handleReset}
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
    onnext={goNextPage}
    onprev={goPrevPage}
  />
</div>
