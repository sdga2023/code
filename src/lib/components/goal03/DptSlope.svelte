<script>
  import { scaleLinear } from 'd3';
  import { _ } from 'svelte-i18n';

  import * as Colors from '$lib/styles/tokens.es6.js';

  import { getRegion } from '../../../data/countryRegionIncomeDictionary';
  import { Number, ChartGrid, CategoricalLegend } from '$lib/components';
  import { LineChartCircleRadius } from '$lib/styles/vis';
  import { referenceCountry } from '$lib/stores/referenceCountry';

  export let data;

  export let y_axis_title = 'Doses not received';

  const margins = {
    top: 35,
    left: 35,
    right: 35,
    bottom: 50
  };

  $: w = 320;
  $: h = 600;

  const legendRegions = [
    { key: $_('region.EAS'), colour: Colors.ColorVisRegionEAS },
    { key: $_('region.SSF'), colour: Colors.ColorVisRegionSSF },
    { key: $_('region.LCN'), colour: Colors.ColorVisRegionLCN },
    { key: $_('region.SAS'), colour: Colors.ColorVisRegionSAS }
  ];

  function int(s) {
    return parseInt(s.replace(/,/g, ''));
  }

  let xTicks = [2019, 2020];

  let richData;
  $: if (data) {
    richData = data.map((d) => ({
      2019: int(d[2019]) / 1000000,
      2020: int(d[2020]) / 1000000,
      country: d.country,
      region: getRegion(d.iso),
      iso: d.iso
    }));
  }

  $: xScale = scaleLinear()
    .domain([2019, 2020])
    //   .range($isMobile ? [0, w - wDiffH * 2] : [wDiffH, w - wDiffH]);
    .range([0, w - margins.left - margins.right]);

  $: yScale = scaleLinear()
    .domain([0, 3])
    .range([h - margins.bottom - margins.top, 0]);

  $: yTicks = [3.0];

  let selectedCountry = null;
  function selectCountry(c) {
    selectedCountry = c?.iso;
  }
</script>

<div class="dpt-slope">
  <svg width={w} height={h} class="slopechart">
    <g transform={`translate(${xScale(2019)}, ${margins.top})`}>
      <ChartGrid
        gridType="yGrid"
        scale={yScale}
        ticks={yTicks}
        yAxisUnits={$_('unit.millions')}
        yAxisTitle={y_axis_title}
        hideLines={true}
      />
    </g>

    <g transform={`translate(${margins.left}, ${margins.top})`}>
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={xTicks}
      />
      {#each [...richData].sort((a, b) => b[2020] - a[2020]) as dat, i}
        <line
          class:reference={$referenceCountry === dat.iso}
          x1={xScale(2019)}
          x2={xScale(2020)}
          y1={yScale(dat[2019])}
          y2={yScale(dat[2020])}
          style={`--region-color: var(--color-vis-region-${dat.region})`}
          style:stroke-width={selectedCountry === dat.iso ? 4 : 2}
        />
        <line
          class="interactive"
          x1={xScale(2019)}
          x2={xScale(2020)}
          y1={yScale(dat[2019])}
          y2={yScale(dat[2020])}
          on:mouseover={selectCountry(dat)}
          on:mouseout={selectCountry(null)}
          on:focus={selectCountry(dat)}
          on:blur={selectCountry(null)}
        />

        {#if i < 3 || selectedCountry === dat.iso || $referenceCountry === dat.iso}
          <circle
            class:reference={$referenceCountry === dat.iso}
            cx={xScale(2019)}
            cy={yScale(dat[2019])}
            fill={`var(--color-vis-region-${dat.region})`}
            r={LineChartCircleRadius}
          />
          <circle
            class:reference={$referenceCountry === dat.iso}
            cx={xScale(2020)}
            cy={yScale(dat[2020])}
            fill={`var(--color-vis-region-${dat.region})`}
            r={LineChartCircleRadius}
          />
          <text
            class={`geo small middle ${$referenceCountry === dat.iso ? 'reference-label' : ''}`}
            x={(xScale(2020) - xScale(2019)) / 2 + xScale(2019)}
            y={(yScale(dat[2020]) - yScale(dat[2019])) / 2 + yScale(dat[2019])}>{$_(`country.${dat.iso.toLowerCase()}`)}</text
          >
          <text class="axis-label small" x={xScale(2020) + 7} y={yScale(dat[2020]) + 3}><Number value={dat[2020]} digits="2" /></text>
          <text class="axis-label end" x={xScale(2019) - 7} y={yScale(dat[2019]) + 5}><Number value={dat[2019]} digits="2" /></text>
        {/if}
      {/each}
    </g>
  </svg>
  <CategoricalLegend legendType="custom" customItems={legendRegions} />
</div>

<style>
  svg {
    margin: 0 auto;
  }

  line {
    stroke: var(--region-color);
  }

  line.reference,
  circle.reference {
    stroke: var(--color-reference-country);
    fill: var(--color-reference-country);
  }

  line.interactive {
    stroke-width: 6px;
    stroke: none;
  }

  text {
    user-select: none;
  }
</style>
