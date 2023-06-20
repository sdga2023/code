<script>
  import { scaleLinear, scaleLog } from 'd3-scale';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';
  import { fade } from 'svelte/transition';
  import Lens from './../general/Lens.svelte';
  import { line, curveNatural } from 'd3-shape';
  import TweenedLine from './TweenedLine.svelte';
  import TweenedCircle from './TweenedCircle.svelte';
  import povertyTargetMet from '../../../data/goal01/goal01.povertytargetmet.json';
  import maliProjections from '../../../data/goal01/goal01.maliprojections.json';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import Tooltip from './../general/Tooltip.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import Number from '../general/Number.svelte';
  import * as Tokens from '$lib/styles/vis.js';
  import { isMobile } from '$lib/stores/isMobile';

  export let data;
  export let activeScene = { index: 0 };
  export let povertytargetnotmet;
  export let povertyrateaxistitle;
  export let povertyrateaxisunits;
  export let ghgaxistitle;
  export let ghgaxisunits;
  export let xaxistitle;
  export let xaxisunits;
  export let incomeneededpovertytarget;
  export let parentWidth;
  export let parentHeight;

  //$: data22 = data ? data.filter((d) => d.year == 2022) : [];
  $: data19 = data ? data.filter((d) => d.year == 2019) : [];
  $: chnData = data ? data.filter((d) => d.iso3c == 'CHN') : [];
  $: mliData = data ? data.filter((d) => d.iso3c == 'MLI') : [];

  $: radius = $isMobile ? Tokens.ScatterCircleRadiusMob : Tokens.ScatterCircleRadius;

  $: referenceCountryData =
    $referenceCountry && data19.find((d) => d.iso3c == $referenceCountry) ? data19.find((d) => d.iso3c == $referenceCountry) : null;

  let margins = {
    top: 30,
    right: 30,
    bottom: 35,
    left: 0
  };

  $: w = parentWidth;
  $: h = parentHeight;

  $: xScale = scaleLog()
    .domain([500, 120000])
    .range([0, w - margins.left - margins.right]);

  $: xTicks = [1000, 5000, 10000, 50000, 100000];

  let yScale = scaleLinear()
    .domain([0, 100])
    .range([h - margins.top - margins.bottom, 0]);
  let yTicks = [0, 25, 50, 75, 100];

  $: if (activeScene.index > 2) {
    yScale = scaleLog()
      .domain([0.025, 30])
      .range([h - margins.top - margins.bottom, 0]);
    yTicks = [0.025, 1, 10, 20, 30];
  }
  $: if (activeScene.index < 3) {
    yScale = scaleLinear()
      .domain([0, 100])
      .range([h - margins.top - margins.bottom, 0]);
    yTicks = [0, 25, 50, 75, 100];
  }

  $: projectionGenerator = line()
    .x((d) => xScale(d.gdppc_need_baseline))
    .y((d) => (activeScene.index == 10 ? yScale(d.ghgpc_need_energy) : yScale(d.ghgpc_need_baseline)))
    .curve(curveNatural);

  let currentCountry;
  let currentYear;
  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }

  const tweenedChina = tweened(undefined, {
    duration: 500,
    easing: cubicOut
  });
  $: if (activeScene.index < 3) {
    tweenedChina.set(yScale(data19.find((d) => d.iso3c == 'CHN').povertyrate));
  }

  $: if (activeScene.index > 2) {
    tweenedChina.set(yScale(data19.find((d) => d.iso3c == 'CHN').ghgpc));
  }
  const tweenedMaliProjection = tweened(8687, {
    duration: 500,
    easing: cubicOut
  });
  $: if (activeScene.index < 11) {
    tweenedMaliProjection.set(8687);
  }

  $: if (activeScene.index > 10) {
    tweenedMaliProjection.set(3891);
  }
</script>

