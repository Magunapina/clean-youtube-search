<script lang="ts">
  import xIcon from "../assets/x.svg?raw";
  import { getHistory, removeHistory } from "./storage";

  interface Props {
    id: string;
    label: string;
    type: string;
    value: string;
    oninput: (v: string) => void;
    placeholder?: string;
    required?: boolean;
    historyKey?: string;
  }

  let {
    id,
    label,
    type,
    value,
    oninput,
    placeholder = "",
    required = false,
    historyKey,
  }: Props = $props();

  let inputRef = $state<HTMLInputElement>();
  let isFocused = $state(false);
  let allHistory = $state<string[]>([]);

  const filteredHistory = $derived.by(() => {
    if (!historyKey || !allHistory) return [];
    const lowerValue = value.trim().toLowerCase();
    const filtered = allHistory.filter((h) =>
      h.toLowerCase().startsWith(lowerValue),
    );
    return filtered.slice(0, 10);
  });

  let showDropdown = $derived(
    isFocused && historyKey && filteredHistory.length > 0,
  );

  function loadHistory() {
    if (historyKey) {
      allHistory = getHistory(historyKey);
    }
  }

  function handleClear() {
    if (!inputRef) return;
    if (type === "datetime-local") {
      // Need to temporarily change type to text to clear invalid partial dates
      inputRef.type = "text";
      inputRef.value = "";
      inputRef.type = "datetime-local";
    }
    oninput("");
    inputRef.focus();
  }

  function handleFocus() {
    loadHistory();
    isFocused = true;
  }

  function handleBlur() {
    isFocused = false;
  }

  function handleInput(e: Event) {
    if (!isFocused) isFocused = true;
    const target = e.currentTarget as HTMLInputElement;
    oninput(target.value);
  }

  function handleChange(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    oninput(target.value);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLInputElement).blur();
    }
  }

  function handleDropdownMousedown(e: MouseEvent) {
    e.preventDefault();
  }

  function handleDropdownRemoveMousedown(e: MouseEvent) {
    e.preventDefault();
  }

  const createDropdownClick = (item: string) => () => {
    oninput(item);
    isFocused = false;
    inputRef?.blur();
  };

  const createRemoveHistory = (item: string) => () => {
    if (historyKey) {
      removeHistory(historyKey, item);
      loadHistory();
    }
  };
</script>

<div class="grid">
  <label for={id} class="mb-1 block">
    {label}{#if required}
      <span class="ml-2 text-red-600">*Required</span>{/if}
  </label>
  <div class="relative">
    <input
      bind:this={inputRef}
      autocomplete="off"
      {type}
      {id}
      {placeholder}
      {value}
      onfocus={handleFocus}
      onblur={handleBlur}
      oninput={handleInput}
      onchange={handleChange}
      onkeydown={handleKeydown}
      class="w-full rounded-full bg-neutral-700 px-4 py-2 pr-11 transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none"
    />
    <button
      type="button"
      onclick={handleClear}
      class="absolute top-1/2 right-3 -translate-y-1/2 transition-colors hover:text-white"
      aria-label="Clear"
    >
      <span class="block h-7 w-7 [&>svg]:h-full [&>svg]:w-full">
        {@html xIcon}
      </span>
    </button>
    {#if showDropdown}
      <ul
        class="absolute top-12 left-0 z-50 w-full overflow-hidden rounded-xl bg-neutral-700 shadow-[0_8px_30px_rgb(0,0,0,0.8)]"
      >
        {#each filteredHistory as item (item)}
          <li
            class="flex items-center justify-between transition-colors hover:bg-neutral-600"
          >
            <button
              type="button"
              class="w-full flex-1 truncate px-4 py-2 text-left hover:text-white"
              onmousedown={handleDropdownMousedown}
              onclick={createDropdownClick(item)}
            >
              {item}
            </button>
            <button
              type="button"
              class="px-4 py-2 transition-colors hover:text-white"
              onmousedown={handleDropdownRemoveMousedown}
              onclick={createRemoveHistory(item)}
              aria-label="Remove from history"
            >
              <span class="block h-7 w-7 [&>svg]:h-full [&>svg]:w-full">
                {@html xIcon}
              </span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
