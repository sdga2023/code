<script>
  import { _ } from 'svelte-i18n';
  import * as topojson from 'topojson-client';
  import { geoEqualEarth, geoPath, json, interpolateHcl, scaleSequential, scaleLog, extent, filter, scaleDiverging, median } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { toCircle } from '$lib/external/flubber/flubber.min.js';
  import TweenedCountry from './TweenedCountry.svelte';
  import TweenedCountryOutline from './TweenedCountryOutline.svelte';
  import { fade } from 'svelte/transition';
  import ChartGrid from './../ChartGrid.svelte';
  import Lens from './../general/Lens.svelte';
  import Tooltip from './../general/Tooltip.svelte';
  import Number from '../general/Number.svelte';
  import { polygon } from '@turf/helpers';
  import area from '@turf/area';
  import { max } from 'd3-array';
  import Legend from '$lib/components/general/Legend.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import TweenedReferenceLabel from './TweenedReferenceLabel.svelte';

  import countriesJSON from '../../../data/other/wb_countries_topo.json';
  import disputedJSON from '../../../data/other/wb_disputed_areas_topo.json';
  import landJSON from '../../../data/other/wb_land_topo.json';
  import centroidsJSON from '../../../data/other/country_centroids.json';
  import { DivergingNegPos } from '$lib/styles/colorscales';
  import { isMobile } from '$lib/stores/isMobile';
  import * as Tokens from '$lib/styles/vis.js';

  export let data;
  export let activeScene = { index: 0 };
  export let xaxistitle;
  export let xaxisunits;
  export let yaxistitle;
  export let yaxisunits;
  export let internationalpovertyline;
  export let lessthan;
  export let hicpovertyline;
  export let hiclessthan;
  export let povertyline;
  export let gdpcapita;
  export let perday;
  export let legendtitle;
  export let parentWidth;
  export let parentHeight;

  $: radius = $isMobile ? Tokens.ScatterCircleRadiusMob : Tokens.ScatterCircleRadius;

  let colorScale = () => {};
  let ext = [];

  $: if (data) {
    ext = extent(data, (d) => d.povertyline);
    colorScale = scaleDiverging()
      .interpolator(DivergingNegPos)
      .domain([ext[0], median(data, (d) => d.povertyline), ext[1]]);
  }

  let margins = {
    top: 35,
    right: 20,
    bottom: 35, //for axes labels
    left: 10
  };

  $: wideLayout = parentWidth / parentHeight > 1.7;
  $: w = wideLayout ? parentHeight * 1.7 : parentWidth;
  $: h = wideLayout ? parentHeight : parentWidth / 1.7;

  console.log(countriesJSON);

  let countries = topojson.feature(countriesJSON, countriesJSON.objects.wb_countries).features;
  // Sort the polyons of the multipolygons, so that the biggest one is first (flubber takes this one and discards the other ones)
  countries.forEach((cntr, i) => {
    if (cntr.geometry.coordinates.length > 1 && cntr.properties.ISO_A3 != 'ZAF' && cntr.properties.ISO_A3 != 'NIC') {
      let areas = cntr.geometry.coordinates.map((ar) => area(polygon(ar)));
      let maxAreaIndex = areas.indexOf(max(areas));
      let maxAreaPolygon = cntr.geometry.coordinates.splice(maxAreaIndex, 1);
      cntr.geometry.coordinates = maxAreaPolygon.concat(cntr.geometry.coordinates);
      // RUSSIA IS UNWILLING TO COOPERATE HERE
      if (cntr.properties.ISO_A3 == 'RUS') {
        //console.log(cntr.geometry.coordinates)
      }
    }
  });
  let disputed = topojson.feature(disputedJSON, disputedJSON.objects.wb_disputed_areas).features;
  let land = topojson.feature(landJSON, landJSON.objects.wb_land).features;
  let centroids = centroidsJSON.features;

  // cut off Hawaii to enlarge the map significantly:
  $: projection = geoEqualEarth().fitExtent(
    [
      [$isMobile ? -40 : 0, 0],
      [w, h]
    ],
    { type: 'Sphere' }
  );

  let countriesWithoutData = null;
  let countriesWithData = null;
  let dataReady = false;

  $: if (data && countries) {
    countries.forEach((c) => {
      if (data.map((d) => d.countrycode).includes(c.properties.ISO_A3)) {
        const cntr = data.find((d) => d.countrycode == c.properties.ISO_A3);
        c.povertyline = cntr.povertyline;
        c.gdp = cntr.gdp;
        c.incomegroup = cntr.incomegroup;
      } else {
        c.povertyline = null;
        c.gdp = null;
      }
    });
    countriesWithoutData = countries.filter((d) => d.povertyline == null);
    countriesWithData = countries.filter((d) => d.povertyline != null);
    //Move low income countries to the end, so they are rendered on top
    countriesWithData = countriesWithData
      .filter((d) => d.incomegroup != 'LIC' && d.incomegroup != 'HIC')
      .concat(countriesWithData.filter((d) => d.incomegroup == 'LIC' || d.incomegroup == 'HIC'));
  }

  // Steps 1-3, choropleth
  let tanzania = null;
  let france = null;
  let refCountry = null;
  let centroidTanzania = null;
  let centroidFrance = null;
  let centroidRefCountry = null;

  $: if (countries) tanzania = countries.find((c) => c.properties.ISO_A3 === 'TZA');
  $: if (countries) france = countries.find((c) => c.properties.ISO_A3 === 'FRA');
  $: if (countriesWithData && $referenceCountry && countriesWithData.find((c) => c.properties.ISO_A3 === $referenceCountry))
    refCountry = countriesWithData.find((c) => c.properties.ISO_A3 === $referenceCountry);

  $: if (centroids) centroidTanzania = centroids.find((c) => c.properties.iso_3c === 'TZA');
  $: if (centroids) centroidFrance = centroids.find((c) => c.properties.iso_3c === 'FRA');
  $: if (centroids && $referenceCountry) centroidRefCountry = centroids.find((c) => c.properties.iso_3c === $referenceCountry);

  $: if (countriesWithData && xScale && yScale && w && h) {
    countriesWithData.forEach((d) => {
      let path = geoPath().projection(projection)(d);
      d.countryPath = path;
      d.countryCirclePath = toCircle(path, xScale(d.gdp), yScale(d.povertyline), radius)(1);
    });
    dataReady = true;

    countriesWithData = countriesWithData;
  }

  // Only add map background layers after transition from scatter plot has finished
  let prevIndex;
  let transitionedToMap = false;
  $: {
    if (prevIndex === 1 && activeScene.index == 2) {
      transitionedToMap = true;
    }
    if (activeScene.index == 3) {
      transitionedToMap = false;
    }
    if (prevIndex === 3 && activeScene.index == 2) {
      setTimeout(() => {
        transitionedToMap = true;
      }, 1500);
    }
    prevIndex = activeScene.index;
  }

  // Step 4, transition to scatterplot
  $: xScale = scaleLog()
    .range([0, w - margins.right - margins.left])
    .domain([2.3, 400]);
  $: xTicks = w < 600 ? [10, 50, 100, 300] : [10, 50, 100, 200, 300];

  $: yScale = scaleLog()
    .range([h - margins.bottom - margins.top, 0])
    .domain([0.7, 40]);
  const yTicks = [1, 5, 10, 20, 30, 40];

  let tooltipVisible = false;
  let tooltipTargetPos = { x: 0, y: 0 };
  function showTooltip(e) {
    tooltipVisible = true;
    const x = e.clientX;
    const y = e.clientY;
    tooltipTargetPos = { ...tooltipTargetPos, x, y };
  }
  function hideTooltip() {
    tooltipVisible = false;
  }
  let hoveredCountry;

  let tanzaniaEl;
  $: tanzaniaBBox = tanzaniaEl ? tanzaniaEl.getBoundingClientRect() : null;
  $: tanzaniaLensR = tanzaniaBBox ? Math.max(tanzaniaBBox.width, tanzaniaBBox.height) / 2 + 6 : 0;

  $: refCentroidInLens = centroidRefCountry
    ? (projection(centroidRefCountry.geometry.coordinates)[0] > projection(centroidTanzania.geometry.coordinates)[0] - tanzaniaLensR &&
        projection(centroidRefCountry.geometry.coordinates)[0] < projection(centroidTanzania.geometry.coordinates)[0] + tanzaniaLensR &&
        projection(centroidRefCountry.geometry.coordinates)[1] > projection(centroidTanzania.geometry.coordinates)[1] - tanzaniaLensR &&
        projection(centroidRefCountry.geometry.coordinates)[1] < projection(centroidTanzania.geometry.coordinates)[1] + tanzaniaLensR) ||
      (projection(centroidRefCountry.geometry.coordinates)[0] > projection(centroidFrance.geometry.coordinates)[0] - tanzaniaLensR &&
        projection(centroidRefCountry.geometry.coordinates)[0] < projection(centroidFrance.geometry.coordinates)[0] + tanzaniaLensR &&
        projection(centroidRefCountry.geometry.coordinates)[1] > projection(centroidFrance.geometry.coordinates)[1] - tanzaniaLensR &&
        projection(centroidRefCountry.geometry.coordinates)[1] < projection(centroidFrance.geometry.coordinates)[1] + tanzaniaLensR &&
        activeScene.index < 3)
    : true;

  let previousIndex;
  let prevRefCountry;
  let lastChange;
  $: {
    if (previousIndex === activeScene.index && prevRefCountry !== $referenceCountry) {
      lastChange = 'refcountry';
    } else {
      lastChange = 'scroll';
    }
    previousIndex = activeScene.index;
    prevRefCountry = $referenceCountry;
  }
