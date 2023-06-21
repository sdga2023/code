<script>
  import { line, curveCatmullRom, scaleLinear, max } from 'd3';
  import { _ } from 'svelte-i18n';
  import { ChartGrid, Number } from '$lib/components';
  import { isMobile } from '$lib/stores/isMobile';
  import { LineChartCircleRadius } from '$lib/styles/vis';

  export let data;
  export let parentWidth;
  export let detection_label;

  let margins = {
    top: 0,
    right: 14,
    bottom: 20,
    left: 16
  };

  $: w = $isMobile ? parentWidth : parentWidth * 0.7;
  $: h = $isMobile ? 300 : 400;

  const years = [2000, 2021];
  const regions = {
    LCN: 'LCN',
    SAS: 'SAS',
    SSF: 'SSF',
    ECS: 'ECS',
    MEA: 'MEA',
    NAC: 'NAC',
    EAS: 'EAS'
  };

  // always sort regions by latest data:
  $: sortedRegions = Object.keys(regions).sort((a, b) => latestData[regions[b]] - latestData[regions[a]]);

  $: lineData = data ? data.map((d) => ({ ...d, year: +d['Year'].replace('YR', '') })) : [];

  $: xScale = scaleLinear()
    .domain(years)
    .range([0, w - margins.left - margins.right]);
  const xTicks = [2000, 2005, 2010, 2015, 2021];
  $: yScale = scaleLinear()
    .domain([0, 100])
    .range([h - margins.top - margins.bottom, 0]);
  const yTicks = [0, 25, 50, 75, 100];

  $: barScale = scaleLinear().domain([0, 100]).range([0, 100]);

  $: lineGen = (region) =>
    line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d[region]))
      .curve(curveCatmullRom);

  let currentYear = years[1];
  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.layerX, y: evt.layerY };
    const yearDistHalf = (xScale(2021) - xScale(2020)) / 2;
    currentYear = Math.round(xScale.invert(mousePos.x - yearDistHalf));

    if (currentYear < years[0]) currentYear = years[0];
    if (currentYear > years[1]) currentYear = years[1];
  }

  $: currentData = lineData.find((d) => d.year === currentYear);
  $: latestData = lineData.find((d) => d.year === years[1]);
  $: maximumData = Object.keys(regions).reduce((acc, region) => {
    const regionMax = max(lineData.map((d) => d[region]));
    acc[region] = regionMax;
    return acc;
  }, {});
  $: console.log(maximumData);
</script>

<div class="tuberculosis-detection">
  {#if w}
    <svg width={w} height={h} on:mousemove={updateMouse} class="linechart">
      <rect
        x={xScale(2019) + margins.left}
        width={xScale(2021) - xScale(2019)}
        y="0"
        height={h - margins.top - margins.bottom}
        class="annotated-area"
      />
      <text x={xScale(2021.5)} y={18} class="label end caps">COVID-19</text>
      <g transform={'translate(0,' + margins.top + ')'}>
        {#if yScale && yTicks && w}
          <ChartGrid
            gridType="yGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.right}
            scale={yScale}
            ticks={yTicks}
          />
        {/if}
      </g>
      <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
        {#if xScale && xTicks && w}
          <ChartGrid
            gridType="xGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.left - margins.right}
            scale={xScale}
            ticks={xTicks}
            hideLines="true"
          />
        {/if}
        {#each Object.keys(regions) as regionKey}
          <path class="bg" d={lineGen(regions[regionKey])(lineData)} style="--line-color: var(--color-vis-region-{regionKey})" />
          <path d={lineGen(regions[regionKey])(lineData)} style="--line-color: var(--color-vis-region-{regionKey})" />
        {/each}
        {#each lineData.filter((d) => d.year === currentYear) as yearlyData}
          {#each Object.keys(regions) as regionKey}
            <circle
              cx={xScale(yearlyData.year)}
              cy={yScale(yearlyData[regions[regionKey]])}
              r={LineChartCircleRadius}
              style="--line-color: var(--color-vis-region-{regionKey})"
            />
          {/each}
        {/each}
      </g>
    </svg>
  {/if}
  <div class="legend">
    <p class="label">{detection_label} <span class="label stronger">{currentYear}</span></p>
    <ul>
      {#each sortedRegions as regionKey}
        <li style="--region-color: var(--color-vis-region-{regionKey})">
          <!--<div class="region-circle" style="--region-color: var(--color-vis-region-{regionKey})" />-->
          <div>
            <p class="label geo small">{$_(`region.${regionKey}`)}</p>
            <div class="detection-container">
              <div class="detection-bar-container" style={`width: ${barScale.range()[1]}%`}>
                <div class="maximum-detection-bar" style={`width: ${barScale(maximumData[regionKey])}%`} />
                <div class="detection-bar" style={`width: ${barScale(currentData[regions[regionKey]])}%`}>
                  <p class="label stronger white"><Number value={currentData[regions[regionKey]]} digits="0" unit="%" /></p>
                </div>
              </div>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .tuberculosis-detection {
    width: 100%;
    display: flex;
  }

  svg {
    overflow: visible;
    margin-bottom: var(--space-m);
    margin-right: var(--space-m);
  }

  ul {
    margin-top: var(--space-xs);
  }

  li {
    display: flex;
    margin-bottom: var(--space-xs);
  }

  div {
    width: 100%;
  }

  div.detection-container {
    display: flex;
  }

  div.detection-container p {
    flex: 0 0 auto;
    margin-left: var(--space-2xs);
  }

  div.detection-bar,
  div.maximum-detection-bar,
  div.detection-bar-container {
    height: 1.5rem;
  }

  div.maximum-detection-bar {
    opacity: 0.3;
  }

  div.detection-bar-container {
    position: relative;
    background-color: var(--color-theme-bg-weakest);
  }
  div.detection-bar,
  div.maximum-detection-bar {
    position: absolute;
    background-color: var(--region-color);
  }

  circle {
    pointer-events: all;
    fill: var(--line-color);
  }

  path {
    stroke: var(--line-color);
    fill: transparent;
  }

  @media screen and (max-width: 872px) {
    .tuberculosis-detection {
      flex-direction: column;
    }
  }
</style>
