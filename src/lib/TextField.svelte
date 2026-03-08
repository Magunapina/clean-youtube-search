<script lang="ts">
  import xIcon from "../assets/x.svg?raw";

  interface Props {
    id: string;
    label: string;
    type: string;
    value: string;
    oninput: (v: string) => void;
    placeholder?: string;
    required?: boolean;
  }

  let {
    id,
    label,
    type,
    value,
    oninput,
    placeholder = "",
    required = false,
  }: Props = $props();

  let inputRef = $state<HTMLInputElement>();

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
</script>

<div class="grid">
  <label for={id} class="mb-1 block">
    {label}{#if required}
      <span class="ml-2 text-red-600">*Required</span>{/if}
  </label>
  <div class="relative">
    <input
      bind:this={inputRef}
      {type}
      {id}
      {placeholder}
      {value}
      oninput={(e) => oninput(e.currentTarget.value)}
      onchange={(e) => oninput(e.currentTarget.value)}
      onkeydown={(e) => {
        if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.blur();
        }
      }}
      class="w-full rounded-full bg-neutral-700 px-4 py-3 pr-11 transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none"
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
  </div>
</div>
