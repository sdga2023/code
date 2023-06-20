<script>
  import { scaleLinear, scaleBand } from 'd3-scale';
  import Number from './../general/Number.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import { _ } from 'svelte-i18n';
  import { countryLookup } from './../../../data/countryRegionIncomeDictionary.js';

  export let data;

  $: refData = $referenceCountry && data ? data.filter((d) => d.iso3c == $referenceCountry) : [];

  const ssfCountries = countryLookup.filter((d) => d.region_iso3c == 'SSF').map((d) => d.iso3c);
  $: ssfData = data ? data.filter((d) => ssfCountries.includes(d.iso3c)) : [];
  $: yDomain = ssfData ? [...new Set(ssfData.map((d) => d.iso3c))] : [];

  let margins = {
    top: 80,
    right: 20,
    bottom: 20,
    left: 200
  };

  let w;
  let h = 800;

  $: xScale = scaleLinear()
    .domain([0, 100])
    .range([0, w - margins.left - margins.right]);

  $: yScale = scaleBand()
    .domain(yDomain)
    .range([0, h - margins.top - margins.bottom]);
</script>

<div class="layout-content" bind:clientWidth={w}>
  <span class="legend-item solidbiofuels">Solid biofuels</span>
  <span class="legend-item otherrenewables">Other renewables</span>
  <span class="legend-item nonrenewable">Non-renewables</span>
  <svg width={w} height={h}>
    <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
      {#if refData && $referenceCountry}
        {#each refData as share}
          <rect
            x={xScale(share.cumperc)}
            y={-40}
            width={xScale(share.share)}
            height={30}
            stroke={'#ffffff'}
            stroke-width={1}
            class={share.source}
          />
          {#if share.share > 5}
            <text x={xScale(share.cumperc + share.share) - 2} y={-20} class="small data-label"
              ><Number value={share.share} /></text
            >
          {/if}
        {/each}
        <text x={-2} y={-20} class={'small country-label'}>{$_(`country.${$referenceCountry.toLowerCase()}`)}</text>
      {/if}

      {#if ssfData.length > 0 && xScale && yScale}
        {#each ssfData as share}
          <rect
            x={xScale(share.cumperc)}
            y={yScale(share.iso3c)}
            width={xScale(share.share)}
            height={yScale.bandwidth()}
            stroke={'#ffffff'}
            stroke-width={1}
            class={share.source}
          />
          {#if share.share > 5}
            <text x={xScale(share.cumperc + share.share) - 2} y={yScale(share.iso3c) + 12} class="small data-label"
              ><Number value={share.share} /></text
            >
          {/if}
        {/each}
        {#each ssfCountries as country}
          <text x={-2} y={yScale(country) + 12} class={'small country-label'}>{$_(`country.${country.toLowerCase()}`)}</text>
        {/each}
      {/if}
    </g>
  </svg>
</div>

<style>
  .country-label {
    text-anchor: end;
  }
  .solidbiofuels {
    fill: var(--color-base-yellow200);
    background-color: var(--color-base-yellow200);
  }
  .otherrenewables {
    fill: var(--color-base-green400);
    background-color: var(--color-base-green400);
  }
  .nonrenewable {
    fill: var(--color-base-pink500);
    background-color: var(--color-base-pink500);
  }
  .data-label {
    text-anchor: end;
  }
  .legend-item {
    color: white;
    padding: 3px;
  }
</style>
