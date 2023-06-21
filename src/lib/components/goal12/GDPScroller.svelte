<script>
  import { _ } from 'svelte-i18n';
  import { fade } from 'svelte/transition';

  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { RegionColorMap } from '$lib/styles/colorscales';
  import { extent, scaleLinear, line, curveCatmullRom } from 'd3';
  import { getRegion, getIncomeLevel } from '../../../data/countryRegionIncomeDictionary';
  import { ChartGrid, Number, Tooltip } from '$lib/components';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import CountryPicker from '../general/CountryPicker.svelte';
  import { isMobile } from '$lib/stores/isMobile';
  import * as Tokens from '$lib/styles/vis.js';

  export let data;
  export let activeScene;

  export let tooltip_gdp;
  export let tooltip_nca;
  export let label_sustainable = 'Sustainable Growth';
  export let label_unsustainable = 'Unsustainable Growth';
  export let label_negative = 'Negative Growth';

  export let parentWidth;
  export let parentHeight;

  $: w = parentWidth;
  $: h = parentHeight;
  $: wRatio = w / h;

  const margins = {
    top: 15,
    left: 30,
    right: 30,
    bottom: 20
  };

  const incomeCodes = ['HIC', 'LIC', 'LMC', 'UMC'];
  const worldCode = 'WLD';

  const incomeColors = {
    HIC: 'var(--color-vis-income-high)',
    LIC: 'var(--color-vis-income-low)',
    LMC: 'var(--color-vis-income-lower-middle)',
    UMC: 'var(--color-vis-income-upper-middle)'
  };

  $: domain = extent(data, (d) => d.year);

  $: radius = $isMobile ? Tokens.ScatterCircleRadiusMob : Tokens.ScatterCircleRadius;
  $: circleRadiusScale = scaleLinear().domain(domain).range([1, radius]);

  $: colorScale = richData.reduce((acc, val) => {
    acc[val.code] = incomeColors[incomeCodes.includes(val.code) ? val.code : getIncomeLevel(val.code)] ?? 'var(--color-vis-region-WLD)';
    return acc;
  }, {});

  $: richData = data.map((d) => ({
    ...d,
    income: incomeCodes.includes(d.code) ? d.code : getIncomeLevel(d.code)
  }));
  $: incomeLevels = data.filter((d) => incomeCodes.includes(d.code)).map((d) => ({ ...d, region: d }));
  $: world = data.filter((d) => d.code === worldCode).map((d) => ({ ...d, region: worldCode }));

  $: allCodes = Array.from(new Set(richData.map((d) => d.code)));

  let visibleCountries = [];
  let activeCountries = [];
  let highlightedCountries = [];
  $: switch (activeScene.id) {
    case 'vietnam':
      visibleCountries = [];
      activeCountries = [];
      highlightedCountries = ['VNM'];
      break;
    case 'nigeria':
      visibleCountries = [];
      activeCountries = ['VNM'];
      highlightedCountries = ['NGA'];
      break;
    case 'uae':
      visibleCountries = [];
      activeCountries = ['VNM', 'NGA'];
      highlightedCountries = ['ARE'];
      break;
    case 'bottom-right':
      visibleCountries = allCodes;
      activeCountries = [];
      highlightedCountries = [];
      break;
    case 'world':
      visibleCountries = allCodes;
      activeCountries = [];
      highlightedCountries = [worldCode];
      break;
    case 'regions':
      visibleCountries = allCodes;
      activeCountries = [];
      highlightedCountries = incomeCodes;
      break;
    case 'interactive':
      visibleCountries = [];
      activeCountries = allCodes;
      highlightedCountries = [];
  }

  $: limitsGdpGrowth = extent(data, (d) => d.loggrowth_gdp);
  $: limitsNcaGrowth = extent(data, (d) => d.loggrowth_nca);
  $: limitsOfGrowth = Math.max(limitsGdpGrowth[1], limitsNcaGrowth[1]);

  $: yScale = scaleLinear()
    .domain([limitsGdpGrowth[1], limitsGdpGrowth[0]])
    .range([margins.top, h - margins.top - margins.bottom]);

  $: xRange = yScale(1) - yScale(0);

  $: xScale = scaleLinear()
    .domain([1, -1])
    .range([-xRange + (w - margins.left - margins.right) / 2, xRange + (w - margins.left - margins.right) / 2]);

  $: lineGen = line()
    .x((d) => xScale(d.loggrowth_nca))
    .y((d) => yScale(d.loggrowth_gdp))
    .curve(curveCatmullRom);

  let selectedCountry;
  let lastSelectedCountry;
  $: if (selectedCountry && lastSelectedCountry !== selectedCountry) {
    const countryData = richData.find((d) => d.code === selectedCountry && d.year === activeYear);
    setHoverCountry({ clientX: 0, clientY: 0 }, countryData);
    lastSelectedCountry = selectedCountry;
  }

  let hoverCountry;
  let tooltipTargetPos = { x: 0, y: 0 };
  function setHoverCountry(evt, country) {
    hoverCountry = country;

    if (hoverCountry) {
      const x = evt.clientX + 30;
      const y = evt.clientY + 30;

      tooltipTargetPos = { ...tooltipTargetPos, x, y };
    }
  }

  $: activeYear = domain[1];
