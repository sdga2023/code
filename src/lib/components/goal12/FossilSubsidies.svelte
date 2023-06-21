<script>
  import * as topojson from 'topojson-client';
  import { _ } from 'svelte-i18n';

  import { geoEqualEarth, geoPath, scaleSequential, scaleLog, max, piecewise, interpolateLab } from 'd3';

  import { Number, Tooltip } from '$lib/components';

  import { getRegion } from '../../../data/countryRegionIncomeDictionary';

  import * as Colors from '$lib/styles/tokens.es6.js';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';

  import countriesJSON from '../../../data/other/wb_countries_topo.json';
  import landJSON from '../../../data/other/wb_land_topo.json';
  import centroidsJSON from '../../../data/other/country_centroids.json';

  import Legend from '../general/Legend.svelte';
  import { RedRamp } from '$lib/styles/colorscales';
  import { isMobile } from '$lib/stores/isMobile';
  import { RefCountryOffset, RefOffset } from '$lib/styles/vis';

  export let data;
  export let parentWidth, parentHeight;

  export let legend_title;
  export let legend_units;

  $: w = parentWidth;
  $: h = $isMobile ? w / 1.7 : 600;
  $: ih = h * 0.75;

  let padding = 50;

  let colorScale = () => {};
  const ramp = piecewise(interpolateLab, [
    Colors.ColorBaseDarkPurple100,
    Colors.ColorBaseYellow200,
    Colors.ColorBaseYellow300,
    Colors.ColorBaseOrange400,
    Colors.ColorBaseRed500,
    Colors.ColorBaseRed600
  ]);

  $: if (data) {
    colorScale = scaleSequential(ramp).domain([0, 5]).clamp(true);
  }

  $: yScale = scaleLog()
    .domain([0.1, max(data, (d) => d.averted)])
    .range([ih - padding, padding]);

  $: xScale = scaleLog()
    .domain([0.1, max(data, (d) => d.deaths)])
    .range([padding, w - padding]);

  let countries = topojson.feature(countriesJSON, countriesJSON.objects.wb_countries).features;
  let land = topojson.feature(landJSON, landJSON.objects.wb_land).features;
  let centroids = centroidsJSON.features;

  $: referenceCentroid = centroids.find((c) => c.properties.iso_3c === $referenceCountry);

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
        const datum = data.find((d) => d.code === c.properties.ISO_A3);
        return datum?.subsidies;
      })
      .map((c) => {
        const path = geoPath().projection(projection)(c);

        return {
          ...c,
          ...data.find((d) => d.code === c.properties.ISO_A3),
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

<div class="map">
  <svg width={w} height={h}>
    <g>
      <path d={landPath} fill={Colors.ColorVisNotAvailable} />
      {#each richData as c}
        <path
          d={c.countryPath}
          on:mouseover={(e) => showTooltip(e, c)}
          on:mouseout={hideTooltip}
          on:focus={(e) => showTooltip(e, c)}
          on:blur={hideTooltip}
          fill={c.hasOwnProperty('subsidies') ? colorScale(c.subsidies) : Colors.ColorVisNotAvailable}
          class="country"
          data-iso={c.properties.ISO_A3}
        />
      {/each}
      <path d={landPath} class="land" />
      {#each richData.filter((d) => tooltipVisible && d.properties.ISO_A3 === hoveredCountry?.properties.ISO_A3) as c}
        <path class="emphasisbg" d={c.countryPath} />
        <path class="emphasis" d={c.countryPath} />
      {/each}
      {#each richData.filter((d) => d.properties.ISO_A3 === $referenceCountry) as ref}
        <path class="emphasisbg" d={ref.countryPath} />
        <path class="reference" d={ref.countryPath} />
        <text
          class="reference-label small middle"
          x={projection(referenceCentroid.geometry.coordinates)[0]}
          y={projection(referenceCentroid.geometry.coordinates)[1] + RefCountryOffset}
          >{$_(`country.${$referenceCountry.toLowerCase()}`)}</text
        >
        <text
          class="reference-label middle"
          x={projection(referenceCentroid.geometry.coordinates)[0]}
          y={projection(referenceCentroid.geometry.coordinates)[1] + RefOffset}
          ><Number value={richData.find((d) => d.properties.ISO_A3 === $referenceCountry).subsidies} digits={1} unit="%" /></text
        >
      {/each}
    </g>
  </svg>
  <Legend
    title={legend_title}
    color={colorScale}
    units="%"
    tickLabels={[
      { value: 0, label: '0%' },
      { value: 2.5, label: '2.5%' },
      { value: 5, label: '>5%' }
    ]}
    unitLabel={legend_units}
    digits="0"
  />

  <Tooltip visible={tooltipVisible} targetPos={tooltipTargetPos}>
    {#if hoveredCountry}
      <p class="label caps">{$_(`country.${hoveredCountry.properties.ISO_A3.toLowerCase()}`)}</p>
      <p class="label stronger"><Number value={hoveredCountry.subsidies} digits={2} unit="%" /></p>
      <p class="label small weaker">{legend_units}</p>
    {/if}
  </Tooltip>
</div>
