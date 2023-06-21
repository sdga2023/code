<script>
  import { scaleLinear } from 'd3-scale';
  import { extent } from 'd3-array';
  import { line, area, curveNatural, curveCatmullRom } from 'd3-shape';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';
  import Tooltip from './../general/Tooltip.svelte';
  import Number from '../general/Number.svelte';
  import Lens from '../general/Lens.svelte';

  export let data;
  export let covidimpact;
  export let warimpact;
  export let change;
  export let absolutedifference;
  export let precovid;
  export let current;
  export let prewar;

  let margins = {
    top: 0,
    right: 16,
    bottom: 30,
    left: 24
  };

  let w;
  let h = 400;

  $: xScale = scaleLinear()
    .domain(extent(data, (d) => d.year))
    .range([0, w - margins.left - margins.right]);
  const xTicks = [2015, 2020, 2022, 2024];
  let yMin = 50;
  let yMax = 130;
  $: yScale = scaleLinear()
    .domain([yMin, yMax])
    .range([h - margins.top - margins.bottom, 0]);
  let yTicks = [50, 75, 100, 125];

  $: gdpLine = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.gdp))
    .curve(curveCatmullRom);
  $: forcLine = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.gdp_forc20))
    .curve(curveNatural);
  $: forcLine22 = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.gdp_forc_jan2022))
    .curve(curveCatmullRom);
  $: diffArea = area()
    .x((d) => xScale(d.year))
    .y0((d) => yScale(d.gdp))
    .y1((d) => yScale(d.gdp_forc20))
    .curve(curveCatmullRom);

  $: preCovidAngle = (Math.atan((yScale(122.3) - yScale(112.6)) / (xScale(2024) - xScale(2022))) * 180) / Math.PI;
  $: preWarAngle = (Math.atan((yScale(109.7) - yScale(102.4)) / (xScale(2024) - xScale(2022))) * 180) / Math.PI;
  $: currentAngle = (Math.atan((yScale(59) - yScale(55.8)) / (xScale(2024) - xScale(2023))) * 180) / Math.PI;

  let currentYear;
  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }

  $: relDifference = currentYear ? data.find((d) => d.year == currentYear).gap_relative : null;
  $: absDifference = currentYear ? data.find((d) => d.year == currentYear).gap_dollars : null;
</script>

<div class="differencechart linechart" bind:clientWidth={w}>
  {#if w}
    <svg width={w} height={h} on:mousemove={updateMouse}>
      <g transform={'translate(0,' + margins.top + ')'}>
        {#if h && w && yScale && yTicks}
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
        {#if h && w && yScale && yTicks}
          <ChartGrid
            gridType="xGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.left - margins.right}
            scale={xScale}
            ticks={xTicks}
            hideLines="true"
          />
        {/if}

        <path d={diffArea(data)} style:fill={Colors.ColorVisBinaryNeg} class="area" />
        {#each data as diff}
          <rect
            x={xScale(diff.year) - 3}
            y={Math.min(yScale(diff.gdp), yScale(diff.gdp_forc20))}
            width={4}
            height={Math.abs(yScale(diff.gdp_forc20) - yScale(diff.gdp))}
            fill={diff.gdp < diff.gdp_forc20 ? Colors.ColorVisBinaryNeg : Colors.ColorVisBinaryPos}
            rx="2"
            stroke={Colors.ColorGrey700}
            stroke-width={currentYear == diff.year ? 1.5 : 0}
            on:mouseover={() => (currentYear = diff.year)}
            on:mouseout={() => (currentYear = null)}
            on:focus={() => (currentYear = diff.year)}
            on:blur={() => (currentYear = null)}
          />
        {/each}
        <path d={forcLine(data)} class="bg" />
        <path d={forcLine(data)} stroke={Colors.ColorGrey300} class="projection" />
        <path d={forcLine22(data)} class="bg" />
        <path d={forcLine22(data)} stroke={Colors.ColorVisBinaryNeg} class="projection" />
        <path d={gdpLine(data)} class="bg" />
        <path d={gdpLine(data)} stroke={Colors.ColorVisBinaryNeg} />

        <text transform={`translate(${xScale(2020)},${yScale(89)})`} class={'caps middle'}>{covidimpact}</text>
        <text transform={`translate(${xScale(2022) - 40},${yScale(65)})`} class={'caps end'}>{warimpact} </text>
        <Lens x={xScale(2020)} y={yScale(100)} r={30} />
        <Lens x={xScale(2022)} y={yScale(67)} r={30} />
        <text transform={`translate(${xScale(2024)},${yScale(123)}) rotate(${preCovidAngle})`} class={'small caps end'}>{precovid}</text>
        <text transform={`translate(${xScale(2024)},${yScale(66)}) rotate(${currentAngle})`} class={'small caps end'}>{current}</text>
        <text transform={`translate(${xScale(2024)},${yScale(111)}) rotate(${preWarAngle})`} class={'small caps end'}>{prewar}</text>
      </g>
    </svg>
    {#if currentYear && mousePos}
      <Tooltip visible={true} targetPos={mousePos}>
        <p class="label caps">{$_('country.ukr') + ', ' + currentYear}</p>
        <p class="label stronger"><Number value={relDifference + '%'} digits={1} /></p>
        <p class="label small weaker">{change}</p>
        <hr />
        <p class="label stronger"><Number value={absDifference / 1000000000} digits={2} /></p>
        <p class="label small weaker">{absolutedifference}</p>
      </Tooltip>
    {/if}
  {/if}
</div>

<style>
  .differencechart {
    position: relative;
    width: 100%;
  }
  svg {
    overflow: visible;
  }
  .annotation {
    position: absolute;
    left: 30px;
    top: -20px;
    background-color: var(--color-theme-bg);
    width: 350px;
    padding: var(--space-xs);
    box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.2);
    border: 0.5px solid var(--color-grey-200);
  }
  .title {
    margin-bottom: var(--space-l);
  }
</style>