</script>

{#if w && h}
  <div class="svg-container scatterplot map" bind:clientHeight={h} bind:clientWidth={w}>
    <svg width={w} height={h}>
      {#if activeScene?.index > 2}
        <g transform={`translate(0,${margins.top})`} transition:fade|local>
          <ChartGrid
            gridType="yGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.left - margins.right}
            scale={yScale}
            ticks={yTicks}
            yAxisUnits={yaxisunits}
            yAxisTitle={yaxistitle}
          />
        </g>
        <g transform={`translate(${margins.left},${margins.top})`}>
          <ChartGrid
            gridType="xGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.left - margins.right}
            scale={xScale}
            ticks={xTicks}
            xAxisUnits={xaxisunits}
            xAxisTitle={xaxistitle}
          />
        </g>
      {/if}
      <g transform={`translate(${margins.left},${margins.top})`}>
        {#if activeScene?.index < 2 || (activeScene.index == 2 && transitionedToMap)}
          {#if disputed && activeScene.index < 3}
            {#each disputed as disp}
              <path d={geoPath().projection(projection)(disp)} class="not-available" transition:fade|local />
            {/each}
          {/if}
          {#if countriesWithoutData && activeScene.index < 3}
            {#each countriesWithoutData as country}
              <path d={geoPath().projection(projection)(country)} class="not-available" transition:fade|local />
            {/each}
          {/if}
        {/if}
        {#if countriesWithData && colorScale && dataReady}
          {#each countriesWithData as country}
            <TweenedCountry
              countryData={country}
              {showTooltip}
              {hideTooltip}
              bind:hoveredCountry
              countryOrCircle={activeScene.index > 2 ? 'circle' : 'country'}
              countryPath={country.countryPath}
              countryCircle={country.countryCirclePath}
              fill={activeScene.index > 1
                ? colorScale(country.povertyline)
                  ? colorScale(country.povertyline)
                  : Colors.ColorVisFilteredOut
                : Colors.ColorVisFilteredOut}
              {activeScene}
              incomegroup={country.incomegroup}
            />
          {/each}
        {/if}

        {#if activeScene?.index === 1 && centroidFrance && france}
          <path d={geoPath().projection(projection)(france)} fill={colorScale(france.povertyline)} transition:fade|local />
        {/if}

        {#if (land && activeScene?.index < 2) || (land && activeScene.index == 2 && transitionedToMap)}
          {#each land as line}
            <path class="land" d={geoPath().projection(projection)(line)} transition:fade|local />
          {/each}
        {/if}

        {#if hoveredCountry}
          <TweenedCountryOutline
            countryOrCircle={activeScene.index > 2 ? 'circle' : 'country'}
            countryPath={hoveredCountry.countryPath}
            countryCircle={hoveredCountry.countryCirclePath}
          />
        {/if}
        {#if $referenceCountry && refCountry && centroidRefCountry}
          <TweenedCountryOutline
            countryOrCircle={activeScene.index > 2 ? 'circle' : 'country'}
            countryPath={refCountry.countryPath}
            countryCircle={refCountry.countryCirclePath}
            reference={true}
            trigger={lastChange}
          />
          {#if (!refCentroidInLens || activeScene.index > 2) && data.find((d) => d.countrycode == $referenceCountry)}
            <TweenedReferenceLabel
              {activeScene}
              mapX={projection(centroidRefCountry.geometry.coordinates)[0]}
              mapY={projection(centroidRefCountry.geometry.coordinates)[1]}
              scatterX={xScale(refCountry.gdp)}
              scatterY={yScale(refCountry.povertyline)}
              country={$_(`country.${$referenceCountry.toLowerCase()}`)}
              value={data.find((d) => d.countrycode == $referenceCountry).povertyline}
              unit={'$'}
              unitSuffix={perday}
              trigger={lastChange}
            />
          {/if}
        {/if}

        {#if activeScene?.index < 2 && centroidTanzania && tanzania}
          <path
            d={geoPath().projection(projection)(tanzania)}
            fill={colorScale(tanzania.povertyline)}
            transition:fade|local
            bind:this={tanzaniaEl}
          />
          <Lens
            x={projection(centroidTanzania.geometry.coordinates)[0]}
            y={projection(centroidTanzania.geometry.coordinates)[1]}
            r={tanzaniaLensR}
          />
          <text
            x={projection(centroidTanzania.geometry.coordinates)[0] + tanzaniaLensR + 4}
            y={projection(centroidTanzania.geometry.coordinates)[1] - 4}
            class={'geo'}
            transition:fade|local>{$_('country.tza')}</text
          >
          <text
            x={projection(centroidTanzania.geometry.coordinates)[0] + tanzaniaLensR + 4}
            y={projection(centroidTanzania.geometry.coordinates)[1] + 18}
            class={'number'}
            transition:fade|local><Number value={1.62} unit="$" />{perday}</text
          >
        {/if}

        {#if activeScene.index > 4}
          <text
            x={10}
            y={activeScene.index == 5 ? yScale(2.15) + 18 : yScale(24.35) + 18}
            fill={Colors.ColorVisBinaryNeg}
            class={'stronger caps'}
            transition:fade|local>{activeScene.index == 5 ? internationalpovertyline : hicpovertyline}</text
          >
          <text
            x={10}
            y={activeScene.index == 5 ? yScale(2.15) + 35 : yScale(24.35) + 35}
            fill={Colors.ColorVisBinaryNeg}
            class={'weaker small'}
            transition:fade|local>{activeScene.index == 5 ? lessthan : hiclessthan}</text
          >
        {/if}

        {#if activeScene?.index == 5}
          <line
            x1={10}
            x2={w - margins.left - margins.right}
            y1={yScale(2.15)}
            y2={yScale(2.15)}
            stroke-width={1.5}
            stroke={Colors.ColorVisSelected}
            transition:fade|local
          />
        {/if}

        {#if activeScene?.index == 6}
          <line
            x1={10}
            x2={w - margins.left - margins.right}
            y1={yScale(24.35)}
            y2={yScale(24.35)}
            stroke-width={1.5}
            stroke={Colors.ColorVisSelected}
            transition:fade|local
          />
        {/if}

        {#if activeScene?.index === 1 && centroidFrance && france}
          <Lens
            x={projection(centroidFrance.geometry.coordinates)[0]}
            y={projection(centroidFrance.geometry.coordinates)[1]}
            r={tanzaniaLensR}
          />
          <text
            x={projection(centroidFrance.geometry.coordinates)[0] + tanzaniaLensR + 4}
            y={projection(centroidFrance.geometry.coordinates)[1] - 4}
            class={'geo'}
            transition:fade|local>{$_('country.fra')}</text
          >
          <text
            x={projection(centroidFrance.geometry.coordinates)[0] + tanzaniaLensR + 4}
            y={projection(centroidFrance.geometry.coordinates)[1] + 18}
            class={'number'}
            transition:fade|local><Number value={27.39} unit="$" />{perday}</text
          >
        {/if}
      </g>
    </svg>
  </div>
{/if}

<Legend title={legendtitle} color={colorScale} unitLabel={yaxisunits} digits="2" units="$" hidden={activeScene.index < 2} />

<Tooltip visible={tooltipVisible} targetPos={tooltipTargetPos}>
  {#if hoveredCountry}
    <p class="geo">{$_(`country.${hoveredCountry.properties.ISO_A3.toLowerCase()}`)}</p>
    <p class="number"><Number value={hoveredCountry.povertyline} digits={2} unit="$" />{perday}</p>
    {#if activeScene?.index > 2}
      <p class="label small weaker">{povertyline}</p>
      <hr />
      <p class="number"><Number value={hoveredCountry.gdp} digits={2} unit="$" />{perday}</p>
      <p class="label small weaker">{gdpcapita}</p>
    {/if}
  {/if}
</Tooltip>

<style>
  .svg-container {
    flex: 1;
    overflow: hidden;
  }
  svg {
    margin: auto;
  }
</style>
