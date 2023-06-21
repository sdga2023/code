<script>
  import { scaleLinear, max, min, range } from 'd3';
  import { getRegion } from './../../../data/countryRegionIncomeDictionary';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { _ } from 'svelte-i18n';
  import { ScatterCircleRadius, ScatterCircleRadiusMob } from '$lib/styles/vis';
  import { isMobile } from '$lib/stores/isMobile';

  export let data;
  export let pathString;
  export let year;
  export let x;
  export let y;
  export let hover = undefined;
  export let activeScene;

  let path;

  let highlight;
  $: highlightedStroke = '';

  $: highlightCountries = activeScene.index === 2 ? ['URY'] : activeScene.index === 3 ? ['USA', 'URY'] : [];

  $: getColor = (d) => {
    if (activeScene.index === 2) {
      if (data[0] === 'URY' || data[0] === highlight || data[0] === $referenceCountry) {
        return `var(--color-vis-region-${getRegion(data[0])})`;
      } else {
        return 'var(--color-grey-200)';
      }
    } else if (activeScene.index === 3) {
      if (['USA', 'URY'].includes(data[0]) || data[0] === highlight || data[0] === $referenceCountry) {
        return `var(--color-vis-region-${getRegion(data[0])})`;
      } else {
        return 'var(--color-grey-200)';
      }
    } else {
      return `var(--color-vis-region-${getRegion(data[0])})`;
    }
  };

  $: totalLength = path?.getTotalLength() || 0;

  $: minYear = min(data[1], (d) => d.year);
  $: maxYear = max(data[1], (d) => d.year);

  function dist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  $: w = scaleLinear()
    .domain(data[1].map((d) => d.year))
    .range(data[1].map((d) => d.water_withdrawals_in_billions_m3))
    .clamp(true);

  $: p = scaleLinear()
    .domain(data[1].map((d) => d.year))
    .range(data[1].map((d) => d.population))
    .clamp(true);

  $: calculatedDistance = range(minYear, maxYear + 1).reduce((acc, cur, i) => {
    if (i === 0) {
      acc.push({ year: cur, x: x(p(cur)), y: y(w(cur)), dist: 0, distSum: totalLength });
    } else {
      const x1 = x(p(cur));
      const y1 = y(w(cur));
      const distance = dist({ x: x1, y: y1 }, acc[i - 1]);

      acc.push({
        year: cur,
        x: x1,
        y: y1,
        distance,
        distSum: acc[i - 1].distSum - distance
      });
    }
    return acc;
  }, []);

  $: t = scaleLinear()
    .domain(calculatedDistance.map((d) => d.year))
    .range(calculatedDistance.map((d) => d.distSum))
    .clamp(true);
</script>

<g>
  <g
    on:mouseover={() => {
      hover = {
        iso3c: data[0]
      };
      highlight = data[0];
      highlightedStroke = data[0];
    }}
    on:mouseout={() => {
      hover = undefined;
      highlight = undefined;
    }}
  >
    {#if highlightCountries.includes(data[0]) || data[0] === highlight || data[0] === $referenceCountry}
      <path
        bind:this={path}
        d={pathString}
        fill="none"
        stroke="var(--color-vis-region-{getRegion(data[0])})"
        stroke-dasharray="{totalLength} {totalLength}"
        stroke-dashoffset={t(year)}
        stroke-width={2}
      />
    {/if}
  </g>

  {#each data[1] as d}
    {#if d.year === year}
      <g
        on:mouseover={() => {
          hover = {
            iso3c: data[0],
            year: d.year,
            water_withdrawals_in_billions_m3: w(d.year)
          };
          highlight = data[0];
        }}
        on:mouseout={() => {
          hover = undefined;
          highlight = undefined;
        }}
        transform="translate({x(d.population)} , {y(d.water_withdrawals_in_billions_m3)})"
      >
        {#if data[0] === $referenceCountry}
          <circle
            r={(highlightCountries.includes(data[0]) ? 8 : $isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius) + 3}
            fill="var(--color-reference-country)"
            stroke="white"
            class="reference"
          />
        {/if}

        <circle
          r={highlightCountries.includes(data[0]) ? 8 : $isMobile ? ScatterCircleRadiusMob : ScatterCircleRadius}
          fill={getColor(d)}
          stroke="transparent"
          stroke-width={10}
        />

        {#if activeScene.index === 2 && data[0] === 'URY'}
          <text dy={-10} class="label geo middle">{$_(`country.${'ury'}`)}</text>
        {/if}

        {#if activeScene.index === 3 && ['USA', 'URY'].includes(data[0])}
          {#if data[0] === 'USA'}
            <text dx={10} class="label geo central">{$_(`country.${data[0].toLowerCase()}`)}</text>
          {:else}
            <text dy={-10} class="label geo middle">{$_(`country.${data[0].toLowerCase()}`)}</text>
          {/if}
        {/if}
      </g>
    {/if}
  {/each}
</g>

<style>
  path {
    stroke-width: 8;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.6;
  }
</style>
