<script>
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import { getRegion, regionDefaultSortOrder } from './../../../data/countryRegionIncomeDictionary';
  import countriesISO from '../../../data/other/wb_countries_iso3.json';
  import { scaleLinear, max, groups } from 'd3';
  import Number from '../general/Number.svelte';
  import CountryPicker from '$lib/components/general/CountryPicker.svelte';
  import { _ } from 'svelte-i18n';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import Tooltip from '../general/Tooltip.svelte';
  import { isMobile } from '$lib/stores/isMobile';

  export let data = [];
  export let foodGroups = [];
  export let labels;

  let mousePosition = { x: 0, y: 0 };

  let width = 0;
  const height = $isMobile ? 600 : 800;

  const margin = {
    top: 20,
    right: 20,
    bottom: 0,
    left: 20
  };

  $: thisISO = data.map((d) => d.country_code);

  $: countriesToRemove = countriesISO.filter((iso) => !thisISO.includes(iso));
  $: remove = (iso) => countriesToRemove.includes(iso);

  $: additionalCountries = [
    { iso: 'MSR', label: $_(labels.MSR) },
    { iso: 'AIA', label: $_(labels.AIA) }
  ];

  $: w = width - margin.left - margin.right;
  const h = height - margin.top - margin.bottom;

  const keys = [
    'CoRD_of', // oils, fats
    'CoRD_asf', // animal sourced food
    'CoRD_ss', // starchy staples
    'CoRD_f', // fruit
    'CoRD_lns', // legumes, nuts, seeds
    'CoRD_v' // vegetables
  ];

  $: x = scaleLinear()
    .domain([0, max(keys.map((key) => max(data || [], (d) => d[key])))])
    .range([240, w]);

  $: totalPerCountry = data?.map((country) => ({
    ...country,
    region_code: ['AIA', 'MSR'].includes(country.country_code) ? 'NAC' : getRegion(country.country_code),
    total_cost: keys.reduce((acc, key) => acc + country[key], 0)
  }));

  $: xt = scaleLinear()
    .domain([0, max(totalPerCountry || [], (d) => d.total_cost)])
    .range([0, w]);

  let hover = undefined;

  let selectedCountry;

  $: countriesByISO = totalPerCountry.reduce((acc, country) => ({ ...acc, [country.country_code]: country }), {});

  $: displayCountry = hover
    ? hover
    : selectedCountry !== undefined && selectedCountry !== null
    ? { country: countriesByISO[selectedCountry] }
    : $referenceCountry && totalPerCountry.find((d) => d.country_code === $referenceCountry)
    ? { country: countriesByISO[$referenceCountry] }
    : { country: countriesByISO['WLD'] };

  $: {
    if (selectedCountry !== undefined && selectedCountry !== null) {
      hover = { country: totalPerCountry.find((d) => d.country_code === selectedCountry) };
    } else {
      hover = undefined;
    }
  }

  const byRegionCode = (a, b) => regionDefaultSortOrder.indexOf(a) - regionDefaultSortOrder.indexOf(b);
</script>

