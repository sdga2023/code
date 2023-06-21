<script>
  import { scaleLinear, line, area, scaleOrdinal } from 'd3';
  import normalDist from '../../../data/other/normal-distribution.json';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import ChartGrid from './../ChartGrid.svelte';
  import { _ } from 'svelte-i18n';

  export let data;
  export let yaxistitle;
  export let xaxistitle;
  export let historicalclimate;
  export let futureclimate;
  export let lesscold;
  export let morehot;
  export let moreextreme;
  export let frequency;
  export let occurs;
  export let slidertitle;
  export let pluszero;
  export let plusfour;

  let margins = {
    top: 40,
    right: 40,
    bottom: 34,
    left: 40
  };

  let w;
  let h = 300;

  $: xScale = scaleLinear()
    .domain([-3.5, 3.5])
    .range([0, w - margins.left - margins.right]);
  $: yScale = scaleLinear()
    .domain([0, 0.4])
    .range([h - margins.top - margins.bottom, 0]);
  $: frequencyScale = scaleOrdinal()
    .domain(data.map((d) => d.warming_level))
    .range(data.map((d) => d.frequency));

  $: lineGenerator = line()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));
  $: lineGeneratorFuture = line()
    .x((d) => xScale(d.x + scaledShift))
    .y((d) => yScale(d.y));

  $: coldWeatherData = normalDist.filter((d) => d.x < -2);
  $: coldFutureWeatherData = normalDist.filter((d) => d.x < -2 - scaledShift);

  $: hotWeatherData = normalDist.filter((d) => d.x > 2);
  $: hotFutureWeatherData = normalDist.filter((d) => d.x > 2 - scaledShift);

  $: extremeWeatherData = normalDist.filter((d) => d.x > 3);
  $: extremeFutureWeatherData = normalDist.filter((d) => d.x > 3 - scaledShift);

  $: areaGenerator = area()
    .x((d) => xScale(d.x))
    .y1((d) => yScale(d.y))
    .y0((d) => yScale(0));
  $: futureAreaGenerator = area()
    .x((d) => xScale(d.x + scaledShift))
    .y1((d) => yScale(d.y))
    .y0((d) => yScale(0));

  const cellSize = 40;

  const columns = [...Array(5).keys()];
  const rows = [...Array(10).keys()];
  const yearSquare = [...Array(50).keys()];

  let shift = 1;
  $: scaledShift = 0.2 * shift;

  // Limit the shift to the possible values of [0, 1, 1.5, 2, 3, 4]
  $: if(shift != 1.5){
    shift = Math.round(shift)
  }
</script>

<div class="slider-container">
  <label class="label" for="shift">{slidertitle}</label>
  <div class="slider">
    <p class="label number">{pluszero}</p>

    <input type="range" id="shift" min={0} max={4} step={0.5} list="ticks" bind:value={shift} />
    <p class="label number">{plusfour}</p>
  </div>
  <datalist id="ticks">
    <option value="0" />
    <option value="1" />
    <option value="1.5" />
    <option value="2" />
    <option value="3" />
    <option value="4" />
  </datalist>
