<script>
  import { scaleLinear, max, line, extent, min, curveMonotoneX } from 'd3';
  import { _ } from 'svelte-i18n';

  import { getRegion } from '../../../data/countryRegionIncomeDictionary';
  import { ChartGrid, Number } from '$lib/components';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { isMobile } from '$lib/stores/isMobile';

  export let data;

  export let parentWidth;

  $: w = parentWidth;
  $: h = $isMobile ? w * 1.5 : w * 0.6;

  const margins = {
    top: 15,
    left: 30,
    right: 20,
    bottom: 10
  };

  $: years = Object.keys(data[0])
    .filter((d) => !isNaN(d))
    .filter((d) => !$isMobile || d >= 2010)
    .map((d) => +d);
  $: countries = data.map((d) => d.iso);

  let countryData;
  $: if (data) {
    countryData = countries.map((iso) => ({
      data: years
        .filter((year) => data.find((d) => d.iso === iso)[year])
        .map((year) => ({ year, value: data.find((d) => d.iso === iso)[year] })),
      iso,
      region: getRegion(iso)
    }));
  }

  $: xScale = scaleLinear()
    .domain(extent(years))
    .range([margins.left, w - margins.right]);
  $: yScale = scaleLinear()
    .domain([0, max(countryData, (d) => max(d.data, (d) => d.value))])
    .range([h - margins.bottom - margins.top, margins.top]);

  $: lineGen = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.value))
    .curve(curveMonotoneX);

  $: highlightData = countryData
    .sort((a, b) => (a.iso === $referenceCountry ? 1 : -1))
    .filter((d) => d.data[d.data.length - 1]?.value > d.data[d.data.length - 2]?.value || d.iso === $referenceCountry);

  $: yeardedData = years.reduce((acc, year) => {
    acc[year] = countryData.map((c) => ({ iso: c.iso, value: c.data.find((d) => d.year === year)?.value }));
    acc[year] = acc[year].filter((d) => !!d.value).map((d) => ({ ...d, y: yScale(d.value) }));
    return acc;
  }, {});

  $: countryLabels = {
    BLR: $isMobile ? 2010 : 2001,
    CHE: 2016,
    EST: $isMobile ? 2012 : 1997,
    FIN: 2011,
    ISL: $isMobile ? 2015 : 2006,
    KAZ: $isMobile ? 2012 : 2008,
    LVA: $isMobile ? 2011 : 1995,
    USA: 2017,
    [$referenceCountry]: $isMobile ? 2015 : 2005
  };

  let currentYear = 2020;
  let hoverHighlight;

  function setYear(evt) {
    let mousePos = { x: evt.layerX, y: evt.layerY };
    const yearDistHalf = (xScale(2020) - xScale(2019)) / 2;
    currentYear = Math.round(xScale.invert(mousePos.x - margins.left + yearDistHalf));

    if (!years.includes(currentYear)) {
      const yearsSortedByClosest = years.sort((a, b) => Math.abs(currentYear - a) - Math.abs(currentYear - b));
      currentYear = yearsSortedByClosest[0];
    }

    // find closest highlight value
    const currentYearData = yeardedData[currentYear];
    let closest = [...currentYearData].sort((a, b) => Math.abs(a.y - mousePos.y) - Math.abs(b.y - mousePos.y))[0];

    hoverHighlight = {
      ...closest,
      year: currentYear,
      x: xScale(currentYear)
    };
  }

  $: xTicks = years.filter((year) => year % 5 === 0 || (!$isMobile && year === 2019) || year === 2020);
  $: yTicks = yScale.ticks(6);
</script>

<div class="traffic-accidents">
  <svg width={w} height={h} on:mouseover={setYear} on:mousemove={setYear} on:focus={setYear}>
    <rect x={xScale(2019)} y={0} width={xScale(2020) - xScale(2019)} height={h} />
    <g>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.right}
        scale={yScale}
        ticks={yTicks}
      />
    </g>
    {#if currentYear}
      <rect x={xScale(currentYear)} y={0} width={1} height={h} />
    {/if}
    <g>
      {#each countryData as country, i}
        <path
          style={`--region-color: var(--color-vis-region-${country.region})`}
          class:highlighted={country.iso === hoverHighlight?.iso}
          d={lineGen(country.data)}
        />
      {/each}
    </g>
    {#each highlightData as high}
      <g style={`--region-color: var(--color-vis-region-${high.region})`}>
        <path class="highlighted bg" d={lineGen(high.data)} />
        <path class="highlighted" class:reference={high.iso === $referenceCountry} d={lineGen(high.data)} />
        <!--<line
          class="highlighted"
          x1={xScale(2019)}
          x2={xScale(2020)}
          y1={yScale(countryData.find((d) => d.iso === high.iso).data.find((c) => c.year === 2019).value)}
          y2={yScale(countryData.find((d) => d.iso === high.iso).data.find((c) => c.year === 2020).value)}
        />-->
      </g>
    {/each}
    {#each xTicks as year}
      <text
        x={xScale(year)}
        y={h}
        class="year-label label middle small"
        class:weaker={year < 2019}
        class:stronger={year === 2019 || year === 2020}>{year}</text
      >
    {/each}
    {#each Object.keys(countryLabels).filter((d) => d !== 'null') as iso}
      <text
        class="country-label"
        class:stronger={iso === 'USA'}
        class:caps={iso === $referenceCountry}
        class:reference={iso === $referenceCountry}
        x={xScale(countryLabels[iso])}
        y={yScale(countryData.find((d) => d.iso === iso)?.data?.find((d) => d.year === countryLabels[iso])?.value)}
        style={`--region-color: var(--color-vis-region-${countryData.find((d) => d.iso === iso)?.region})`}
        >{$_(`country.${iso.toLowerCase()}`)}</text
      >
    {/each}
    {#if hoverHighlight}
      <g>
        <circle cx={hoverHighlight.x} cy={hoverHighlight.y} r="4" />
        <text
          style={`text-anchor: ${hoverHighlight.year < 2017 ? 'start' : 'end'}`}
          x={hoverHighlight.x + (hoverHighlight.year < 2017 ? 8 : -8)}
          y={hoverHighlight.y}><Number value={hoverHighlight.value} digits="1" /></text
        >
        <text
          style={`text-anchor: ${hoverHighlight.year < 2017 ? 'start' : 'end'}`}
          x={hoverHighlight.x + (hoverHighlight.year < 2017 ? 8 : -8)}
          y={hoverHighlight.y + 22}>{$_(`country.${hoverHighlight.iso.toLowerCase()}`)}</text
        >
      </g>
    {/if}
  </svg>
</div>

<style>
  rect {
    fill: white;
  }

  path {
    stroke: var(--color-grey-200);
    fill: none;
    stroke-linecap: round;
    pointer-events: none;
  }

  path.highlighted {
    stroke: var(--region-color);
    stroke-width: 2px;
  }
  path.highlighted.bg {
    stroke: var(--color-theme-bg-weaker);
    stroke-width: 8px;
  }
  path.reference {
    stroke: var(--color-reference-country);
  }

  text {
    pointer-events: none;
    text-anchor: start;
  }
  text.country-label {
    text-anchor: middle;
    fill: var(--region-color);
  }
  text.country-label.reference {
    fill: var(--color-reference-country);
  }
</style>