{#if w}
  <div class="svg-container" bind:clientHeight={h} bind:clientWidth={w}>
    <svg width={w} height={h} on:mousemove={updateMouse} class="scatterplot">
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={yScale}
          ticks={yTicks}
          yAxisUnits={activeScene.index < 3 ? povertyrateaxisunits : ghgaxisunits}
          yAxisTitle={activeScene.index < 3 ? povertyrateaxistitle : ghgaxistitle}
        />
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.left - margins.right}
          scale={xScale}
          ticks={xTicks}
          xAxisUnits={xaxisunits}
          xAxisTitle={xaxistitle}
        />
        <!-- Outline for hover -->
        {#if currentCountry && !currentYear}
          <circle
            cx={xScale(data19.find((d) => d.iso3c == currentCountry).gdppc)}
            cy={activeScene.index < 3
              ? yScale(data19.find((d) => d.iso3c == currentCountry).povertyrate)
              : yScale(data19.find((d) => d.iso3c == currentCountry).ghgpc)}
            r={radius + 1}
            class="emphasis"
          />
        {/if}

        {#if currentCountry == 'CHN' && currentYear}
          <circle
            cx={xScale(chnData.find((d) => d.year == currentYear).gdppc)}
            cy={activeScene.index < 3
              ? yScale(chnData.find((d) => d.year == currentYear).povertyrate)
              : yScale(chnData.find((d) => d.year == currentYear).ghgpc)}
            r={radius + 1}
            class="emphasis"
          />
        {/if}
        {#if currentCountry == 'MLI' && currentYear}
          <circle
            cx={xScale(mliData.find((d) => d.year == currentYear).gdppc)}
            cy={activeScene.index < 3
              ? yScale(mliData.find((d) => d.year == currentYear).povertyrate)
              : yScale(mliData.find((d) => d.year == currentYear).ghgpc)}
            r={radius + 1}
            class="emphasis"
          />
        {/if}

        <!-- Country circles -->
        {#each data19 as cntr}
          <TweenedCircle
            {activeScene}
            x={xScale(cntr.gdppc)}
            yStart={yScale(cntr.povertyrate)}
            yEnd={yScale(cntr.ghgpc)}
            fill={activeScene.index > 4 && povertyTargetMet.find((d) => d.iso3c == cntr.iso3c).povertytargetmet == 0
              ? Colors.ColorVisBinaryNeg
              : Colors.ColorBaseBlue500}
            opacity={activeScene.id == 'gdpvspovertychina'
              ? cntr.iso3c == 'CHN'
                ? 1
                : 0.1
              : (activeScene.index > 1 && activeScene.index < 4) || activeScene.index > 5
              ? cntr.iso3c == 'MLI' && activeScene.index > 5
                ? 1
                : 0.1
              : 1}
            country={cntr.iso3c}
            bind:currentCountry
          />
        {/each}

        <!-- Highlight China -->
        {#if activeScene.id == 'gdpvspovertychina'}
          <Lens
            x={xScale(data19.find((d) => d.iso3c == 'CHN').gdppc)}
            y={yScale(data19.find((d) => d.iso3c == 'CHN').povertyrate)}
            r={16}
          />
        {/if}
        {#if activeScene.index > 0 && activeScene.index < 4}
          <text class={'geo middle'} x={xScale(data19.find((d) => d.iso3c == 'CHN').gdppc)} y={$tweenedChina - 22}>{$_('country.chn')}</text
          >
        {/if}

        <!-- China trajectory -->
        {#if activeScene.index > 1 && activeScene.index < 4}
          <TweenedLine data={chnData} {activeScene} {xScale} {yScale} colour={Colors.ColorBaseBlue500} />
          {#each chnData as yearData}
            <TweenedCircle
              {activeScene}
              x={xScale(yearData.gdppc)}
              yStart={yScale(yearData.povertyrate)}
              yEnd={yScale(yearData.ghgpc)}
              fill={Colors.ColorBaseBlue500}
              opacity={1}
              country={'CHN'}
              bind:currentCountry
              year={yearData.year}
              bind:currentYear
            />
          {/each}
        {/if}

        <!-- Reference country -->
        {#if referenceCountryData && (activeScene.index < 1 || (activeScene.index > 3 && activeScene.index < 6))}
          <g transition:fade|local>
            <circle
              cx={xScale(referenceCountryData.gdppc)}
              cy={activeScene.index < 2 ? yScale(referenceCountryData.povertyrate) : yScale(referenceCountryData.ghgpc)}
              r={7}
              style:fill={'none'}
              class="emphasisbg"
            />
            <circle
              cx={xScale(referenceCountryData.gdppc)}
              cy={activeScene.index < 2 ? yScale(referenceCountryData.povertyrate) : yScale(referenceCountryData.ghgpc)}
              r={7}
              style:fill={'none'}
              class="reference"
            />
            <text
              x={xScale(referenceCountryData.gdppc)}
              y={activeScene.index < 2
                ? yScale(referenceCountryData.povertyrate) + Tokens.RefOffset
                : yScale(referenceCountryData.ghgpc) + Tokens.RefOffset}
              class={'reference-label middle'}
              fill={Colors.ColorReferenceCountry}
            >
              {$_(`country.${$referenceCountry.toLowerCase()}`)}
            </text>
          </g>
        {/if}

        <!-- Mali lens -->
        {#if activeScene.id == 'maliintro'}
          <Lens x={xScale(data19.find((d) => d.iso3c == 'MLI').gdppc)} y={yScale(data19.find((d) => d.iso3c == 'MLI').ghgpc)} r={16} />
        {/if}
        {#if activeScene.index > 5}
          <text
            class={'geo middle'}
            x={xScale(data19.find((d) => d.iso3c == 'MLI').gdppc)}
            y={yScale(data19.find((d) => d.iso3c == 'MLI').ghgpc) - 22}>{$_('country.mli')}</text
          >
        {/if}

        <!-- Mali line -->
        {#if activeScene.index > 6}
          <TweenedLine data={mliData} {activeScene} {xScale} {yScale} colour={Colors.ColorVisBinaryNeg} />
          {#each mliData as yearData}
            <TweenedCircle
              {activeScene}
              x={xScale(yearData.gdppc)}
              yStart={yScale(yearData.povertyrate)}
              yEnd={yScale(yearData.ghgpc)}
              fill={Colors.ColorVisBinaryNeg}
              opacity={1}
              country={'MLI'}
              bind:currentCountry
              year={yearData.year}
              bind:currentYear
            />
          {/each}
        {/if}

        <!-- Mali second target -->
        {#if activeScene.index > 7}
          <line x1={xScale(8687.157)} x2={xScale(8687)} y1={yScale(0.025)} y2={0} stroke={Colors.ColorGrey200} stroke-width={1.5} />
        {/if}
        {#if activeScene.index > 7}
          <line
            x1={xScale($tweenedMaliProjection)}
            x2={xScale($tweenedMaliProjection)}
            y1={yScale(0.025)}
            y2={18}
            stroke={'black'}
            stroke-width={1.5}
          />
          <text class="small" x={xScale($tweenedMaliProjection)} y={14} text-anchor={'middle'}>{incomeneededpovertytarget}</text>
        {/if}

        <!-- Mali projections -->
        {#if activeScene.index > 8}
          <path
            d={projectionGenerator(maliProjections)}
            fill="none"
            stroke-width={1.5}
            stroke={Colors.ColorVisBinaryNeg}
            stroke-dasharray={'4 4'}
          />
        {/if}
      </g>
    </svg>
  </div>
{/if}

<CategoricalLegend
  legendType="custom"
  customItems={[{ key: povertytargetnotmet, colour: Colors.ColorVisBinaryNeg }]}
  hidden={activeScene.id != 'povertytargetsmet'}
/>
{#if currentCountry && mousePos}
  <Tooltip visible={true} targetPos={mousePos}>
    <p class="label geo">{$_(`country.${currentCountry.toLowerCase()}`)}</p>
    {#if activeScene.index < 3}
      <p class="number">
        <Number value={data19.find((d) => d.iso3c == currentCountry).povertyrate} digits={1} />{povertyrateaxisunits}
      </p>
      <p class="label small weaker">{povertyrateaxistitle}</p>
    {/if}
    {#if activeScene?.index > 2}
      <p class="number"><Number value={data19.find((d) => d.iso3c == currentCountry).ghgpc} digits={1} /> {ghgaxisunits}</p>
      <p class="label small weaker">{ghgaxistitle}</p>
    {/if}
    <hr />
    <p class="number"><Number value={data19.find((d) => d.iso3c == currentCountry).gdppc} digits={0} unit="$" /></p>
    <p class="label small weaker">{xaxistitle}</p>
  </Tooltip>
{/if}

{#if (currentCountry == 'CHN' || currentCountry == 'MLI') && mousePos && currentYear}
  <Tooltip visible={true} targetPos={mousePos}>
    <p class="label geo">{$_(`country.${currentCountry.toLowerCase()}`) + ', ' + currentYear}</p>
    {#if activeScene.index < 3}
      <p class="number">
        <Number
          value={currentCountry == 'CHN'
            ? chnData.find((d) => d.year == currentYear).povertyrate
            : mliData.find((d) => d.year == currentYear).povertyrate}
          digits={1}
        />{povertyrateaxisunits}
      </p>
      <p class="label small weaker">{`${povertyrateaxistitle}`}</p>
    {/if}
    {#if activeScene?.index > 2}
      <p class="number">
        <Number
          value={currentCountry == 'CHN'
            ? chnData.find((d) => d.year == currentYear).ghgpc
            : mliData.find((d) => d.year == currentYear).ghgpc}
          digits={1}
        />
        {ghgaxisunits}
      </p>
      <p class="label small weaker">{`${ghgaxistitle}`}</p>
    {/if}
    <hr />
    <p class="number">
      <Number
        value={currentCountry == 'CHN'
          ? chnData.find((d) => d.year == currentYear).gdppc
          : mliData.find((d) => d.year == currentYear).gdppc}
        digits={0}
        unit="$"
      />
    </p>
    <p class="label small weaker">{`${xaxistitle}`}</p>
  </Tooltip>
{/if}

<style>
  circle {
    transition: opacity 0.5s;
    pointer-events: all;
  }

  .svg-container {
    flex: 1;
    overflow: hidden;
  }
</style>
