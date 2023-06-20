<script>
  import { nest } from 'd3-collection';
  import { scalePoint, scaleLog } from 'd3-scale';
  import { forceSimulation, forceX, forceY, forceCollide } from 'd3-force';
  import { fade } from 'svelte/transition';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { tweened } from 'svelte/motion';
  import * as eases from 'svelte/easing';
  import { CountryPicker } from '$lib/components';
  import Number from '../general/Number.svelte';
  import { _ } from 'svelte-i18n';
  import povertyLines from '../../../data/goal01/goal01.povertylines.json';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import countriesISO from '../../../data/other/wb_countries_iso3.json';
  import { isMobile } from '$lib/stores/isMobile';
  import * as Tokens from '$lib/styles/vis.js';

  export let data;
  export let abovepovertyline;
  export let belowpovertyline;
  export let yaxisunits;
  export let hicpovertyline;
  export let annotation;
  export let annotationselected;

  const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

  let margins = {
    top: 0,
    right: 0,
    bottom: 10,
    left: 0
  };

  let w;
  let h = 500;
  const vizHeight = h;

  $: radius = $isMobile ? Tokens.BeeswarmCircleRadiusMob : Tokens.BeeswarmCircleRadius;

  let nestedBeeswarmData20 = [];

  $: if (data) {
    data = data
      .filter((d) => d.year == '2019')
      .map((d) => {
        return { ...d, fy: yScale(d.welfare) };
      });
    nestedBeeswarmData20 = nest()
      .key((d) => d.region)
      .entries(data);
  }

  let countriesToRemove = countriesISO.filter((d) => !povertyLines.map((d) => d.countrycode).includes(d));
  let remove = (iso) => countriesToRemove.includes(iso);

  const regions = ['EAS', 'SAS', 'SSF', 'RESTOFWORLD'];

  $: xScale = scalePoint()
    .domain(regions)
    .range([20, w - margins.right - 20])
    .padding(0.4);

  $: yScale = scaleLog()
    .range([vizHeight - margins.bottom, margins.top])
    .domain([0.5, 400]);
  const yTicks = [0.5, 1, 2, 5, 10, 25, 50, 100, 150, 200];

  let simulation = function (data, xPosition) {
    return forceSimulation(data)
      .force('x', forceX().x(xPosition).strength(0.5))
      .force(
        'y',
        forceY()
          .y((d) => yScale(d.welfare))
          .strength(10)
      )
      .force('collide', forceCollide(radius))
      .stop();
  };

  let dataReady = false;

  // A weird check to see if the xScale is ready needed here to make it work
  $: if (!isNaN(xScale('SSF'))) {
    nestedBeeswarmData20.forEach((d, i) => {
      let sim = simulation(d.values, xScale(d.key));
      for (let i = 0, n = Math.ceil(Math.log(sim.alphaMin()) / Math.log(1 - sim.alphaDecay())); i < n; ++i) {
        sim.tick();
      }
      d.simulation = sim;
      if (i == 3) {
        dataReady = true;
      }
    });
  }

  $: swarms20 = dataReady ? nestedBeeswarmData20.map((d) => d.simulation.nodes()) : [];

  const nationalPovertyLine = tweened(24.35, {
    duration: 100,
    easing: eases.cubicInOut
  });

  $: if (povertyLines && selectedCountry) {
    $nationalPovertyLine = povertyLines.find((d) => d.countrycode == selectedCountry).povertyline;
  }

  function getCountryFromPovertyline(povline) {
    let countries = povertyLines.filter((d) => Math.round(d.povertyline * 10) / 10 == Math.round($nationalPovertyLine * 10) / 10);

    if (countries.length == 0) {
      return '';
    }
    if (countries.length == 1) {
      return countries[0].countrycode;
    }
    if (countries.length > 1) {
      if (countries.map((d) => d.countrycode).includes(selectedCountry)) {
        return selectedCountry;
      } else {
        return countries[0].countrycode;
      }
    }
  }

  let svgEl;
  let dragging = false;
  function onMouseDown() {
    dragging = true;
  }

  function onMouseMove(e) {
    if (dragging) {
      const bounds = svgEl.getBoundingClientRect();
      if (yScale.invert(e.clientY - bounds.top) > 0.5 && yScale.invert(e.clientY - bounds.top) < 300) {
        $nationalPovertyLine = yScale.invert(e.clientY - bounds.top);
        if (getCountryFromPovertyline($nationalPovertyLine) != '') {
          selectedCountry = getCountryFromPovertyline($nationalPovertyLine);
        }
        if (getCountryFromPovertyline($nationalPovertyLine) == '') {
          selectedCountry = null;
        }
      }
    }
  }

  function onMouseUp() {
    dragging = false;
  }

  let selectedCountry;
</script>

