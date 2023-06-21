<script>
  export let data;
  export let type;
  export let legend_label_title;
  export let legend_label_poor;
  export let legend_label_other;
  export let legend_units;

  export let selectedCountry;
</script>

{#if type === 'legend'}<div />{:else if type === 'reference-value'}
  -
{/if}
