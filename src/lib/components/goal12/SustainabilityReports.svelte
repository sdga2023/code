<script>
  import { _ } from 'svelte-i18n';
  import { scaleLinear, area, stack, extent, min, max, curveCatmullRom, color } from 'd3';

  import { referenceCountry } from '$lib/stores/referenceCountry.js';

  import ChartGrid from './../ChartGrid.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import Tooltip from '../general/Tooltip.svelte';
  import { RefCountryOffset, RefOffset } from '$lib/styles/vis';
  import Number from '../general/Number.svelte';

  export let data;
  export let y_units;

  const incomeLevels = [
    { key: 'HIC', label: 'High income', cssVar: '--color-vis-income-high', hexColor: '#1b607d' },
    { key: 'UMC', label: 'Upper middle income', cssVar: '--color-vis-income-upper-middle', hexColor: '#7b8ad0' },
    { key: 'LMC', label: 'Lower middle income', cssVar: '--color-vis-income-lower-middle', hexColor: '#d36f8e' },
    { key: 'LIC', label: 'Low income', cssVar: '--color-vis-income-low', hexColor: '#aa2626' }
  ];

  $: countryCodes = Array.from(new Set(data.map((d) => d.code)));

  $: stackableData = data
    .sort(
      (a, b) =>
        incomeLevels.findIndex((d) => d.label === a.incgroup_current) - incomeLevels.findIndex((d) => d.label === b.incgroup_current)
    )
    .reduce((acc, val) => {
      const year = val.year;
      let yearData = acc.find((d) => d.year === year);
      if (!yearData) {
        yearData = { year };
        acc.push(yearData);
      }
      yearData[val.code] = val.number;
      return acc;
    }, [])
    .sort((a, b) => a.year - b.year);

  $: incomes = data.reduce((acc, val) => {
    acc[val.code] = incomeLevels.find((d) => d.label === val.incgroup_current)?.cssVar;
    return acc;
  }, {});

  $: maxYPerYear = stackableData.map((val) => countryCodes.reduce((a, code) => (val[code] ? a + +val[code] : a), 0));
  $: maxY = max(maxYPerYear);

  $: stackedData = data ? stack().keys(countryCodes)(stackableData) : [];

  let margins = {
    top: 0,
    right: 20,
    bottom: 24,
    left: 36
  };

  let w;
  let h = 500;

  $: allYears = stackableData.map((d) => d.year);

  $: xCenterIndex = Math.floor(allYears.length / 2);

  $: xScale = scaleLinear()
    .domain(extent(stackableData, (d) => d.year))
    .range([0, w - margins.left - margins.right]);
  $: xTicks = allYears;
  $: yScale = scaleLinear()
    .domain([0, maxY])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicks = yScale.ticks(6);

  $: areaGenerator = area()
    .x((d) => xScale(d.data.year))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]))
    .curve(curveCatmullRom);

  let hoverCountryData;
  let tooltipTargetPos = { x: 0, y: 0 };
  function setHoverCountry(evt, countryCode) {
    if (countryCode) {
      const countryData = data.filter((d) => d.code === countryCode);
      hoverCountryData = countryData;

      const x = evt.clientX;
      const y = evt.clientY;

      tooltipTargetPos = { ...tooltipTargetPos, x, y };
    } else {
      hoverCountryData = null;
    }
  }
</script>

<div class="stacked-area" bind:clientWidth={w}>
  <svg width={w} height={h}>
    <rect x="0" y="0" width={w} height={h} on:mouseover={(e) => setHoverCountry(e, null)} on:focus={(e) => setHoverCountry(e, null)} />
    <g transform={'translate(0,' + margins.top + ')'}>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.right}
        scale={yScale}
        ticks={yTicks}
        yAxisTitle={y_units}
      />
    </g>
    <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xTicks}
        hideLines={true}
      />
      <g>
        {#each stackedData as serie, i}
          <path
            d={areaGenerator(serie)}
            class:selected={hoverCountryData ? hoverCountryData[0].code === serie.key : false}
            style={`--fill-color: var(${incomes[serie.key]})`}
            data-code={serie.key}
            on:mouseover={(e) => setHoverCountry(e, serie.key)}
            on:focus={(e) => setHoverCountry(e, serie.key)}
          />
        {/each}
      </g>
      {#each stackedData.filter((d) => d.key === $referenceCountry) as refStack}
        <path
          d={areaGenerator(refStack)}
          class="emphasisbg"
          on:mouseover={(e) => setHoverCountry(e, refStack.key)}
          on:focus={(e) => setHoverCountry(e, refStack.key)}
        />
        <path
          d={areaGenerator(refStack)}
          class="reference"
          on:mouseover={(e) => setHoverCountry(e, refStack.key)}
          on:focus={(e) => setHoverCountry(e, refStack.key)}
        />
        <text
          class="reference-label middle small"
          x={xScale(refStack[xCenterIndex].data.year)}
          y={(yScale(refStack[xCenterIndex][1]) - yScale(refStack[xCenterIndex][0])) / 2 + yScale(refStack[xCenterIndex][0]) - 10}
          >{$_(`country.${$referenceCountry.toLowerCase()}`)}</text
        >
        <text
          class="reference-label middle"
          x={xScale(refStack[xCenterIndex].data.year)}
          y={(yScale(refStack[xCenterIndex][1]) - yScale(refStack[xCenterIndex][0])) / 2 + yScale(refStack[xCenterIndex][0]) + 10}
          ><Number value={data.filter((d) => d.code === refStack.key).reduce((a, v) => a + v.number, 0)} /></text
        >
      {/each}
    </g>
  </svg>
  {#if hoverCountryData}
    <Tooltip visible={true} targetPos={tooltipTargetPos}>
      <p class="label caps">{$_(`country.${hoverCountryData[0].code.toLowerCase()}`)}</p>
      <p class="label small weaker">{min(allYears)} - {max(allYears)}</p>
      <p class="label stronger"><Number value={hoverCountryData.reduce((a, v) => a + v.number, 0)} /></p>
      <p class="label small weaker">{y_units}</p>
    </Tooltip>
  {/if}
  <CategoricalLegend legendType="income" />
</div>

<style>
  rect {
    fill: none;
  }

  path {
    fill: var(--fill-color);
  }

  .stacked-area path.selected {
    opacity: 0.7;
  }
</style>
