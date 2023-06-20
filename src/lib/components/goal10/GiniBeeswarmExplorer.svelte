<script>
  import { liveGini } from '$lib/stores/goal10/liveGini.js';
  import { isMobile } from '$lib/stores/isMobile';
  import { max } from 'd3-array';
  import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force';
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { onDestroy } from 'svelte';
  import { _ } from 'svelte-i18n';
  import ChartGrid from '../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import Number from '../general/Number.svelte';
  import * as Tokens from '$lib/styles/vis.js';

  export let data;
  export let activeScene;

  export let annual_consumption_label;
  export let relative_consumption_label;
  export let gini_label;
  export let label_100_people = '100 people';

  export let parentWidth;
  export let parentHeight;

  $: w = parentWidth;
  $: h = $isMobile ? parentHeight : Math.min(parentHeight, parentWidth * 0.7);

  const ACTIVE_COUNTRY = 'NAM';

  $: dat = data?.map((d, i) => ({ ...d, id: d.consumption + d.countrycode }));

  $: hpadding = $isMobile ? 0 : 50;

  let margins = {
    top: 50,
    right: 0,
    bottom: 75,
    left: 0
  };

  $: radius = $isMobile ? Tokens.BeeswarmCircleRadiusMob : Tokens.BeeswarmCircleRadius;
  let yTicks = [];

  let yScale;

  let yAccessor;
  let yAxisUnits;
  const yAccessorConsumption = (d) => d.consumption;
  const yAccessorConsumptionRelative = (d) => d.consumption_relative;
  $: switch (activeScene?.index) {
    case 0:
    case 1:
      if (yAccessor !== yAccessorConsumption) yAccessor = yAccessorConsumption;
      yTicks = [];
      for (let i = 10000; i < 50000; i += 10000) {
        yTicks.push(i);
      }
      yTicks.push(48000);
      yAxisUnits = annual_consumption_label;
      break;
    default:
      if (yAccessor !== yAccessorConsumptionRelative) yAccessor = yAccessorConsumptionRelative;
      yTicks = [];
      for (let i = 100; i < 1200; i += 200) {
        yTicks.push(i);
      }
      yAxisUnits = relative_consumption_label;
  }

  function pickPair(pickExtremes = false) {
    // if there's none selected, pick one:
    if (!lastElement) {
      let idx1 = Math.floor(Math.random() * activeCountryDat?.length);

      if (pickExtremes) {
        idx1 = 0;
      }
      const el1 = activeCountryDat[idx1];
      clickElement(el1);
    }

    // pick a different one:
    let idx2 = Math.floor(Math.random() * activeCountryDat.length);
    while (activeCountryDat[idx2].id === lastElement.id) {
      idx2 = Math.floor(Math.random() * activeCountryDat.length);
    }

    if (pickExtremes) {
      idx2 = activeCountryDat.length - 1;
    }
    clickElement(activeCountryDat[idx2]);
  }

  $: if (activeScene?.id === 'suppose' && $liveGini?.pairs.length === 0) {
    pickPair(true);
  }

  $: if (dat) {
    yScale = scaleLinear()
      .range([h - margins.bottom, margins.top])
      .domain([0, data ? max(data, yAccessor) : 1]);

    countries.forEach((countrycode) => {
      const dt = dat.filter((d) => d.countrycode === countrycode);

      let sim = forceSimulation(dt)
        .force(
          'x',
          forceX()
            .x((d, i) => 0)
            .strength(0.5)
        )
        .force(
          'y',
          forceY()
            .y((d) => yScale(yAccessor(d)))
            .strength(10)
        )
        .force('collide', forceCollide(radius))
        .stop();

      for (let i = 0, n = Math.ceil(Math.log(sim.alphaMin()) / Math.log(1 - sim.alphaDecay())); i < n; ++i) {
        sim.tick();
      }
    });

    // console.log(dat);
    dat = [...dat];
  }

  const countries = ['BLR', 'NAM'];
  const dataYears = [2019, 2015];

  $: countryScaleInternal = scaleBand()
    .domain(countries)
    .range([margins.left, w - margins.right]);
  $: countryScale = (v) => {
    return countryScaleInternal(v) + countryScaleInternal.bandwidth() / 2;
  };

  let lastElement;

  let pickedElements = [];
  let lastPair;
  $: {
    const p = $liveGini.pairs.length > 0 ? $liveGini.pairs.slice(-1)[0] : null;
    if (p && dat) {
      const { aId, bId, diff, countrycode } = p;
      if (lastElement === null || (lastElement && (aId === lastElement.id || bId === lastElement.id))) {
        const a = dat.find((d) => d.id === aId);
        const b = dat.find((d) => d.id === bId);
        const countryX = countryScale(countrycode);
        const x = [Math.max(a.x + countryX, b.x + countryX), $isMobile ? countryX - 50 : countryX - 100];
        const y = [Math.min(a.y, b.y), Math.max(a.y, b.y)];
        const halfY = y[0] + (y[1] - y[0]) / 2;
        const quarterY = (y[1] - y[0]) / 4;

        lastPair = {
          a: a.consumption - b.consumption > 0 ? a : b,
          b: a.consumption - b.consumption > 0 ? b : a,
          diff,
          countrycode,
          x,
          y,
          halfY,
          quarterY
        };
      } else {
        lastPair = null;
      }
    }
  }

  $: interactive = activeScene?.id === 'explorable';

  function clickElement(el) {
    if (el?.countrycode === ACTIVE_COUNTRY && lastElement?.id !== el?.id) {
      pickedElements = [...pickedElements, el.id];

      if (lastElement) {
        const a = +lastElement.consumption_relative.toFixed(3);
        const b = +el.consumption_relative.toFixed(3);
        const diff = Math.abs((a - b) / 2);

        $liveGini = {
          ...$liveGini,
          pairs: [...$liveGini.pairs, { a, aId: lastElement.id, b, bId: el.id, diff, countrycode: el.countrycode }]
        };
        lastElement = null;
      } else {
        lastElement = el;
      }
    }
  }

  $: activeCountryDat = dat?.filter((d) => d.countrycode === ACTIVE_COUNTRY) ?? [];

  $: if ($liveGini.autopicking) {
    pickPair();

    $liveGini.autopicking = false;
  }

  let quickPicker;
  $: if (activeScene?.id === 'conclusion' && !quickPicker) {
    quickPicker = setInterval(pickPair, 50);
  }

  $: if ($liveGini?.pairs.length > 250) {
    clearInterval(quickPicker);
  }
  $: if (activeScene?.id !== 'conclusion' && quickPicker) {
    clearInterval(quickPicker);
  }

  onDestroy(() => {
    if (quickPicker) {
      clearInterval(quickPicker);
    }
  });

  function isActive(a) {
    return lastElement?.id === a.id || lastPair?.a.id === a.id || lastPair?.b.id === a.id;
  }