</div>
<div class="container linechart" bind:clientWidth={w}>
  <div>
    <svg width={w} height={h}>
      <defs>
        <marker id="arrowhead" markerWidth="5" markerHeight="6" refX="4" refY="3" orient="auto">
          <polygon points="0 0, 5 3, 0 6" fill={Colors.ColorVisReference} stroke={Colors.ColorVisReference} stroke-width={0} />
        </marker>
      </defs>
      <g transform={`translate(0, ${margins.top})`}>
        <ChartGrid
          gridType="yGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w}
          scale={yScale}
          ticks={[0.4]}
          yAxisTitle={yaxistitle}
          hideLines={true}
          hideLabels={true}
        />
      </g>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        <ChartGrid
          gridType="xGrid"
          innerHeight={h - margins.top - margins.bottom}
          innerWidth={w - margins.right}
          scale={xScale}
          ticks={[0]}
          xAxisTitle={xaxistitle}
          hideLines={true}
          hideLabels={true}
        />
        <path d={areaGenerator(coldWeatherData)} style:fill={Colors.ColorBaseBlue100} />
        <path d={futureAreaGenerator(coldFutureWeatherData)} style:fill={Colors.ColorBaseBlue500} />

        <path d={futureAreaGenerator(hotFutureWeatherData)} style:fill={Colors.ColorBaseOrange300} />
        <path d={areaGenerator(hotWeatherData)} style:fill={Colors.ColorBaseOrange200} />

        <path d={futureAreaGenerator(extremeFutureWeatherData)} style:fill={Colors.ColorBaseRed600} stroke="white" stroke-width="1" />
        <path d={areaGenerator(extremeWeatherData)} fill={Colors.ColorBaseRed400} />

        <path d={lineGenerator(normalDist)} style:fill={'none'} stroke={Colors.ColorGrey200} class="projection" />
        <path d={lineGeneratorFuture(normalDist)} style:fill={'none'} stroke={Colors.ColorVisReference} stroke-width={1.5} />
        <line x1={xScale(0)} x2={xScale(0)} y1={0} y2={h - margins.top - margins.bottom} stroke={Colors.ColorGrey200} stroke-width={0.5} />
        <line
          x1={xScale(scaledShift)}
          x2={xScale(scaledShift)}
          y1={0}
          y2={h - margins.top - margins.bottom}
          stroke={Colors.ColorVisReference}
          stroke-width={1}
        />

        {#if shift !== 0}
          <line
            x1={xScale(0)}
            x2={xScale(scaledShift)}
            y1={h / 2}
            y2={h / 2}
            stroke={Colors.ColorVisReference}
            stroke-width={1.5}
            marker-end={'url(#arrowhead)'}
          />
          <text class="number" x={xScale(0) + (xScale(scaledShift) - xScale(0)) / 2} y={h / 2 - 8} text-anchor={'middle'}
            >{'+' + shift + '°C'}</text
          >
          <text class="weaker category" x={xScale(0)} y={yScale(0) + 5} text-anchor={'end'}>{historicalclimate}</text>
          <text class="category" x={xScale(scaledShift)} y={-7} text-anchor={'middle'}>{futureclimate}</text>

          <text class="small weaker" x={xScale(-2.8)} y={yScale(0.06)}>{lesscold}</text>
          <text class="small weaker" x={xScale(2.5)} y={yScale(0.07)} text-anchor={'middle'}>{morehot}</text>
          <text class="small weaker" x={xScale(3.7)} y={yScale(0.02)} text-anchor={'end'}>{moreextreme}</text>
        {/if}
      </g>
    </svg>
  </div>
  <!--
  <div>
    <svg width={w / 3} height={h}>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        <text x={0} y={-10}>{frequency}</text>
        {#each columns as col, i}
          {#each rows as row, j}
            <rect
              x={col * cellSize}
              y={row * cellSize}
              width={cellSize}
              height={cellSize}
              fill={10 * i + j < frequencyScale(shift) ? Colors.ColorVisBinaryNeg : Colors.ColorVisBinaryPos}
              stroke={'white'}
              stroke-width={1}
            />
          {/each}
        {/each}
        <text x={2.5 * cellSize} y={h / 2} text-anchor={'middle'}
          >{@html $_(occurs, {
            values: {
              frequency: Math.round(frequencyScale(shift))
            }
          })}</text
        >
      </g>
    </svg>
  </div>
  -->
</div>
<p class="occ-label label">
  {frequency}
  <span style="font-weight:bold; font-style:italic"
    >{@html $_(occurs, {
      values: {
        frequency: Math.round(frequencyScale(shift))
      }
    })}</span
  >
</p>
<p class="label weaker" />
<div class="events-container">
  <div class="events">
    {#each yearSquare as sq, i}
      <div
        style="background-color: {i < frequencyScale(shift) ? Colors.ColorBaseRed500 : Colors.ColorVisFilteredOut}; margin-left:{i > 0 &&
        i % 10 === 0
          ? '2px'
          : 0}"
      />
    {/each}
  </div>
</div>

<style type="scss">
  .occ-label {
    margin-bottom: var(--space-xs);
  }
  .events {
    display: flex;
    gap: 1px;
    flex-wrap: wrap;

    div {
      flex: 1;
      min-height: 30px;
    }
  }
  .container {
    display: flex;
    width: 100%;
    margin-bottom: var(--space-l);
  }
  .slider-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-bottom: var(--space-xl);
  }

  label,
  input {
    width: 280px;
    text-align: center;
  }

  .slider {
    display: flex;
    align-items: center;
    align-content: center;
    gap: var(--space-xs);
  }

  /* sliders */
  input[type='range'] {
    -webkit-appearance: none;
    margin: 0 0 0 0;
    background: none;
  }
  input[type='range']:focus {
    outline: none;
  }
  input[type='range']::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    cursor: pointer;
    box-shadow: none;
    background: linear-gradient(90deg, #d3eef9 0%, var(--color-base-orange400) 100%);
    border-radius: 12px;
    border: 1px solid var(--color-theme-dark-text-weaker);
  }
  input[type='range']::-moz-range-track {
    width: 100%;
    height: 8px;
    cursor: pointer;
    box-shadow: none;
    background: linear-gradient(90deg, #d3eef9 0%, var(--color-base-orange400) 100%);
    border-radius: 12px;
    border: 1px solid var(--color-theme-dark-text-weaker);
  }

  input[type='range']::-webkit-slider-thumb {
    box-shadow: none;
    border: 1px solid var(--color-theme-dark-text-weaker);
    height: 15px;
    width: 15px;
    border-radius: 12px;
    background: var(--color-theme-dark-text);
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -5px;
  }

  input[type='range']::-moz-range-thumb {
    box-shadow: none;
    border: 1px solid var(--color-theme-dark-text-weaker);
    height: 15px;
    width: 15px;
    border-radius: 12px;
    background: var(--color-theme-dark-text);
    cursor: pointer;
    margin-top: -5px;
  }
  input[type='range']::-ms-track {
    width: 100%;
    height: 10px;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
  input[type='range']::-ms-fill-lower {
    background: linear-gradient(90deg, #d3eef9 0%, var(--color-base-orange400) 100%);
    border: 1px solid var(--color-theme-dark-text-weaker);
    border-radius: 12px;
    box-shadow: none;
  }
  input[type='range']::-ms-fill-upper {
    background: linear-gradient(90deg, #d3eef9 0%, var(--color-base-orange400) 100%);
    border: 1px solid var(--color-theme-dark-text-weaker);
    border-radius: 12px;
    box-shadow: none;
  }
  input[type='range']::-ms-thumb {
    box-shadow: none;
    border: 1px solid var(--color-theme-dark-text-weaker);
    height: 15px;
    width: 15px;
    border-radius: 12px;
    background: var(--color-theme-dark-text);
    cursor: pointer;
  }
  input[type='range']:focus::-ms-fill-lower {
    background: linear-gradient(90deg, #d3eef9 0%, var(--color-base-orange400) 100%);
  }
  input[type='range']:focus::-ms-fill-upper {
    background: linear-gradient(90deg, #d3eef9 0%, var(--color-base-orange400) 100%);
  }
</style>
