<script>
  import { Number, Tooltip, ChartGrid, CategoricalLegend } from '$lib/components';
  import { max, scaleLinear, scaleSqrt, forceSimulation, forceCollide, forceX, forceY } from 'd3';
  import { _ } from 'svelte-i18n';

  import { getRegion } from './../../../data/countryRegionIncomeDictionary';
  import { referenceCountry } from '$lib/stores/referenceCountry';

  import countryPopulation from '../../../data/other/country-populations.json';
  import { isMobile } from '$lib/stores/isMobile';

  export let data;
  export let y_label;
  export let global_label;
  export let gini_explanation_more;
  export let gini_explanation_less;

  let w,
    h = 0,
    renderData,
    wld,
    reference;

  const padding = 20;
  let yScale = (x) => 0;
  let sizeScale = scaleSqrt()
    .domain([0, max(countryPopulation, (d) => d.pop)])
    .range([5, 25]);

  let ticks = [];
  for (let i = 20; i <= 70; i += 10) {
    ticks.push(i.toFixed(0));
  }

  $: if (data && w) {
    h = $isMobile || !w ? 600 : w;

    yScale = scaleLinear()
      .domain([20, 70])
      .range([h - padding * 2, padding]);

    renderData = data
      ?.filter((d) => d.country_code !== 'WLD')
      .map((d) => ({
        ...d,
        pop: countryPopulation.find((x) => x.iso === d.country_code)?.pop ?? 0,
        region: getRegion(d.country_code)
      }));
    renderData = renderData?.map((d) => ({ ...d, r: sizeScale(d.pop), oy: yScale(d.gini), x: yScale(d.gini), y: h / 2 }));

    // resolve collisions:
    let sim = forceSimulation(renderData)
      .force(
        'x',
        forceX()
          .x(w / 2)
          .strength(0.05)
      )
      .force(
        'y',
        forceY()
          .y((d, i) => d.oy)
          .strength(1)
      )
      .force('collide', forceCollide((d) => d.r * 1.1).strength(0.5))
      .stop();

    for (let i = 0, n = Math.ceil(Math.log(sim.alphaMin()) / Math.log(1 - sim.alphaDecay())); i < n; ++i) {
      sim.tick();
    }
  }

  // $: wld = data && data?.find((d) => d.country_code === 'WLD');
  $: reference = $referenceCountry ? renderData?.find((d) => d.country_code === $referenceCountry) : null;

  let activeCountry;
  let tooltipTargetPos = { x: 0, y: 0 };

  function setActiveCountry(evt, country) {
    activeCountry = country;

    const x = evt.clientX;
    const y = evt.clientY;

    tooltipTargetPos = { ...tooltipTargetPos, x, y };
  }
</script>

<div class="gini-world" bind:clientWidth={w}>
  <svg width={w} height={h} class="beeswarm">
    <g transform={`translate(0,${padding})`}>
      {#if renderData && w && data}
        <ChartGrid gridType="yGrid" innerWidth={w} scale={yScale} {ticks} yAxisTitle={y_label} />
        {#if wld}
          <g class="global">
            <rect x={0} y={yScale(wld.gini)} width={w} height={2} />
            <text class="caps" x={25} y={yScale(wld.gini) - 5}>{global_label}</text>
          </g>
        {/if}
        {#each renderData as d}
          <circle
            class:reference={d.country_code === $referenceCountry}
            cx={d.x}
            cy={d.y}
            r={d.r + 'px'}
            style="fill: var(--color-vis-region-{d.region})"
            on:mouseover={(evt) => setActiveCountry(evt, d)}
            on:mouseout={() => (activeCountry = null)}
          />
        {/each}
        {#if reference}
          <circle cx={reference.x} cy={reference.y} r={reference.r + 'px'} style="stroke: var(--color-reference-country); fill: none" />
          <text class="reference-label" x={reference.x + 10} y={reference.y - 5}
            >{$_(`country.${reference.country_code.toLowerCase()}`)}</text
          >
          <text class="reference-label" x={reference.x + 10} y={reference.y + 12}><Number value={reference.gini} digits="2" /></text>
        {/if}
        <text class="label weaker caps middle" transform="translate({w - 20},{h / 2}) rotate(90)"
          >{'← ' + gini_explanation_less}<tspan> &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; </tspan>{gini_explanation_more + ' →'}</text
        >
      {/if}
    </g>
  </svg>
  <CategoricalLegend legendType="regions" />
  {#if activeCountry}
    <Tooltip visible={activeCountry} targetPos={tooltipTargetPos}>
      <p class="label caps">
        {$_(`country.${activeCountry.country_code.toLowerCase()}`)}
      </p>
      <p class="number"><Number value={activeCountry.gini} digits="0" /></p>
      <p class="label small weaker">{y_label}</p>
    </Tooltip>{/if}
</div>

<style type="scss">
  svg {
    .tick {
      line {
        stroke: var(--color-grey-300);
        stroke-dasharray: 2 4;
      }
      text {
        text-anchor: middle;
      }
    }

    circle {
      &.reference {
        stroke-width: 4px;
      }
    }
    circle:hover {
      stroke: var(--color-theme-text);
      stroke-width: 1.5px;
    }
    .gini-explanation {
      text-anchor: middle;
    }
    .global {
      rect {
        fill: var(--color-vis-region-WLD);
      }
      text {
        fill: var(--color-vis-region-WLD);
      }
    }
  }
</style>
