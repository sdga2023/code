<script>
  import { scaleTime, scaleLinear, extent, groups, min, max } from 'd3';
  import Date2 from '../general/Date.svelte';
  import Number from '../general/Number.svelte';
  import singleStack from '$lib/singleStack';
  import Tooltip from '../general/Tooltip.svelte';
  import { _ } from 'svelte-i18n';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { ColorBaseOrange300, ColorBaseRed400, ColorBaseYellow200, ColorBaseYellow300 } from '$lib/styles/tokens.es6';

  export let title;
  export let parentWidth;
  export let parentHeight;
  export let labels;

  export let data;
  $: data2 = data.filter((d) => d.Share_of_exports_Kcal > 0.01);
  $: width = parentWidth;
  const height = 1200;

  const margin = {
    top: 2,
    right: 20,
    bottom: 60,
    left: 20
  };

  $: w = width - margin.left - margin.right;
  $: h = height - margin.top - margin.bottom;

  $: y = scaleTime()
    .domain([min(data2, (d) => Date.parse(d.StartingDate)), max(data2, (d) => Date.parse(d.EndDate))])
    .range([0, h]);

  $: x = scaleLinear()
    .domain([0, groups(data2, (d) => d.Country_Alpha3).length])
    .range([20, w - 60]);

  let hover;
  let mousePosition = { x: 0, y: 0 };
</script>

<div class="svg-container" bind:clientWidth={parentWidth} bind:clientHeight={parentHeight}>
  <CategoricalLegend
    top={true}
    legendType="custom"
    customItems={[
      { key: 'Ban', colour: ColorBaseRed400 },
      { key: 'Tax', colour: ColorBaseOrange300 },
      { key: 'Licensing', colour: ColorBaseYellow200 }
    ]}
  />
  <svg
    {width}
    {height}
    on:mousemove={(e) => {
      mousePosition = { x: e.clientX, y: e.clientY };
    }}
  >
    <g transform="translate({margin.left}, {margin.top})">
      <rect x={0} y={y(new Date(2022, 1, 24))} width={w} height={h - y(new Date(2022, 1, 24))} class="annotated-area" />
      <g>
        {#if data2 && data2.length > 0}
          {#each y.ticks() as tick, i}
            <text x={w} style="text-anchor: end;" class="label small" y={y(tick)} dy={-8} dx={-10}>
              1 <Date2 month={tick.getMonth()} year={tick.getFullYear()} />
            </text>
            <line x1={0} y1={y(tick)} x2={w} y2={y(tick)} stroke={'var(--color-grey-200)'} />
          {/each}
        {/if}

        {#each singleStack()
          .height(w - 80)
          .padding(2)( data2
            .map((d) => ({ ...d, n: 1 }))
            .sort((a, b) => a.Category.localeCompare(b.Category) || Date.parse(a.StartingDate) - Date.parse(b.StartingDate)), 'n' ) as d, i}
          <g
            transform="translate({d.y0}, {y(Date.parse(d.data.StartingDate))})"
            on:mouseover={() => (hover = { data: d.data, i })}
            on:mouseout={() => (hover = undefined)}
            on:click={() => console.log(d)}
          >
            {#if d.data.Category === 'Ban'}
              <rect
                width={d.y1 - d.y0}
                height={y(Date.parse(d.data.EndDate)) - y(Date.parse(d.data.StartingDate))}
                fill={'var(--color-base-red400)'}
                stroke={hover?.i === i ? 'var(--color-theme-text)' : 'transparent'}
                stroke-width={2}
                rx={3}
                ry={3}
              />
            {:else if d.data.Category === 'Licensing'}
              <rect
                width={d.y1 - d.y0}
                height={y(Date.parse(d.data.EndDate)) - y(Date.parse(d.data.StartingDate))}
                fill={'var(--color-base-yellow200)'}
                stroke={hover?.i === i ? 'var(--color-theme-text)' : 'transparent'}
                stroke-width={2}
                rx={3}
                ry={3}
              />
            {:else if d.data.Category === 'Tax'}
              <rect
                width={d.y1 - d.y0}
                height={y(Date.parse(d.data.EndDate)) - y(Date.parse(d.data.StartingDate))}
                fill={'var(--color-base-orange300)'}
                stroke={hover?.i === i ? 'var(--color-theme-text)' : 'transparent'}
                stroke-width={2}
                rx={3}
                ry={3}
              />
            {/if}
          </g>
        {/each}
      </g>
      <g>
        <rect />
      </g>
      <text class="label caps end" y={y(new Date(2022, 1, 24))} x={w} dx={-10} dy={20}>{$_(labels.start_of_war)}</text>
    </g>
  </svg>
  <Tooltip visible={hover !== undefined} targetPos={mousePosition}>
    <div class="label caps">
      {$_(`country.${hover?.data.Country_Alpha3.toLowerCase()}`)} (<span class="label small stronger">{hover?.data.Category}</span>)
    </div>
    <div class="label small">{hover?.data.Description}</div>
    <hr />
    <div class="label small weaker">
      <span class="label stronger"><Number value={hover?.data.Share_of_exports_Kcal * 100} unit="%" /></span>
      {$_(labels.tooltip_export_in_kcal)}
    </div>
    <div class="label small weaker">
      {+hover?.data.StartingDate.substring(8, 10)}
      <Date2 year={+hover?.data.StartingDate.substring(0, 4)} month={+hover?.data.StartingDate.substring(5, 7) - 1} /> - {+hover?.data.EndDate.substring(
        8,
        10
      )}
      <Date2 year={+hover?.data.EndDate.substring(0, 4)} month={+hover?.data.EndDate.substring(5, 7) - 1} />
    </div>
  </Tooltip>
</div>
