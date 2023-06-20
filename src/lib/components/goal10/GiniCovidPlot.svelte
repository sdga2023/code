<script>
  import { scaleSqrt, max, min, scaleLinear, scaleLog } from 'd3';
  import Tooltip from '../general/Tooltip.svelte';
  import ChartGrid from '../ChartGrid.svelte';
  import Number from '../general/Number.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { linearRegression, linearRegressionLine } from 'simple-statistics';

  import { _ } from 'svelte-i18n';

  import { getRegion, getIncomeLevel } from './../../../data/countryRegionIncomeDictionary';

  import countryPopulation from '../../../data/other/country-populations.json';
  import { isMobile } from '$lib/stores/isMobile';
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { RefOffset } from '$lib/styles/vis.js';

  const incomeLevels = [
    { key: 'HIC', label: 'High Income', cssVar: '--color-vis-income-high', hexColor: '#1b607d' },
    { key: 'UMC', label: 'Upper Middle Income', cssVar: '--color-vis-income-upper-middle', hexColor: '#7b8ad0' },
    { key: 'LMC', label: 'Lower Middle Income', cssVar: '--color-vis-income-lower-middle', hexColor: '#d36f8e' },
    { key: 'LIC', label: 'Lowe Income', cssVar: '--color-vis-income-low', hexColor: '#aa2626' }
  ];

  const regions = [
    { key: 'SSF', label: 'Sub-Saharan Africa', cssVar: '--color-vis-region-SSF' },
    { key: 'MEA', label: 'Middle East & North Africa', cssVar: '--color-vis-region-MEA' },
    { key: 'ECS', label: 'Europe & Central Asia', cssVar: '--color-vis-region-ECS' },
    { key: 'SAS', label: 'South Asia', cssVar: '--color-vis-region-SAS' },
    { key: 'EAS', label: 'East Asia & Pacific', cssVar: '--color-vis-region-EAS' },
    { key: 'NAC', label: 'North America', cssVar: '--color-vis-region-NAC' },
    { key: 'LCN', label: 'Latin America & Caribbean', cssVar: '--color-vis-region-LCN' }
  ];

  export let data;
  export let activeScene;

  export let x_label_1 = '';
  export let x_label_2 = '';
  export let y_label_1 = '';
  export let y_label_2 = '';
  export let x_units_2 = '';

  export let parentWidth;
  export let parentHeight;

  $: w = parentWidth;
  $: h = parentHeight;
  $: ah = h - 45;

  let margins = {
    top: 35,
    right: 18,
    bottom: 34,
    left: 10
  };

  let xScale = () => 0;
  let yScale = () => 0;
  $: sizeScale = scaleSqrt()
    .domain([0, max(countryPopulation, (d) => d.pop)])
    .range([5, $isMobile ? 15 : 25]);

  let yAccessor = (d) => d['meanchange'];
  let xAccessor = (d) => d['mean2019'];
  let legendType = 'income';
  let colorAccessor = (d) => regions.find((reg) => reg.key === d.region) ?? '#ece9e5';
  let xUnits = '';
  let xFormatUnits = '$';
  let xAxisLabel = 'Mean annual consumption';
  let yUnits = '%';
  let yAxisLabel = 'Change in mean income in 2020 due to COVID';

  let xTicks = [];
  let yTicks = [];

  $: if (data) {
    data = data.map((d) => ({
      ...d,
      pop: countryPopulation.find((x) => x.iso === d.code)?.pop ?? 0,
      region: getRegion(d.code),
      income: getIncomeLevel(d.code)
    }));
  }

  $: xScale = scaleLinear()
    .range([margins.left, w - margins.left - margins.right])
    .domain([0, max(data, xAccessor)]);
  $: yScale = scaleLinear()
    .range([ah - margins.top - margins.bottom, margins.top])
    .domain([min(data, yAccessor) - 1, max(data, yAccessor) + 1]);

  $: mapData = data.map((d) => [xScale(xAccessor(d)), yScale(yAccessor(d))]).filter((d) => d[0] && d[1]);
  $: fit = linearRegression(mapData);
  $: fitLine = linearRegressionLine(fit);

  $: switch (activeScene?.id) {
    case 'within_countries':
      yAccessor = (d) => d['ginichange'];
      xAccessor = (d) => d['mean2019'] / 1000;
      //legendType = 'regions';
      colorAccessor = (d) => incomeLevels.find((reg) => reg.key === d.income) ?? '#ece9e5';
      xUnits = '';
      xFormatUnits = '$';
      xAxisLabel = x_label_1;
      yUnits = '';
      yAxisLabel = y_label_1;
      break;
    case 'government_response':
      yAccessor = (d) => d['ginichange'];
      xAccessor = (d) => d['fiscalspending'];
      //legendType = 'income';
      colorAccessor = (d) => incomeLevels.find((ic) => ic.key === d.income) ?? '#ece9e5';
      xUnits = x_units_2;
      xFormatUnits = '%';
      xAxisLabel = x_label_2;
      yUnits = '';
      yAxisLabel = y_label_1;

      break;
    default:
      yAccessor = (d) => d['meanchange'];
      xAccessor = (d) => d['mean2019'] / 1000;
      colorAccessor = (d) => incomeLevels.find((reg) => reg.key === d.income) ?? '#ece9e5';
      xUnits = '';
      xFormatUnits = '$';
      xAxisLabel = x_label_1;
      yUnits = '%';
      yAxisLabel = y_label_2;
  }

  $: {
    if (activeScene?.index < 2) {
      xScale = scaleLog()
        .range([margins.left, w - margins.left - margins.right])
        .domain([min(data, xAccessor), max(data, xAccessor)]);
      xTicks = [1, 5, 10, 15, 20];
    } else {
      xScale = scaleLinear()
        .range([margins.left, w - margins.left - margins.right])
        .domain([0, max(data, xAccessor)]);
      xTicks = [0, 5, 10, 15];
    }
  }

  $: {
    if (activeScene?.index < 1) {
      yTicks = [-20, -15, -10, -5, 0, 5, 9];
    } else {
      yTicks = [-6, -4, -2, 0, 2, 4, 6];
    }
  }

  let activeCountry;
  let tooltipTargetPos = { x: 0, y: 0 };

  function setActiveCountry(evt, country) {
    activeCountry = country;

    const x = evt.clientX;
    const y = evt.clientY;

    tooltipTargetPos = { ...tooltipTargetPos, x, y };
  }
