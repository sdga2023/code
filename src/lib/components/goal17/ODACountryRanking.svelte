<script>
  import { _ } from 'svelte-i18n';
  import { Number } from '$lib/components';
  import { scaleLinear, max } from 'd3';

  export let label_units;
  export let typeLabels;

  export let selectedCountryTypes;
  export let selectedCountryData;

  $: sidebarScale = scaleLinear()
    .domain([0, selectedCountryData ? max(Object.values(selectedCountryData).map((d) => max(d, (dd) => dd.value))) : 1])
    .range([0, 100]);
</script>

<ul class="ranking">
  {#each selectedCountryTypes as type}
    <h3 class="label caps stronger">{typeLabels[type]}</h3>
    <ul>
      {#each selectedCountryData?.[type].filter((d) => d).slice(0, 5) as other}
        <li class="ranking" class:highlight={other.highlight}>
          <p class="rank">
            <span class="label stronger geo small">
              {$_('country.' + other.iso3.toLowerCase())}
            </span>
            <span class="label small">
              ({#if other.value < 1}&lt;1{:else}<Number value={other.value} digits="0" />{/if}
              {label_units})
            </span>
          </p>
          <div
            class="sidebar-bar"
            style:width={sidebarScale(other.value) + '%'}
            style:background-color={'var(--color-vis-region-' + other.region + ')'}
          >
            <p class="label small">&nbsp;</p>
          </div>
        </li>
      {/each}
      {#if selectedCountryData[type].length > 5}
        <li>...</li>
      {/if}
    </ul>
  {/each}
</ul>

<style>
  .ranking p {
    line-height: 18px;
    padding-left: var(--space-2xs);
    white-space: nowrap;
  }
  .ranking .rank {
    padding: var(--space-2xs) 0 0 0;
  }
  h3 {
    text-transform: uppercase;
    margin-top: var(--space-m);
  }
</style>
