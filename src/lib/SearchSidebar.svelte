<script lang="ts">
  import type { SearchParams } from "./api";
  import { apiKey, timeFormat } from "./settings.svelte";
  import {
    ORDER_OPTIONS,
    DURATION_OPTIONS,
    EVENT_TYPE_OPTIONS,
    DIMENSION_OPTIONS,
    LICENSE_OPTIONS,
    SAFE_SEARCH_OPTIONS,
    TIME_FORMAT_OPTIONS,
  } from "./constants";
  import TextField from "./TextField.svelte";
  import RadioPills from "./RadioPills.svelte";
  import eyeOffIcon from "../assets/eye-off.svg?raw";
  import eyeIcon from "../assets/eye.svg?raw";
  import searchIcon from "../assets/search.svg?raw";

  interface Props {
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
    isSearching: boolean;
    hasSearched: boolean;
    sidebarOpen: boolean;
    formRef: HTMLFormElement | undefined;
    onupdate: (field: string, value: string) => void;
    onsearch: () => void;
  }

  let {
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
    isSearching,
    hasSearched,
    sidebarOpen,
    formRef = $bindable(),
    onupdate,
    onsearch,
  }: Props = $props();

  let showApiKey = $state(false);
</script>

<aside
  class="flex w-full flex-col bg-neutral-900 p-5 lg:w-1/4 lg:max-w-xl lg:min-w-xs lg:overflow-y-auto"
  class:max-lg:hidden={hasSearched && !sidebarOpen}
>
  <form
    bind:this={formRef}
    class="mb-4 grid gap-2"
    onsubmit={(e) => e.preventDefault()}
  >
    <TextField
      id="search-input"
      label="Search Keyword"
      type="text"
      value={keyword}
      historyKey="history-keyword"
      oninput={(v) => onupdate("keyword", v)}
      placeholder="Enter Keywords"
      required
    />

    <RadioPills
      legend="Order"
      name="order"
      options={ORDER_OPTIONS}
      value={order}
      onselect={(v) => onupdate("order", v)}
    />

    <RadioPills
      legend="Duration"
      name="video-duration"
      options={DURATION_OPTIONS}
      value={videoDuration}
      onselect={(v) => onupdate("videoDuration", v)}
    />

    <RadioPills
      legend="Broadcast"
      name="event-type"
      options={EVENT_TYPE_OPTIONS}
      value={eventType ?? ""}
      onselect={(v) => onupdate("eventType", v)}
    />

    <TextField
      id="channel-id"
      label="Channel ID"
      type="text"
      value={channelId}
      historyKey="history-channelId"
      oninput={(v) => onupdate("channelId", v)}
      placeholder="Channel ID or Handle"
    />

    <TextField
      id="published-after"
      label="Published After"
      type="datetime-local"
      value={publishedAfter}
      oninput={(v) => onupdate("publishedAfter", v)}
    />

    <TextField
      id="published-before"
      label="Published Before"
      type="datetime-local"
      value={publishedBefore}
      oninput={(v) => onupdate("publishedBefore", v)}
    />

    <TextField
      id="relevance-language"
      label="Language"
      type="text"
      value={relevanceLanguage}
      historyKey="history-language"
      oninput={(v) => onupdate("relevanceLanguage", v)}
      placeholder="ISO 639-1"
    />

    <RadioPills
      legend="Dimension"
      name="video-dimension"
      options={DIMENSION_OPTIONS}
      value={videoDimension}
      onselect={(v) => onupdate("videoDimension", v)}
    />

    <RadioPills
      legend="License"
      name="video-license"
      options={LICENSE_OPTIONS}
      value={videoLicense}
      onselect={(v) => onupdate("videoLicense", v)}
    />

    <RadioPills
      legend="Safe Search"
      name="safe-search"
      options={SAFE_SEARCH_OPTIONS}
      value={safeSearch}
      onselect={(v) => onupdate("safeSearch", v)}
    />

    <!-- Settings -->
    <h2 class="mt-6 text-xl tracking-wider">Settings</h2>
    <div class="flex items-end gap-2">
      <div class="flex-1">
        <TextField
          id="api-key"
          label="API Key"
          type={showApiKey ? "text" : "password"}
          value={apiKey.value}
          oninput={(v) => (apiKey.value = v)}
          placeholder="Enter your YouTube API key"
          required
        />
      </div>
      <button
        type="button"
        onclick={() => (showApiKey = !showApiKey)}
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-neutral-100 transition-colors hover:text-white"
        aria-label={showApiKey ? "Hide API key" : "Show API key"}
      >
        <span class="h-5 w-5 [&>svg]:h-full [&>svg]:w-full">
          {@html showApiKey ? eyeOffIcon : eyeIcon}
        </span>
      </button>
    </div>

    <RadioPills
      legend="Time Format"
      name="time-format"
      options={TIME_FORMAT_OPTIONS}
      value={timeFormat.value}
      onselect={(v) => (timeFormat.value = v)}
    />
  </form>

  <button
    onclick={onsearch}
    disabled={isSearching || !apiKey.value || !keyword}
    class="sticky bottom-4 flex w-full items-center justify-center gap-2 rounded-full bg-red-600 p-3 text-xl text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-600/30 disabled:text-white/30 disabled:backdrop-blur-sm lg:mt-4"
  >
    <span class="h-6 w-6 [&>svg]:h-full [&>svg]:w-full">{@html searchIcon}</span
    >
    {isSearching ? "Searching..." : "Search"}
  </button>
</aside>