</script>

<div class="gini-covid-plot" bind:clientHeight={ah}>
  <svg width={w} height={ah} class="scatterplot"
    >{#if data}
      <g style={`transform: translate(${margins.left}px, ${margins.top}px)`}>
        <ChartGrid
          xAxisUnits={xUnits}
          xAxisTitle={xAxisLabel}
          gridType="xGrid"
          innerHeight={ah - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={xScale}
          ticks={xTicks}
        />
        <ChartGrid
          yAxisUnits={yUnits}
          yAxisTitle={yAxisLabel}
          gridType="yGrid"
          innerHeight={ah - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={yScale}
          ticks={yTicks}
        />
        {#if fit}
          <line
            class="regression"
            x1={0}
            y1={fitLine(0)}
            x2={w - margins.left - margins.right}
            y2={fitLine(w - margins.left - margins.right)}
          />
        {/if}
        <g transform={`translate(0, ${yScale(0)})`}>
          <line class="baseline" x1={0} x2={xScale.range()[1]} y1={0} y2={0} />
        </g>
        <g>
          {#if data}
            {#each [...data].sort((a, b) => b.pop - a.pop) as d}
              <g
                class="country"
                transform={`translate(${xScale(xAccessor(d))}, ${yScale(yAccessor(d))})`}
                style={`opacity: ${xScale(xAccessor(d)) ? 1 : 0}`}
              >
                <circle
                  style={`fill: var(${colorAccessor(d).cssVar})`}
                  r={sizeScale(d.pop)}
                  on:mouseover={(evt) => setActiveCountry(evt, d)}
                  on:mouseout={() => (activeCountry = null)}
                  on:focus={(evt) => setActiveCountry(evt, d)}
                  on:blur={() => (activeCountry = null)}
                />
              </g>
            {/each}
          {/if}
        </g>
        {#each data.filter((d) => d.code === $referenceCountry) as ref}
          <g
            class="country"
            transform={`translate(${xScale(xAccessor(ref))}, ${yScale(yAccessor(ref))})`}
            style={`opacity: ${xScale(xAccessor(ref)) ? 1 : 0}`}
          >
            <circle class:reference={true} r={sizeScale(ref.pop) + 2} />
            <text
              class="label reference-label"
              class:start={xScale(xAccessor(ref)) < w / 2}
              class:end={xScale(xAccessor(ref)) > w / 2}
              y={RefOffset}
              x="0">{$_('country.' + $referenceCountry.toLowerCase())}</text
            >
          </g>
        {/each}
      </g>
    {/if}
  </svg>
  {#if activeCountry}
    <Tooltip visible={activeCountry} targetPos={tooltipTargetPos}>
      <p class="label caps" style="margin-bottom: var(--space-2xs)">
        {$_(`country.${activeCountry.code.toLowerCase()}`)}
      </p>
      <p class="label number"><Number value={xAccessor(activeCountry)} unit={xFormatUnits} digits="2" /> {xUnits}</p>
      <p class="label small weaker">{xAxisLabel}</p>
      <hr />
      <p class="label number"><Number value={yAccessor(activeCountry)} digits="2" /> {yUnits}</p>
      <p class="label small weaker">{yAxisLabel}</p>
    </Tooltip>{/if}
</div>
<CategoricalLegend {legendType} />

<style type="scss">
  .gini-covid-plot {
    flex: 1;
    overflow: hidden;
  }

  svg {
    pointer-events: all;
    z-index: 999;

    margin-bottom: var(--space-m);

    line.baseline {
      stroke: var(--color-grey-800);
    }

    line.regression {
      stroke: var(--color-grey-700);
      stroke-dasharray: 4;
    }

    circle {
      transition: fill 0.5s ease-in-out;
    }
    circle:hover {
      stroke-width: 2px;
      stroke: var(--color-theme-text);
    }

    g {
      transition: transform 0.25s ease-in-out;
    }
  }

  .interrupt {
    border-color: var(--color-grey-200);
    border-width: 0.5;
  }
</style>