</script>

<CategoricalLegend legendType="custom" top={true} customItems={[{ key: label_100_people, colour: Colors.ColorBasePink600 }]} />
<div class="gini-beeswarm-explorer" bind:clientWidth={w} bind:clientHeight={h}>
  <svg width={w} height={h} class="beeswarm">
    {#if dat}
      <g style="transform: translate({hpadding}px, {0}px)">
        <ChartGrid gridType="yGrid" innerHeight={h} innerWidth={w - hpadding * 2} scale={yScale} ticks={yTicks} yAxisTitle={yAxisUnits} />
      </g>
      <g>
        {#each dat?.sort((a, b) => isActive(a) - isActive(b)) as d (d.id)}
          <circle
            class={`${d.countrycode} ${d.countrycode === ACTIVE_COUNTRY && interactive ? 'interactive' : ''}`}
            style="pointer-events:all; opacity: {pickedElements.indexOf(d.id) !== -1 &&
            !(lastPair?.a.id === d.id || lastPair?.b.id === d.id)
              ? 0.5
              : 1}"
            cx={d.x + countryScale(d.countrycode) ?? 0}
            cy={d.y ?? 0}
            r={radius}
            style:stroke={lastElement?.id === d.id || lastPair?.a.id === d.id || lastPair?.b.id === d.id ? 'black' : 'white'}
            style:stroke-width={isActive(d) ? 1.5 : 1}
            on:click={() => clickElement(d)}
            data-consumption={d.consumption}
            data-relative={d.consumption_relative}
          />
        {/each}
      </g>
    {/if}
    {#each countries as countrycode, i}
      <text class="geo middle" x={countryScale(countrycode)} y={h - 16}>{$_(`country.${countrycode.toLowerCase()}`)}</text>
      <text class="label middle small weaker" x={countryScale(countrycode)} y={h}>{dataYears[i]}</text>
      {#if activeScene?.id === 'pre-conclusion' || activeScene?.id === 'conclusion'}
        <text class="label middle small weaker" x={countryScale(countrycode)} y={40 + margins.top}>{gini_label}</text>
        <text class="label caps large middle stronger" x={countryScale(countrycode)} y={64 + margins.top}
          >{countrycode === 'NAM' ? 59 : 25}</text
        >
      {/if}
    {/each}
    {#if (activeScene?.id === 'suppose' || activeScene?.id === 'gini_explorer_result' || activeScene?.id === 'explanation' || activeScene?.id === 'explorable' || activeScene?.id === 'pre-conclusion') && lastPair?.a && lastPair?.b}
      <g class="comparison">
        <line x1={lastPair.a.x + countryScale(lastPair.a.countrycode)} x2={lastPair.x[1]} y1={lastPair.a.y} y2={lastPair.a.y} />
        <line x1={lastPair.b.x + countryScale(lastPair.b.countrycode)} x2={lastPair.x[1]} y1={lastPair.b.y} y2={lastPair.b.y} />
        <text class="label middle small" x={lastPair.x[1]} y={lastPair.a.y - 14}
          ><Number value={yAccessor(lastPair.a).toFixed(1)} digits="1" unit="%" /></text
        >
        <text class="label middle small" x={lastPair.x[1]} y={lastPair.b.y + 22}
          ><Number value={yAccessor(lastPair.b).toFixed(1)} digits="1" unit="%" /></text
        >
        <rect class="plus" x={lastPair.x[1] - 2.5} y={lastPair.halfY + 3} width={5} height={Math.abs(lastPair.quarterY * 2 - 3)} />
        <rect class="minus" x={lastPair.x[1] - 2.5} y={lastPair.y[0]} width={5} height={Math.abs(lastPair.quarterY * 2 - 3)} />

        <g style="transform: translate({lastPair.x[1]}px, {lastPair.y[0] + (lastPair.y[1] - lastPair.y[0]) / 2}px)">
          <polygon class="plus" points="0 0,5 10, -5 10" />
          <polygon class="minus" points="0 0 , -5 -10, 5 -10" />
          <text class="number minus end" x={-8} y={-4}><Number value={-lastPair.diff} digits="1" unit="%" /></text>
          <text class="number plus end" x={-8} y={16}>+<Number value={lastPair.diff} digits="1" unit="%" /></text>
        </g>
      </g>
    {/if}
  </svg>
</div>

<style type="text/scss">
  .gini-beeswarm-explorer {
    pointer-events: all;
    flex: 1;
    max-height: 800px;
    overflow: hidden;

    svg {
      circle {
        z-index: 999;
        pointer-events: none;

        &.BLR {
          // fill: var(--color-vis-region-ECS);
          fill: var(--color-base-pink500);
        }

        &.NAM {
          //fill: var(--color-vis-region-SSF);
          fill: var(--color-base-pink500);
        }

        &.interactive {
          cursor: pointer;
          pointer-events: all;
        }
      }

      text {
        pointer-events: none;
      }

      g.comparison {
        pointer-events: none;

        line {
          stroke: var(--color-theme-text-weaker);
          stroke-dasharray: 4 4;
        }

        polygon {
          fill: var(--color-theme-text);
        }
        rect {
          stroke: var(--color-theme-bg-weaker);
          stroke-width: 2px;
        }

        .minus {
          fill: var(--color-vis-binary-neg);
        }

        .plus {
          fill: var(--color-vis-binary-pos);
        }
      }
    }
  }
</style>
