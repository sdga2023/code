<script>
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { min, max } from 'd3-array';
  import { format } from 'd3-format';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { _ } from 'svelte-i18n';

  export let data;
  export let bartype;
  export let region;
  export let height;

  let margins = {
    top: 20,
    right: 0,
    bottom: 16,
    left: 0
  };

  let w;
  let h = height;

  $: if (region == 'WLT') {
    margins.left = 2;
    margins.right = 50;
  }

  $: barData = data.filter((d) => d.iso3c == region);
  $: labelData = region == 'WLT' ? barData.filter((d) => [1961, 1970, 1980, 1990, 2000, 2009, 2020, 2024].includes(d.year)) : barData;
  $: value19 = barData.find((d) => d.year == 2019).value;

  $: xScale = scaleBand()
    .domain(barData.map((d) => d.year).sort((a, b) => a - b))
    .range([0, w - margins.left - margins.right])
    .paddingInner(0.2)
    .paddingOuter(region == 'WLT' ? 1 : 0.1);

  $: yDomain = region == 'WLT' ? [-3.3, 5.7] : [min(data, (d) => d.value) > 0 ? 0 : min(data, (d) => d.value), max(data, (d) => d.value)];
  $: yScale = scaleLinear()
    .domain(yDomain)
    .range([h - margins.top - margins.bottom, 0]);
</script>

<div class="barchart" bind:clientWidth={w}>
  {#if region !== 'WLT'}
    <p class="title caps">{$_(`region.${region}`)}</p>
  {/if}
  {#if w}
    <svg class={region === 'WLT' ? 'world' : 'region'} width={w} height={h}>
      <g transform={'translate(' + margins.left + xScale.bandwidth() / 2 + ',' + margins.top + ')'}>
        {#each barData as bar}
          <rect
            x={xScale(bar.year) - xScale.bandwidth() / 2}
            y={+bar.value > 0 ? yScale(bar.value) : yScale(0)}
            width={xScale.bandwidth()}
            height={Math.abs(yScale(bar.value) - yScale(0))}
            fill={bartype == 'gdp' ? (+bar.value > 0 ? Colors.ColorVisBinaryPos : Colors.ColorVisBinaryNeg) : Colors.ColorVisReference}
          />
          {#if bartype == 'unemployment' && bar.value > value19}
            <rect
              x={xScale(bar.year) - xScale.bandwidth() / 2}
              y={yScale(bar.value)}
              width={xScale.bandwidth()}
              height={yScale(value19) - yScale(bar.value)}
              fill={Colors.ColorVisBinaryNeg}
            />
          {/if}
        {/each}
        {#each labelData as label}
          <text x={xScale(label.year)} y={yScale(0)} dy={label.value > 0 ? 16 : -8} class="small middle">{label.year}</text>
          <text
            x={xScale(label.year)}
            y={yScale(label.value)}
            dy={label.value > 0 ? -6 : 16}
            class="number middle"
            fill={bartype == 'gdp'
              ? label.value > 0
                ? Colors.ColorVisBinaryPos
                : Colors.ColorVisBinaryNeg
              : label.value > value19
              ? Colors.ColorVisBinaryNeg
              : Colors.ColorGrey200}
          >
            {bartype == 'gdp' ? format('+')(label.value) + '%' : label.value + '%'}
          </text>
        {/each}
      </g>
    </svg>
  {/if}
</div>

<style>
  .barchart {
    width: 100%;
  }
  .region {
    margin-bottom: var(--space-s);
  }
</style>
