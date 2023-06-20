<script>
  import { line, area, curveNatural, sum, curveCatmullRom } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';

  export let data;
  export let xScale;
  export let yScale;

  $: gdpLine = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.gdp))
    .curve(curveCatmullRom);
  $: forcLine = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.gdp_forc20))
    .curve(curveCatmullRom);
  $: diffArea = area()
    .x((d) => xScale(d.year))
    .y0((d) => yScale(d.gdp))
    .y1((d) => yScale(d.gdp_forc20))
    .curve(curveCatmullRom);

  $: sum_differences = sum(data, (d) => d.gdp - d.gdp_forc20);
</script>

{#if data && data.length > 2}
  <path
    d={diffArea(data)}
    fill={sum_differences > 0 ? Colors.ColorVisBinaryPos : Colors.ColorVisBinaryNeg}
    opacity={0.5}
    stroke={Colors.ColorThemeText}
    stroke-width={0}
  />
  <!--
  {#each data as diff}
    {#if diff.gdp_forc20 !== null}
      <rect
        x={xScale(diff.year)}
        y={Math.min(yScale(diff.gdp), yScale(diff.gdp_forc20))}
        width={1}
        height={Math.abs(yScale(diff.gdp_forc20) - yScale(diff.gdp))}
        fill={diff.gdp < diff.gdp_forc20 ? Colors.ColorVisBinaryNeg : Colors.ColorVisBinaryPos}
      />
    {/if}
  {/each}
-->
  <path d={gdpLine(data)} fill="none" stroke={sum_differences > 0 ? Colors.ColorVisBinaryPos : Colors.ColorVisBinaryNeg} stroke-width={2} />
  <path d={forcLine(data)} fill="none" stroke={Colors.ColorGrey400} stroke-width={1} />
{/if}
