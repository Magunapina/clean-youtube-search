<script lang="ts" generics="T extends string">
  interface Props {
    legend: string;
    name: string;
    options: readonly { readonly v: T; readonly l: string }[];
    value: T;
    onselect: (v: T) => void;
  }

  let { legend, name, options, value, onselect }: Props = $props();
</script>

<fieldset>
  <legend class="mb-1 block">{legend}</legend>
  <div class="flex flex-wrap gap-2">
    {#each options as opt (opt.v)}
      <label
        class="cursor-pointer rounded-full px-4 py-2 text-base font-medium transition-colors select-none {value ===
        opt.v
          ? 'bg-red-600 text-white hover:bg-red-500 hover:text-white'
          : 'bg-neutral-700 text-neutral-100 hover:bg-neutral-600 hover:text-white'}"
      >
        <input
          type="radio"
          {name}
          value={opt.v}
          checked={value === opt.v}
          onchange={() => onselect(opt.v)}
          class="hidden"
        />
        {opt.l}
      </label>
    {/each}
  </div>
</fieldset>