<div bind:clientWidth={w}>
  <CountryPicker bind:selectedCountry {remove} />
  <CategoricalLegend
    legendType="custom"
    top={true}
    customItems={[
      { key: abovepovertyline, colour: Colors.ColorVisBinaryPos },
      { key: belowpovertyline, colour: Colors.ColorVisBinaryNeg }
    ]}
  />
  <div class="annotation-container">
    {#if selectedCountry || getCountryFromPovertyline($nationalPovertyLine) != ''}
      <div class="annotation">
        {@html $_(annotationselected, {
          values: {
            country:
              getCountryFromPovertyline($nationalPovertyLine) == ''
                ? $_(`country.${selectedCountry.toLowerCase()}`)
                : $_(`country.${getCountryFromPovertyline($nationalPovertyLine).toLowerCase()}`),
            povertyline: $nationalPovertyLine.toFixed(1),
            peoplenumber: swarms20.flat().filter((d) => d.welfare < $nationalPovertyLine).length * 20
          }
        })}
      </div>
    {/if}
    {#if !selectedCountry && getCountryFromPovertyline($nationalPovertyLine) == ''}
      <div class="annotation">
        {@html $_(annotation, {
          values: {
            povertyline: $nationalPovertyLine.toFixed(1),
            peoplenumber: swarms20.flat().filter((d) => d.welfare < $nationalPovertyLine).length * 20
          }
        })}
      </div>
    {/if}
  </div>
  <div class="svg-container">
    <svg width={w} height={vizHeight} class="region-beeswarm beeswarm" bind:this={svgEl}>
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w}
        scale={yScale}
        ticks={yTicks}
        yAxisUnits={yaxisunits}
      />
      {#if swarms20.length > 0}
        {#each swarms20 as regionswarm}
          {#each regionswarm as node}
            <circle
              transition:fade|local={{ duration: 750 }}
              cx={0 + node.x}
              cy={node.y}
              r={radius}
              fill={node.welfare < $nationalPovertyLine ? Colors.ColorVisBinaryNeg : Colors.ColorVisBinaryPos}
            />
          {/each}
        {/each}
      {/if}
      <line x1={0} x2={w} y1={yScale($nationalPovertyLine)} y2={yScale($nationalPovertyLine)} class={'poverty-line'} />
      {#if !touchDevice}
        <line
          class="drag-line"
          x1={0}
          x2={w}
          y1={yScale($nationalPovertyLine)}
          y2={yScale($nationalPovertyLine)}
          stroke-width={20}
          opacity={0}
          on:mousedown={onMouseDown}
        />
        <g class={'drag-button'} transform={`translate(${w / 2}, ${yScale($nationalPovertyLine)})`} on:mousedown={onMouseDown}>
          <circle cx={0} cy={0} r={20} style:stroke-width={2} fill={Colors.ColorVisBinaryNeg} />
          <polyline points={'-5,-5 0,-10 5,-5'} stroke="#ffffff" fill="none" />
          <polyline points={'-5,5 0,10 5,5'} stroke="#ffffff" fill="none" />
        </g>
      {/if}
      <text x={w} y={yScale($nationalPovertyLine) + 18} class={'number'} text-anchor="end"
        ><Number value={$nationalPovertyLine} digits={1} unit="$" /> /day</text
      >
      {#if povertyLines && getCountryFromPovertyline($nationalPovertyLine) != ''}
        <text x={w} y={yScale($nationalPovertyLine) - 8} class={'geo'} text-anchor="end">
          {$_(`country.${getCountryFromPovertyline($nationalPovertyLine).toLowerCase()}`)}
        </text>
      {/if}
      {#if Math.round($nationalPovertyLine * 10, 1) / 10 == 24.4}
        <text x={w} y={yScale($nationalPovertyLine) - 8} class={w > 340 ? 'caps stronger' : 'stronger'} text-anchor="end">
          {hicpovertyline}
        </text>
      {/if}
    </svg>
  </div>
  <div class="region-label-container">
    {#each regions as region}
      <div
        class="geo region-label"
        style:left={0 + xScale(region) - xScale.step() / 2 + 'px'}
        style:bottom={0 + 'px'}
        style:width={xScale.step() + 'px'}
      >
        {$_(`region.${region}`)}
      </div>
    {/each}
  </div>
</div>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />

<style>
  svg {
    overflow: visible;
  }
  .region-label {
    position: absolute;
    text-align: center;
  }

  .poverty-line {
    stroke: var(--color-vis-binary-neg);
    stroke-width: 1.5px;
    cursor: ns-resize;
  }

  .drag-button,
  .drag-line {
    cursor: ns-resize;
  }

  polyline {
    stroke-width: 2px;
    stroke-linecap: round;
    animation: pulse 3s infinite;
  }
  @keyframes pulse {
    0% {
      stroke-width: 3px;
    }

    50% {
      stroke-width: 2px;
    }

    100% {
      stroke-width: 3px;
    }
  }
  .region-label-container {
    height: calc(var(--font-size-m) + var(--space-m));
    position: relative;
  }
  text::selection {
    background: var(--color-theme-bg-weaker);
  }

  .annotation-container {
    width: 100%;
  }
  .annotation {
    text-align: center;
    margin: auto;
    max-width: 500px;
    font-size: var(--font-size-m);
    color: var(--color-theme-text);
    text-anchor: middle;
  }
  :global(span.red-font) {
    color: var(--color-vis-binary-neg);
    font-weight: bold;
  }
</style>
