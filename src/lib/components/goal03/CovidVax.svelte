<script>
  import * as topojson from 'topojson-client';
  import { _ } from 'svelte-i18n';

  import { geoEqualEarth, geoPath, interpolateHcl, scaleSequential, scaleLog, scaleLinear, max, interpolateLab, piecewise } from 'd3';

  import { Number, Tooltip } from '$lib/components';

  import { getRegion } from '../../../data/countryRegionIncomeDictionary';

  import * as Colors from '$lib/styles/tokens.es6.js';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';

  import CovidVaxLegend from './CovidVaxLegend.svelte';

  import countriesJSON from '../../../data/other/wb_countries_topo.json';
  import centroidsJSON from '../../../data/other/country_centroids.json';
  import landJSON from '../../../data/other/wb_land_topo.json';
  import Legend from '../general/Legend.svelte';
  import { TealRamp, YellowTealRamp } from '$lib/styles/colorscales';
  import { isMobile } from '$lib/stores/isMobile';
  import { RefCountryOffset, RefOffset } from '$lib/styles/vis';

  export let data;
  export let parentWidth, parentHeight;

  export let vis_type;

  export let covid_deaths;
  export let deaths_averted;
  export let deaths_averted_short;
  export let vaccination_rate;
  export let legend_units;

  export let more_averted_than_deaths;
  export let equal_averted;
  export let more_deaths_than_averted;

  const RedRamp = piecewise(interpolateLab, [
    Colors.ColorBaseRed100,
    Colors.ColorBaseRed300,
    Colors.ColorBaseRed500,
    Colors.ColorBaseRed700
  ]);

  const NeutralRamp = piecewise(interpolateLab, [
    Colors.ColorBaseDarkPurple100,
    Colors.ColorBaseDarkPurple300,
    Colors.ColorBaseDarkPurple500,
    Colors.ColorBaseDarkPurple700
  ]);

  $: w = parentWidth;
  $: h = $isMobile ? w / 1.7 : 600;
  $: ih = h * 0.75;

  let padding = 50;

  const ratioRanges = [
    { min: 1.09, max: 999999, label: more_averted_than_deaths },
    { min: 0.91, max: 1.09, label: equal_averted },
    { min: 0, max: 0.91, label: more_deaths_than_averted }
  ];

  let colorScale = () => {};
  let avertedColorScale = () => {};
  let deathColorScale = () => {};
  let neutralColorScale = () => {};
  const ramp = YellowTealRamp;
  const aveRamp = TealRamp;
  const deathRamp = RedRamp;

  $: if (data) {
    colorScale = scaleSequential(ramp).domain([0, 100]);
    avertedColorScale = scaleSequential(aveRamp).domain([0, max(data, (d) => Math.max(d.deaths, d.averted))]);
    deathColorScale = scaleSequential(deathRamp).domain([0, max(data, (d) => Math.max(d.deaths, d.averted))]);
    neutralColorScale = scaleSequential(NeutralRamp).domain([0, max(data, (d) => Math.max(d.deaths, d.averted))]);
  }

  $: yScale = scaleLog()
    .domain([0.1, max(data, (d) => d.averted)])
    .range([ih - padding, padding]);

  $: xScale = scaleLog()
    .domain([0.1, max(data, (d) => d.deaths)])
    .range([padding, w - padding]);

  $: radScale = scaleLinear().domain([0, 1]).range([0, 22]);

  $: maxDeaths = (c) => Math.max(c.deaths, c.averted);
  $: radAccessor = (c, inner = true) => {
    const mds = maxDeaths(c);
    return inner ? c.deaths / mds : c.averted / mds;
  };

  let countries = topojson.feature(countriesJSON, countriesJSON.objects.wb_countries).features;
  let land = topojson.feature(landJSON, landJSON.objects.wb_land).features;
  let centroids = centroidsJSON.features;

  $: referenceCentroid =
    $referenceCountry && projection
      ? projection(centroids.find((c) => c.properties.iso_3c === $referenceCountry)?.geometry.coordinates)
      : null;

  $: globeOffset = $isMobile ? -40 : 0;

  $: projection = geoEqualEarth().fitExtent(
    [
      [globeOffset, globeOffset],
      [w - globeOffset, h - globeOffset]
    ],
    { type: 'Sphere' }
  );

  let richData = [];
  let landPath = '';
  $: if (data && projection && w && h && xScale && yScale) {
    landPath = geoPath().projection(projection)(land[0]);
    richData = countries
      .filter((c) => {
        // only show countries as circles that have data:
        const datum = data.find((d) => d.ISO3 === c.properties.ISO_A3);
        if (vis_type === 'map') {
          return datum?.coverage;
        } else {
          return datum?.averted && datum?.deaths;
        }
      })
      .map((c) => {
        const path = geoPath().projection(projection)(c);

        return {
          ...c,
          ...data.find((d) => d.ISO3 === c.properties.ISO_A3),
          countryPath: path,
          region: getRegion(c.properties.ISO_A3)
        };
      });
  }

  let hoveredCountry = null;
  let tooltipVisible = false;
  let tooltipTargetPos = { x: 0, y: 0 };
  function showTooltip(e, c) {
    hoveredCountry = c;
    tooltipVisible = true;
    const x = e.clientX;
    const y = e.clientY;
    tooltipTargetPos = { ...tooltipTargetPos, x, y };
  }
  function hideTooltip() {
    tooltipVisible = false;
  }
