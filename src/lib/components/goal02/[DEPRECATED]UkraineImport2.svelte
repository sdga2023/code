<script>
  import { groups, scaleSqrt, scaleLog, scaleLinear, sum, max, scaleQuantize, range } from 'd3';
  import { stack } from 'd3-shape';
  import UkraineImportBar from './UkraineImportBar.svelte';
  import UkraineImportSmall from './UkraineImportSmall.svelte';
  import Number from '../general/Number.svelte';
  import Date from '../general/Date.svelte';
  import Tooltip from '../general/Tooltip.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { ColorBaseYellow300 } from '$lib/styles/tokens.es6';

  export let parentWidth;
  export let parentHeight;

  export let activeScene;
  export let legend_label;

  export let data = [];

  const lineChartHeight = 250;

  $: width = parentWidth;
  $: height = parentHeight - lineChartHeight - 20;
  // let width = 1000;
  // let height = 1000;

  const margin = {
    top: 60,
    right: 70,
    bottom: 0,
    left: 50
  };

  $: w = width - margin.left - margin.right;
  $: h = height - margin.top - margin.bottom;

  const periods = Array.from(new Set(data.map((d) => d.period))).sort((a, b) => a - b);

  const commodities = ['Cereals', 'Oils and fats', 'Dairy'];

  let periodIndex = 0;
  let commodityIndex = 0;

  $: p = scaleQuantize().domain([0, 0.75]).range(range(periods?.length));
  $: commodityIndex = activeScene?.index;

  $: periodIndex = p(activeScene?.offset);
  $: period = periods[periodIndex];

  $: y = scaleLinear().domain([0, 1]).range([0, h]);

  $: test = groups(
    data
      .filter((d) => d.commodity_group === commodities[commodityIndex] && d.period === periods[periodIndex])
      .map((d) => ({
        ...d,
        ukraine: d.ukraine === 'NA' ? 0 : d.ukraine,
        month: d.period
      })),
    (d) => d.reporter
  ).map((d) => {
    const totalUkraine = sum(d[1], (d) => d.ukraine);
    const totalWorld = sum(d[1], (d) => d.world);

    return {
      key: d[0],
      values: d[1],
      totalUkraine,
      totalWorld,
      percentUkraine: totalUkraine / totalWorld
    };
  });

  $: maxTotalWorld = max(
    groups(
      data
        .filter((d) => d.commodity_group === commodities[commodityIndex])
        .map((d) => ({ ...d, ukraine: d.ukraine === 'NA' ? 0 : d.ukraine, month: d.period })),
      (d) => d.period
    ).map((d) => sum(d[1], (d) => d.world))
  );

  $: countries =
    periodIndex === 0
      ? test
          .sort((a, b) => b.percentUkraine - a.percentUkraine)
          // .filter((d, i) => i < 20)
          .map((d) => d.key)
      : countries;

  $: selectedCountryData = test.filter((d) => countries.includes(d.key)).sort((a, b) => b.percentUkraine - a.percentUkraine);

  $: test2 = selectedCountryData.reduce((acc, cur, i) => {
    if (i === 0) {
      acc.push({
        ...cur,
        y0: 0,
        y1: y(cur.totalWorld / maxTotalWorld)
      });
    } else {
      acc.push({
        ...cur,
        y0: acc[i - 1].y1,
        y1: acc[i - 1].y1 + y(cur.totalWorld / maxTotalWorld)
      });
    }

    return acc;
  }, []);

  $: x = scaleLinear().domain([0, 100]).range([0, w]);

  let hover;
  let mousePosition = { x: 0, y: 0 };
</script>

<div bind:clientWidth={width}>
  <div style="text-align: center;">
    <div class="label stronger caps">
      {commodities[commodityIndex]}
    </div>
    <div><Date year={Math.floor(period / 100)} month={period - Math.floor(period / 100) * 100 - 1} /></div>
  </div>

  <svg
    {width}
    {height}
    on:mousemove={(e) => {
      mousePosition = { x: e.clientX, y: e.clientY };
    }}
  >
    <g transform="translate({margin.left}, {margin.right})">
      <line x2={x(100)} y1={-5} y2={-5} style="stroke: var(--color-grey-200)" />
      {#each x.ticks() as tick}
        <text x={x(tick)} dy={-10} class="label small weaker middle"><Number value={tick} unit="%" /></text>
      {/each}
      {#each test2 as country, i (country.key)}
        <UkraineImportBar {country} {w} {i} bind:hover />
      {/each}
    </g>
  </svg>
  <Tooltip visible={hover !== undefined} targetPos={mousePosition}>
    <div class="label caps">
      <!-- {$_(`country.${hover?.data.Country_Alpha3.toLowerCase()}`)} (<span class="label small stronger">{hover?.data.Category}</span>) -->
      {hover?.key}
    </div>
    <div class="label small">
      <span class="label stronger small"><Number value={100 * hover?.percentUkraine} unit="%" /></span> Ukraine import of <Number
        value={hover?.totalWorld}
      /> total
    </div>
    <hr />

    <div class="label small weaker">what is the unit??</div>
  </Tooltip>

  <CategoricalLegend legendType="custom" customItems={[{ key: legend_label, colour: ColorBaseYellow300 }]} itemSymbol="square" />
</div>
