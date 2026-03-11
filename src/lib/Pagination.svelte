<script lang="ts">
  import chevronLeftIcon from "../assets/chevron-left.svg?raw";
  import chevronRightIcon from "../assets/chevron-right.svg?raw";

  interface Props {
    pageIndex: number;
    hasNext: boolean;
    isSearching: boolean;
    totalResults?: number;
    resultsPerPage?: number;
    onnext: () => void;
    onprev: () => void;
  }

  let {
    pageIndex,
    hasNext,
    isSearching,
    totalResults,
    resultsPerPage,
    onnext,
    onprev,
  }: Props = $props();
</script>

<div
  class="sticky bottom-0 z-40 flex items-center justify-center gap-4 bg-neutral-800 px-6 py-2"
>
  <button
    class="flex items-center justify-center rounded-full bg-neutral-700 px-5 py-2.5 text-neutral-100 transition-colors hover:bg-neutral-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
    disabled={pageIndex === 0 || isSearching}
    onclick={onprev}
    aria-label="Previous page"
  >
    <span class="inline-block h-5 w-5 [&>svg]:h-full [&>svg]:w-full"
      >{@html chevronLeftIcon}</span
    >
  </button>
  <span class="text-lg text-neutral-100">
    {pageIndex + 1}
  </span>
  <button
    class="flex items-center justify-center rounded-full bg-neutral-700 px-5 py-2.5 text-neutral-100 transition-colors hover:bg-neutral-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
    disabled={!hasNext || isSearching}
    onclick={onnext}
    aria-label="Next page"
  >
    <span class="inline-block h-5 w-5 [&>svg]:h-full [&>svg]:w-full"
      >{@html chevronRightIcon}</span
    >
  </button>
  {#if totalResults !== undefined && resultsPerPage !== undefined}
    <div
      class="absolute right-6 hidden text-base font-medium text-neutral-400 lg:block"
    >
      {resultsPerPage} results (of {totalResults.toLocaleString()})
    </div>
  {/if}
</div>