</script>

<div class="covid-vax map">
  {#if vis_type === 'map'}
    <svg class="map" width={w} height={h}>
      <g>
        <path d={landPath} fill={Colors.ColorVisNotAvailable} class="land" />
        {#each richData as c}
          <path
            d={c.countryPath}
            on:mouseover={(e) => showTooltip(e, c)}
            on:mouseout={hideTooltip}
            on:focus={(e) => showTooltip(e, c)}
            on:blur={hideTooltip}
            fill={c.coverage ? colorScale(c.coverage) : Colors.ColorVisNotAvailable}
            class="country"
            data-iso={c.properties.ISO_A3}
          />
        {/each}
        <path d={landPath} class="land" />
        {#each richData.filter((d) => tooltipVisible && d.properties.ISO_A3 === hoveredCountry?.properties.ISO_A3) as c}
          <path class="emphasisbg" d={c.countryPath} />
          <path class="emphasis" d={c.countryPath} />
        {/each}
        {#each richData.filter((d) => d.properties.ISO_A3 === $referenceCountry) as c}
          <path class="emphasisbg" d={c.countryPath} />
          <path class="reference" d={c.countryPath} />
        {/each}
      </g>
      {#if referenceCentroid && !isNaN(referenceCentroid[0])}
        <text class="reference-label small middle" x={referenceCentroid[0]} y={referenceCentroid[1] + RefCountryOffset}
          >{$_(`country.${$referenceCountry.toLowerCase()}`)}</text
        >
        <text class="reference-label middle" x={referenceCentroid[0]} y={referenceCentroid[1] + RefOffset}
          ><Number value={richData.find((d) => d.ISO3 === $referenceCountry).coverage} digits={1} unit="%" /></text
        >
      {/if}
    </svg>
    <Legend title={vaccination_rate} color={colorScale} units="%" unitLabel={legend_units} digits="0" />
  {/if}

  {#if vis_type === 'circles'}
    <div class="legends">
      <div class="legends-container">
        <Legend title={deaths_averted_short} color={avertedColorScale} digits="0" />
        <CovidVaxLegend circleRadius={25} {covid_deaths} {deaths_averted_short} />
        <Legend title={covid_deaths} color={deathColorScale} digits="0" />
      </div>
    </div>
    {#each ratioRanges as range}
      <p class="label title centered">{range.label}</p>
      <div class="small-multiples">
        {#each [...richData]
          .filter((d) => {
            const ratio = d.averted / d.deaths;
            return ratio >= range.min && ratio < range.max;
          })
          .sort((a, b) => {
            return b.averted / (b.averted + b.deaths) - a.averted / (a.averted + a.deaths);
          }) as c, i}
          <div class="country-multi" class:reference={c.properties.ISO_A3 === $referenceCountry}>
            <svg
              width="50"
              height="50"
              on:mouseover={(e) => showTooltip(e, c)}
              on:mouseout={hideTooltip}
              on:focus={(e) => showTooltip(e, c)}
              on:blur={hideTooltip}
            >
              <circle class="background" cx="25" cy="25" r={24} />
              <mask id={`${i}-leftmask`}><rect x="0" y="0" width="25" height="50" fill="white" /></mask>
              <mask id={`${i}-rightmask`}><rect x="25" y="0" width="25" height="50" fill="white" /></mask>
              <circle
                class:active={tooltipVisible && c.properties.ISO_A3 === hoveredCountry?.properties.ISO_A3}
                class="averted"
                cx="25"
                cy="25"
                r={radScale(radAccessor(c, false))}
                style="--circle-color: {avertedColorScale(c.averted)}"
                mask={`url(#${i}-leftmask)`}
              />
              <circle
                class:active={tooltipVisible && c.properties.ISO_A3 === hoveredCountry?.properties.ISO_A3}
                class="deaths"
                cx="25"
                cy="25"
                r={radScale(radAccessor(c, true))}
                style="--circle-color: {deathColorScale(c.deaths)}"
                mask={`url(#${i}-rightmask)`}
              />
            </svg>
            <p class="label weaker small">{$_(`country.${c.properties.ISO_A3.toLowerCase()}`)}</p>
            <!--<p class="label weaker small"><Number value={c.averted / c.deaths} digits="2" /></p>-->
          </div>
        {/each}
      </div>
    {/each}
  {/if}

  <Tooltip visible={tooltipVisible} targetPos={tooltipTargetPos}>
    {#if hoveredCountry}
      <p class="label caps">{$_(`country.${hoveredCountry.properties.ISO_A3.toLowerCase()}`)}</p>
      {#if vis_type !== 'map'}
        <p class="label stronger"><Number value={hoveredCountry.averted} digits={0} /></p>
        <p class="label small weaker">{deaths_averted}</p>
        <hr />

        <p class="label stronger"><Number value={hoveredCountry.deaths} digits={0} /></p>
        <p class="label small weaker">{covid_deaths}</p>
      {/if}
      {#if vis_type !== 'circles'}
        <p class="label stronger"><Number value={hoveredCountry.coverage} digits={2} unit="%" /></p>
        <p class="label small weaker">{vaccination_rate}</p>
      {/if}
    {/if}
  </Tooltip>
</div>

<style>
  .legends {
    display: flex;
    justify-content: center;
    margin-bottom: var(--space-l);
  }

  .legends-container {
    display: flex;
    flex-direction: row;
    gap: var(--space-m);
  }

  .legends :global(.legend) {
    width: auto;
  }

  circle {
    fill: var(--circle-color);
  }
  circle.averted {
    stroke: var(--color-base-teal500);
  }
  circle.deaths {
    stroke: var(--color-base-red500);
  }
  circle.background {
    display: none;
    stroke-width: 2px;
    fill: white;
  }

  circle.active {
    stroke: var(--color-theme-text);
    stroke-width: 2px;
  }

  .small-multiples {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .country-multi {
    padding-bottom: var(--space-2xs);
    margin-bottom: var(--space-xs);
    width: 90px;
  }

  .country-multi.reference circle.background {
    display: block;
    fill: white;
    stroke: var(--color-reference-country);
  }
  .country-multi.reference p {
    color: var(--color-reference-country);
    font-weight: var(--font-weights-semibold);
    text-transform: uppercase;
  }

  .country-multi svg {
    margin: 0 auto;
  }

  .country-multi p {
    text-align: center;
  }

  @media screen and (max-width: 872px) {
    .legends-container {
      flex-direction: column;
      gap: var(--space-xs);
    }
  }
</style>