</script>

<div class="gdp-scroller">
  <CountryPicker bind:selectedCountry clear={() => (selectedCountry = null)} />
  <div class="svg-container scatterplot" bind:clientWidth={w} bind:clientHeight={h}>
    <svg width={w} height={h}>
      <foreignObject
        transition:fade|local
        x={xScale(0)}
        y={yScale(limitsGdpGrowth[1])}
        width={w - xScale(0.0)}
        height={yScale(0) - yScale(limitsGdpGrowth[1])}
        ><div class="center-container"><p class="big-label label weaker">{label_sustainable.toUpperCase()}</p></div></foreignObject
      >
      {#if activeScene.index >= 1}
        <foreignObject
          transition:fade|local
          x={0}
          y={yScale(limitsGdpGrowth[1])}
          width={xScale(0)}
          height={yScale(0) - yScale(limitsGdpGrowth[1])}
          ><div class="center-container"><p class="big-label label weaker">{label_unsustainable.toUpperCase()}</p></div></foreignObject
        >
      {/if}
      {#if activeScene.index >= 2}
        <foreignObject transition:fade|local x={0} y={yScale(0)} width={w} height={yScale(limitsGdpGrowth[0]) - yScale(0)}
          ><div class="center-container"><p class="big-label label weaker">{label_negative.toUpperCase()}</p></div></foreignObject
        >
      {/if}
      <rect
        class="interactive"
        on:mouseover={(e) => setHoverCountry(e, null)}
        on:focus={(e) => setHoverCountry(e, null)}
        x="0"
        y="0"
        width={w}
        height={h}
      />
      <ChartGrid
        gridType="xGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={xScale}
        ticks={[-Math.log10(11), -Math.log10(4 / 1), -Math.log10(2 / 1), 0, Math.log10(2 / 1), Math.log10(4 / 1), Math.log10(11)]}
        formatter={(v) => (v > 0 ? '+' : '') + ((Math.pow(10, v) - 1) * 100).toFixed(0) + '%'}
        xAxisTitle={tooltip_nca}
      />
      <ChartGrid
        gridType="yGrid"
        innerHeight={h - margins.top - margins.bottom}
        innerWidth={w - margins.left - margins.right}
        scale={yScale}
        ticks={[-Math.log10(4 / 1), -Math.log10(2 / 1), 0, Math.log10(2 / 1), Math.log10(4 / 1), Math.log10(11)]}
        formatter={(v) => (v > 0 ? '+' : '') + ((Math.pow(10, v) - 1) * 100).toFixed(0) + '%'}
        yAxisTitle={tooltip_gdp}
      />
      <line x1={xScale(0)} x2={xScale(0)} y1={0} y2={h - margins.top - margins.bottom} />
      <line y1={yScale(0)} y2={yScale(0)} x1={0} x2={w - margins.left - margins.right} />
      {#each allCodes as c}
        <path
          class:visible={[...visibleCountries, ...activeCountries, ...highlightedCountries, hoverCountry?.code, selectedCountry].includes(
            c
          )}
          class:subdued={![...highlightedCountries, hoverCountry?.code, selectedCountry].includes(c)}
          d={lineGen(
            richData.filter((d) => d.code === c && (d.year <= activeYear || d.year === domain[0])).sort((a, b) => a.year - b.year)
          )}
          style={`--col: ${colorScale[c]}`}
        />
      {/each}
      {#each richData as d}
        <circle
          class:visible={[...visibleCountries, ...activeCountries, ...highlightedCountries, hoverCountry?.code, selectedCountry].includes(
            d.code
          ) &&
            (d.year === activeYear || [...highlightedCountries, hoverCountry?.code, selectedCountry].includes(d.code))}
          class:subdued={![...activeCountries, ...highlightedCountries, hoverCountry?.code, selectedCountry].includes(d.code)}
          class:active={(activeCountries.includes(d.code) && d.year === activeYear) || highlightedCountries.includes(d.code)}
          cx={xScale(d.loggrowth_nca)}
          cy={yScale(d.loggrowth_gdp)}
          r={circleRadiusScale(d.year)}
          style={`--col: ${colorScale[d.code]};};`}
          data-code={d.code}
          data-year={d.year}
          on:mouseover={(e) => setHoverCountry(e, d)}
          on:focus={(e) => setHoverCountry(e, d)}
        />
      {/each}
      {#each [hoverCountry?.code, $referenceCountry, selectedCountry].filter((d) => !!d) as code}
        <path
          class="visible overlay"
          d={lineGen(
            richData.filter((d) => d.code === code && (d.year <= activeYear || d.year === domain[0])).sort((a, b) => a.year - b.year)
          )}
          style={`--col: ${code === $referenceCountry ? 'var(--color-reference-country)' : colorScale[code]}`}
        />
        <path
          class="visible bold"
          d={lineGen(
            richData.filter((d) => d.code === code && (d.year <= activeYear || d.year === domain[0])).sort((a, b) => a.year - b.year)
          )}
          style={`--col: ${code === $referenceCountry ? 'var(--color-reference-country)' : colorScale[code]}`}
        />
        {#each richData.filter((d) => d.code === code) as d}
          <circle
            class="visible active overlay"
            class:hover={hoverCountry?.year === d.year}
            cx={xScale(d.loggrowth_nca)}
            cy={yScale(d.loggrowth_gdp)}
            r={circleRadiusScale(d.year)}
            style={`--col: ${code === $referenceCountry ? 'var(--color-reference-country)' : colorScale[d.code]};}`}
            data-code={d.code}
            data-year={d.year}
            on:mouseover={(e) => setHoverCountry(e, d)}
            on:focus={(e) => setHoverCountry(e, d)}
          />
        {/each}
      {/each}
      {#each richData.filter((d) => d.code === $referenceCountry && (d.year === activeYear || d.year === domain[1])) as refCountry}
        <text class="label reference-label" x={xScale(refCountry?.loggrowth_nca) + 10} y={yScale(refCountry?.loggrowth_gdp) + 5}
          >{$_(`country.${$referenceCountry.toLowerCase()}`)}
        </text>
      {/each}
    </svg>
    {#if hoverCountry}
      <Tooltip visible={true} targetPos={tooltipTargetPos}>
        <p class="label geo">{$_(`country.${hoverCountry.code.toLowerCase()}`)}, {hoverCountry.year}</p>
        <p class="number"><Number value={hoverCountry.growth_gdp} digits={0} unit="%" /></p>
        <p class="label small weaker">{tooltip_gdp}</p>
        <p class="number"><Number value={hoverCountry.growth_nca} digits={0} unit="%" /></p>
        <p class="label small weaker">{tooltip_nca}</p>
      </Tooltip>
    {/if}
  </div>
  <CategoricalLegend legendType="income" />
</div>

<style>
  .gdp-scroller {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .svg-container {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  svg {
    margin: 0 auto;
  }

  rect.interactive {
    opacity: 0;
    outline: 0;
  }

  circle {
    fill: var(--col);
    opacity: 0;
    transition: opacity 0.5s;
    pointer-events: none;
  }

  circle.visible {
    opacity: 1;
  }
  circle.subdued {
    opacity: 0;
  }

  circle.active {
    pointer-events: all;
  }

  circle.overlay {
    stroke: var(--col);
    stroke-width: 2;
    fill: white;
    stroke-alignment: inner;
  }

  circle.hover {
    stroke: #000000;
  }

  line {
    stroke: black;
  }

  path {
    fill: none;
    stroke: var(--col);
    stroke-width: 8;
    stroke-linecap: round;
    opacity: 0;
    pointer-events: none;
  }
  path.visible {
    opacity: 0.6;
  }
  path.bold {
    opacity: 1;
  }

  path.overlay {
    pointer-events: all;
    opacity: 0;
    stroke-width: 50;
  }

  path.visible.subdued {
    stroke: grey;
    stroke-width: 1px;
    opacity: 0.2;
  }

  div.center-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }
  p.big-label {
    margin: var(--space-s);
    text-align: center;
  }
</style>