{#if data && data.length > 0}
  <div bind:clientWidth={width} class="container">
    <div class="country-picker-container">
      <CountryPicker bind:selectedCountry {additionalCountries} {remove} />
    </div>
    <svg
      {width}
      {height}
      on:mousemove={(e) => {
        mousePosition = { x: e.clientX, y: e.clientY };
      }}
    >
      <g transform="translate({margin.left}, {margin.top})">
        {#each keys as key}
          <rect x={x(key) - 20} height={h} width={10 * 5} fill="var(--color-theme-bg-weaker)" opacity={0.9} />
        {/each}
        <g>
          <text x={w / 2} class="title centered middle">{$_(labels.top_chart_label)}</text>
          <g transform="translate(0, 50)">
            {#each xt.ticks(5) as tick}
              <line y2={160} x1={xt(tick)} x2={xt(tick)} stroke="var(--color-grey-200)" stroke-width="1" />
              <text style="text-anchor: middle; font-size: var(--font-size-s);" dy={-5} x={xt(tick)}><Number unit="$" value={tick} /></text>
            {/each}
            {#each groups(totalPerCountry, (d) => d.region_code).sort((a, b) => byRegionCode(a[0], b[0])) as region, i}
              <g transform="translate(0, {10 + i * 18})">
                {#each region[1] as country}
                  <g transform="translate({xt(country?.total_cost) - 5}, {-5})">
                    <rect
                      width={10}
                      height={16}
                      fill="var(--color-vis-region-{country.region_code}"
                      class="total-country"
                      on:mouseover={() => (hover = { country })}
                      on:mouseout={() => (hover = undefined)}
                    />
                  </g>
                {/each}
              </g>
            {/each}

            {#if displayCountry !== undefined}
              <g
                transform="translate({xt(displayCountry.country.total_cost) - 6}, {-6 +
                  10 +
                  18 +
                  regionDefaultSortOrder.indexOf(displayCountry.country.region_code) * 18})"
                style="pointer-events: none;"
              >
                {#if $referenceCountry === displayCountry.country.country_code}
                  <rect width={12} height={18} fill="none" stroke="var(--color-reference-country)" stroke-width={4} />
                  <rect x={1} y={1} width={10} height={16} fill="none" stroke="white" stroke-width={2} />
                  <text style="pointer-events: none;" class="reference-label middle" dy={-10}>
                    {$_(`country.${displayCountry.country.country_code.toLowerCase()}`)}
                  </text>
                {:else}
                  <rect width={12} height={18} fill="none" stroke="var(--color-grey-700)" stroke-width={4} />
                  <rect x={1} y={1} width={10} height={16} fill="none" stroke="white" stroke-width={2} />

                  {#if hover !== undefined && hover.country.country_code !== displayCountry.country.country_code}
                    <text style="pointer-events: none;" class="label middle" dy={-10}>
                      {$_(`country.${displayCountry.country.country_code.toLowerCase()}`)}
                    </text>
                  {/if}
                {/if}
              </g>
            {/if}
          </g>
        </g>

        {#if !$isMobile}
          <g transform="translate(0, 260)">
            <text x={w / 2} class="title centered middle">{$_(labels.bottom_chart_label)}</text>
            <g transform="translate(0, 50)">
              {#each x.ticks(5) as tick}
                <line y2={400} x1={x(tick)} x2={x(tick)} stroke="var(--color-grey-200)" stroke-width="1" />
                <text style="text-anchor: middle; font-size: var(--font-size-s);" dy={-5} x={x(tick)}><Number unit="$" value={tick} /></text
                >
              {/each}
              {#each keys as key, i}
                <g transform="translate(0, {10 + i * 70})">
                  <rect x={240} width={w - 240} y={-10} height={70} fill={i % 2 === 0 ? 'var(--color-theme-bg-weakest)' : 'none'} />
                  <text class="food-group-label category" x={w} dx={-3} dy={3}>{$_(labels[key])}</text>
                  {#each groups(totalPerCountry, (d) => d.region_code).sort((a, b) => byRegionCode(a[0], b[0])) as region, j}
                    <g transform="translate(0, {j * 6})">
                      {#each region[1] as country, k}
                        <rect
                          x={x(country[key]) - 3}
                          y={-3}
                          width={6}
                          height={6}
                          fill="var(--color-vis-region-{country.region_code}"
                          class="total-country"
                          on:mouseover={() => (hover = { country, key })}
                          on:mouseout={() => (hover = undefined)}
                        />
                      {/each}
                    </g>
                  {/each}
                  {#if displayCountry !== undefined}
                    <g
                      transform="translate({x(displayCountry.country[key]) - 4}, {2 +
                        regionDefaultSortOrder.indexOf(displayCountry.country.region_code) * 6})"
                      style="pointer-events: none;"
                    >
                      {#if $referenceCountry === displayCountry.country.country_code}
                        <rect width={8} height={8} fill="none" stroke="var(--color-reference-country)" stroke-width={2} />
                        <rect x={1} y={1} width={6} height={6} fill="none" stroke="white" stroke-width={1} />
                      {:else}
                        <rect width={8} height={8} fill="none" stroke="var(--color-grey-700)" stroke-width={2} />
                        <rect x={1} y={1} width={6} height={6} fill="none" stroke="white" stroke-width={1} />
                      {/if}
                    </g>
                  {/if}
                </g>
              {/each}
            </g>
          </g>
        {/if}
      </g>
    </svg>

    <Tooltip visible={hover !== undefined && hover.key !== undefined} targetPos={mousePosition}>
      <div class="label caps">{$_(`country.${hover?.country.country_code.toLowerCase()}`)}</div>
      <div class="label stronger"><Number unit="$" value={hover?.country[hover?.key]} /></div>
      <div class="label small weaker">{$_(labels.average_cost_of)} {$_(labels[hover?.key])}</div>
    </Tooltip>

    <Tooltip visible={hover !== undefined && hover.key === undefined} targetPos={mousePosition}>
      <div class="label caps">{$_(`country.${hover?.country.country_code.toLowerCase()}`)}</div>
      <div class="label stronger"><Number unit="$" value={hover?.country.total_cost} /></div>
      <div class="label small weaker">{$_(labels.total_cost)}</div>
    </Tooltip>

    <div class="receipt monospace">
      {#if displayCountry !== undefined}
        <div class="inner">
          <p class="country-name">{$_(`country.${displayCountry.country.country_code.toLowerCase()}`)}</p>
          {#each keys as key}
            <div class="item">
              <div class="item-name">{$_(labels[key]).split(' (')[0]}</div>
              <div class="item-cost"><Number unit="$" value={displayCountry.country[key]} /></div>
            </div>
          {/each}
          <div class="item total">
            <div class="item-name">{$_(labels.total)}:</div>
            <div class="item-cost"><Number unit="$" value={keys.reduce((acc, key) => acc + displayCountry.country[key], 0)} /></div>
          </div>
        </div>
      {/if}
    </div>
    <div class="legend">
      <CategoricalLegend legendType="regions" />
    </div>
  </div>
{/if}

<style>
  @import 'https://fonts.googleapis.com/css?family=Roboto+Mono:300,300i,400,400i,600,600i,700,700i,800,800i&subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese';
  .monospace {
    font-family: 'Roboto Mono', monospace;
  }

  .legend {
    width: 100%;
  }

  .country-picker-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .food-group-label {
    text-anchor: end;
  }
  .container {
    position: relative;
  }

  .total-country {
    stroke: none;
    stroke-width: 0;
    opacity: 0.3;
  }
  .total-country {
    stroke: white;
    stroke-width: 0.5;
    opacity: 0.9;
  }

  .receipt {
    position: absolute;
    bottom: 120px;
    left: 50px;
    display: flex;
    flex-direction: column;
    justify-content: top;
    align-items: center;
    background-color: var(--color-theme-bg-stronger);
    /* opacity: 0; */
    /* transition: opacity 0.5s; */
    background: white;
    width: 270px;
    height: 320px;
    color: black;
    box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.2);
    transform: rotate(-6deg);
  }

  .inner {
    padding: 20px;
    width: 100%;
    height: 100%;
  }

  .receipt .country-name {
    font-size: var(--font-size-m);
    font-weight: bold;
    margin-bottom: 20px;
    height: 60px;
    border-bottom: 1px solid var(--color-grey-200);
  }

  .item {
    font-size: var(--font-size-s);
    display: flex;
    justify-content: space-between;
  }

  .item-name {
    overflow: hidden;
    /* text-overflow: ellipsis; */
    white-space: nowrap;
  }

  .item.total {
    font-weight: bold;
    margin-top: 20px;
    padding-top: 5px;
    border-top: 1px solid var(--color-grey-200);
  }

  .item-name:after {
    content: ' ...........................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................';
  }
</style>
