<script>
  import * as topojson from 'topojson-client';

  import { _ } from 'svelte-i18n';
  import { fade } from 'svelte/transition';
  import { geoEqualEarth, geoPath, scaleSequential, max, treemap, treemapResquarify, stratify } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6';

  import { Number, Tooltip, Legend, CategoricalLegend } from '$lib/components';
  import { getRegion } from '../../../data/countryRegionIncomeDictionary';
  import countriesJSON from '../../../data/other/wb_countries_topo.json';
  import centroidsJSON from '../../../data/other/country_centroids.json';
  import landJSON from '../../../data/other/wb_land_topo.json';
  import { polygon } from '@turf/helpers';
  import area from '@turf/area';

  import { toRect } from '$lib/external/flubber/flubber.min';
  import TweenedPath from './TweenedPath.svelte';
  import IncidenceScrollerScrubber from './IncidenceScrollerScrubber.svelte';
  import { isMobile } from '$lib/stores/isMobile';
  import { RegionColorMap, WLDRamp } from '$lib/styles/colorscales';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { RefCountryOffset, RefOffset } from '$lib/styles/vis';

  export let parentWidth;
  export let parentHeight;
  export let data;
  export let activeState;

  export let maxYear;

  export let colorRamp;
  export let baseColor;

  export let accessors = [];
  export let forcedLabels = [];

  export let incidence = 'Tuberculosis incidence per 100k';
  export let cases_worldwide = 'Tuberculosis cases worldwide (estimated)';

  let scrubberHeight = 200;

  const regions = {
    LCN: 'Latin America & Caribbean',
    SAS: 'South Asia',
    SSF: 'Sub-Saharan Africa',
    ECS: 'Europe & Central Asia',
    MEA: 'Middle East & North Africa',
    NAC: 'North America',
    EAS: 'East Asia & Pacific'
  };

  const colourScale = {
    EAS: Colors.ColorVisRegionEAS,
    ECS: Colors.ColorVisRegionECS,
    LCN: Colors.ColorVisRegionLCN,
    MEA: Colors.ColorVisRegionMEA,
    NAC: Colors.ColorVisRegionNAC,
    SAS: Colors.ColorVisRegionSAS,
    SSF: Colors.ColorVisRegionSSF,
    WLD: Colors.ColorVisRegionWLD
  };

  let treemapWidth = parentWidth;
  let treemapHeight = parentHeight;
  let lineWidth = parentWidth;
  let lineHeight = parentHeight;

  const margins = {
    top: 0,
    left: 5,
    right: 5,
    bottom: 0
  };

  let countries = topojson.feature(countriesJSON, countriesJSON.objects.wb_countries).features;
  // Sort the polyons of the multipolygons, so that the biggest one is first (flubber takes this one and discards the other ones)
  countries.forEach((cntr) => {
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
  let land = topojson.feature(landJSON, landJSON.objects.wb_land).features;
  let centroids = centroidsJSON.features;

  $: referenceCentroid =
    $referenceCountry && projection
      ? projection(centroids.find((c) => c.properties.iso_3c === $referenceCountry)?.geometry.coordinates)
      : null;

  // cut off Hawaii to enlarge the map significantly:
  $: projection = geoEqualEarth().fitExtent(
    [
      [$isMobile ? -40 : 0, 0],
      [treemapWidth, treemapHeight - margins.top]
    ],
    { type: 'Sphere' }
  );

  $: relativeAccessor = accessors.find((a) => a?.relative);
  $: absoluteAccessor = accessors.find((a) => a?.absolute);

  $: onlyShowLatestYear = activeState < 2;

  $: domain = [
    0,
    max(
      data.filter((d) => d.type === relativeAccessor?.prop),
      (d) => {
        if (onlyShowLatestYear) {
          return isNaN(d[maxYear]) ? 0 : d[maxYear];
        } else {
          return max(Object.values(d), (dd) => (isNaN(dd) ? 0 : dd));
        }
      }
    )
  ];

  $: regionColorScales = Object.keys(RegionColorMap).reduce((acc, region) => {
    acc[region] = scaleSequential(RegionColorMap[region]).domain(domain);
    return acc;
  }, {});

  $: colorScale = (region, value) => {
    return regionColorScales[region](value);
  };

  $: neutralColorScale = scaleSequential(WLDRamp).domain(domain);

  let richData = [];
  $: worldData = data.filter((d) => d['Country Code'] === 'WLD');

  let emptyYearValues = {};
  for (let year = 2000; year <= maxYear; year++) {
    emptyYearValues[year] = 0;
  }

  let treemapPreparedFor = { w: null, h: null };

  $: if (data && projection && treemapWidth && treemapHeight) {
    if (treemapWidth !== treemapPreparedFor.w || treemapHeight !== treemapPreparedFor.h) {
      richData = countries
        .filter((c) => data.find((d) => d['Country Code'] === c.properties.ISO_A3))
        .map((c, i) => {
          const path = geoPath().projection(projection)(c);
          const iso = c.properties.ISO_A3;

          let accessorValues = {};
          accessors.forEach((acc) => {
            const { prop } = acc;
            const value = data.find((d) => d['Country Code'] === iso && d.type === prop);

            if (value) {
              accessorValues[prop] = {
                ...Object.keys(value).reduce((acc, year) => {
                  const val = value[year];
                  acc[year] = val === 'null' ? 0 : +val;
                  return acc;
                }, {}),
                'Country Code': iso,
                type: prop
              };
            } else {
              accessorValues[prop] = { ...emptyYearValues, 'Country Code': iso, type: prop };
            }
          });

          let countryPaths = {};
          for (let year = 2000; year <= maxYear; year++) {
            countryPaths[year] = path;
          }

          return {
            ...c,
            ...accessorValues,
            countryPaths,
            shapes: [countryPaths],
            region: getRegion(iso),
            label: $_(`country.${c.properties.ISO_A3.toLowerCase()}`)
          };
        });

      // calculate the treemaps for each year, using virtual world- and region nodes:
      let treemapPaths = {};
      let treemapPathsWithScrubber = {};

      const regionsAndCountries = [
        { 'Country Code': 'WLD', region: null },
        ...Object.keys(regions).map((regionKey) => ({ 'Country Code': regionKey, isRegion: true, region: 'WLD' })),
        ...richData
      ];

      const treeGen = treemap()
        .tile(treemapResquarify)
        .size([treemapWidth - margins.left - margins.right, treemapHeight - margins.top])
        .paddingOuter((d) => {
          if (d.data.isRegion) {
            return 4;
          } else {
            return 0;
          }
        })
        .round(true);
      const treeGenWithScrubber = treemap()
        .tile(treemapResquarify)
        .size([treemapWidth - margins.left - margins.right, treemapHeight - margins.top - scrubberHeight])
        .paddingOuter((d) => {
          if (d.data.isRegion) {
            return 4;
          } else {
            return 0;
          }
        })
        .round(true);

      for (let year = 2000; year <= maxYear; year++) {
        let root = stratify()
          .id((d) => d['Country Code'])
          .parentId((d) => d.region)(regionsAndCountries);

        root.sum((d) => d?.[absoluteAccessor.prop]?.[year]).sort((a, b) => b.value - a.value);

        //const leaves = tree.leaves();
        treemapPaths[year] = treeGen(root);

        root = stratify()
          .id((d) => d['Country Code'])
          .parentId((d) => d.region)(regionsAndCountries);

        root.sum((d) => d?.[absoluteAccessor.prop]?.[year]).sort((a, b) => b.value - a.value);
        treemapPathsWithScrubber[year] = treeGenWithScrubber(root);
      }

      richData = richData.map((country) => {
        const iso = country.properties.ISO_A3;

        let countryTreemapPaths = {};
        let countryTreemapPathsWithScrubber = {};
        let countryTreemapRects = {};
        let countryTreemapRectsWithScrubber = {};
        for (let year = 2000; year <= maxYear; year++) {
          const leaves = treemapPaths[year];
          const leaf = leaves.find((l) => l?.data?.properties?.ISO_A3 === iso);
          const treemapRect = { x: leaf.x0 + margins.left, y: leaf.y0 + margins.top, width: leaf.x1 - leaf.x0, height: leaf.y1 - leaf.y0 };

          const treemapPath = toRect(country.countryPaths[year], treemapRect.x, treemapRect.y, treemapRect.width, treemapRect.height)(1);

          const leavesWithScrubber = treemapPathsWithScrubber[year];
          const leafWithScrubber = leavesWithScrubber.find((l) => l?.data?.properties?.ISO_A3 === iso);
          const treemapWithScrubberRect = {
            x: leafWithScrubber.x0 + margins.left,
            y: leafWithScrubber.y0 + margins.top,
            width: leafWithScrubber.x1 - leafWithScrubber.x0,
            height: leafWithScrubber.y1 - leafWithScrubber.y0
          };
          const treemapPathWithScrubber = toRect(
            country.countryPaths[year],
            treemapWithScrubberRect.x,
            treemapWithScrubberRect.y,
            treemapWithScrubberRect.width,
            treemapWithScrubberRect.height
          )(1);

          countryTreemapPaths[year] = treemapPath;
          countryTreemapPathsWithScrubber[year] = treemapPathWithScrubber;
          countryTreemapRects[year] = treemapRect;
          countryTreemapRectsWithScrubber[year] = treemapWithScrubberRect;
        }

        return {
          ...country,
          shapes: [country.countryPaths, countryTreemapPaths, countryTreemapPathsWithScrubber],
          rects: [{}, countryTreemapRects, countryTreemapRectsWithScrubber]
        };
      });

      treemapPreparedFor = { w: treemapWidth, h: treemapHeight };
    }
  }

  let currentYear = maxYear;

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

  let labelsAreAnimated = true;
  $: {
    activeState;
    labelsAreAnimated = true;

    if (onlyShowLatestYear) {
      currentYear = maxYear;
    }
  }
  $: if (currentYear) {
    labelsAreAnimated = false;
  }
</script>

<div class="legend-container">
  <Legend title={incidence + ` (${onlyShowLatestYear ? maxYear : '2000 - ' + maxYear})`} color={neutralColorScale} digits="0" />
</div>
<div class="treemap-plus-graph-container" bind:clientWidth={treemapWidth} bind:clientHeight={treemapHeight}>
  <div class="treemap-container map">
    <svg width={treemapWidth} height={treemapHeight}>
      <g>
        {#each richData as c}
          <TweenedPath
            iso={c.properties.ISO_A3}
            fill={[
              c[relativeAccessor?.prop]?.[currentYear]
                ? colorScale(c.region, c[relativeAccessor?.prop]?.[currentYear])
                : Colors.ColorVisNotAvailable,
              c[relativeAccessor?.prop]?.[currentYear]
                ? colorScale(c.region, c[relativeAccessor?.prop]?.[currentYear])
                : Colors.ColorVisNotAvailable,
              c[relativeAccessor?.prop]?.[currentYear]
                ? colorScale(c.region, c[relativeAccessor?.prop]?.[currentYear])
                : Colors.ColorVisNotAvailable
            ]}
            d={c.shapes}
            state={activeState}
            {currentYear}
            h={treemapHeight}
            mouseover={(e) => showTooltip(e, c)}
            mouseout={hideTooltip}
          />
        {/each}
        <g>
          {#if land && activeState === 0}
            {#each land as line}
              <path
                in:fade={{ delay: 1000 }}
                class="land"
                d={geoPath().projection(projection)(line)}
                fill="none"
                stroke={Colors.ColorGrey600}
                stroke-width={0.5}
              />
            {/each}
          {/if}
        </g>
        {#each richData.filter((d) => d.properties.ISO_A3 === $referenceCountry || d.properties.ISO_A3 === hoveredCountry?.properties.ISO_A3) as c}
          <TweenedPath
            iso={c.properties.ISO_A3}
            fill={['transparent', 'transparent', 'transparent']}
            d={c.shapes}
            state={activeState}
            {currentYear}
            reference={c.properties.ISO_A3 === $referenceCountry}
            emphasis={c.properties.ISO_A3 !== $referenceCountry}
            mouseover={(e) => showTooltip(e, c)}
            mouseout={hideTooltip}
          />
        {/each}
      </g>
      {#if activeState > 0}
        <g in:fade|local={{ delay: 750 }} out:fade|local>
          {#each richData as c (c.label)}
            <text
              class={`label geo small ${c.properties.ISO_A3 === $referenceCountry ? 'reference-label' : 'no-stroke'}`}
              class:visible={forcedLabels.includes(c.properties.ISO_A3) ||
                c.properties.ISO_A3 === $referenceCountry ||
                (c.label.length * 10 < c.rects[activeState][currentYear].width && 18 <= c.rects[activeState][currentYear].height)}
              class:unanimated={!labelsAreAnimated}
              style={`transform: translate(${c.rects[activeState][currentYear].x + c.rects[activeState][currentYear].width / 2}px, ${
                c.rects[activeState][currentYear].y +
                c.rects[activeState][currentYear].height * ((c.region === 'SSF' ? Math.random() * 0.4 : 0.2) + 0.3)
              }px)`}
            >
              {c.label}</text
            >
          {/each}
        </g>
      {:else if referenceCentroid && !isNaN(referenceCentroid[0])}
        <text
          in:fade|local={{ duration: 1000 }}
          class="reference-label small visible"
          x={referenceCentroid[0]}
          y={referenceCentroid[1] + RefCountryOffset}>{$_(`country.${$referenceCountry.toLowerCase()}`)}</text
        >
        <text
          in:fade|local={{ duration: 1000 }}
          class="reference-label visible"
          x={referenceCentroid[0]}
          y={referenceCentroid[1] + RefOffset}
          ><Number
            value={richData.find((d) => d.properties.ISO_A3 === $referenceCountry)?.[accessors[0].prop][currentYear]}
            fallback="-"
            digits={0}
          /></text
        >
      {/if}
    </svg>
  </div>

  <div class="line-container-container" style={`--scrubber-height: ${scrubberHeight}px`} class:visible={activeState >= 2}>
    <p class="label title centered" style="padding-left: ${margins.left}px">{cases_worldwide}</p>
    <div class="line-container" bind:clientWidth={lineWidth} bind:clientHeight={lineHeight}>
      <svg width={lineWidth} height={lineHeight}>
        <IncidenceScrollerScrubber
          bind:currentYear
          richData={[...richData, ...worldData]}
          {baseColor}
          {maxYear}
          w={lineWidth}
          h={lineHeight}
          {activeState}
          {accessors}
        />
      </svg>
    </div>
  </div>
</div>
{#if !$isMobile && activeState <= 2}
  <CategoricalLegend legendType="regions" />
{/if}

<div class="tooltip-container">
  <Tooltip visible={tooltipVisible} targetPos={tooltipTargetPos}>
    {#if hoveredCountry}
      <p class="label caps">{$_(`country.${hoveredCountry.properties.ISO_A3.toLowerCase()}`)}, {currentYear}</p>
      <CategoricalLegend
        legendType="custom"
        customItems={[
          {
            key: $_(`region.${hoveredCountry.region}`),
            colour: colourScale[hoveredCountry.region]
          }
        ]}
      />
      {#each accessors as acc, i}
        <p class="label stronger"><Number value={hoveredCountry[acc.prop][currentYear]} fallback="-" digits={acc?.digits ?? 0} /></p>
        <p class="label small weaker">{acc.label}</p>
        {#if i < accessors.length - 1}
          <hr />
        {/if}
      {/each}
    {/if}
  </Tooltip>
</div>

<style type="scss">
  .treemap-plus-graph-container,
  .treemap-container {
    flex: 1;
  }

  .legend-container {
    margin-bottom: var(--space-s);
  }

  .treemap-plus-graph-container {
    display: flex;
    flex-direction: column;
  }

  .line-container {
    overflow: hidden;
  }

  .treemap-container svg {
    position: absolute;
  }

  .line-container-container {
    display: flex;
    flex-direction: column;
    height: var(--scrubber-height);

    transition: opacity 1s;

    opacity: 0;
    pointer-events: none;

    &.visible {
      opacity: 1;
      pointer-events: all;
    }
  }

  .line-container {
    flex: 1;
    width: 800px;
    max-width: 100%;
    align-self: center;
  }

  text {
    text-anchor: middle;
    dominant-baseline: middle;
    pointer-events: none;
    transition: all 1s ease-in-out;
    opacity: 0;
  }
  text.visible {
    opacity: 1;
  }
  text.unanimated {
    transition: all 0.1s ease-in-out;
  }

  path.land {
    pointer-events: none;
  }

  .tooltip-container :global(.tooltip .categorical-legend) {
    justify-content: left;
    margin: 0;
  }
</style>
