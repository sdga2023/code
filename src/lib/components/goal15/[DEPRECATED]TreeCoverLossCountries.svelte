<script>
    import { scaleLinear, scaleBand } from 'd3-scale';
    import { max } from 'd3-array';
    import CountryPicker from "../general/CountryPicker.svelte";
    import * as Colors from '$lib/styles/tokens.es6.js';
    
    export let data
    export let parentWidth

    let selectedCountry = 'ARG'
    $: countryData = selectedCountry ? data.filter(d => d.iso3c == selectedCountry) : []

    let margins = {
    top: 20,
    right: 0,
    bottom: 20,
    left: 0
  };

  $: w = parentWidth;
  let h = 450;

  $: labelData = countryData.filter(d => [2001, 2011, 2021].includes(d.year));

  $: xScale = scaleBand()
    .domain(countryData.map((d) => d.year).sort((a,b) => a - b))
    .range([0, w - margins.left - margins.right])
    .paddingInner(0.2)
    .paddingOuter(0.3);

  $: yDomain = [0, max(countryData, (d) => d.loss)];
  $: yScale = scaleLinear()
    .domain(yDomain)
    .range([h - margins.top - margins.bottom, 0]);
</script>

<CountryPicker bind:selectedCountry></CountryPicker>
    {#if w}
    <svg width={w} height={h}>
      <g transform={'translate(' + margins.left+(xScale.bandwidth() / 2) + ',' + margins.top + ')'}>
        {#each countryData as bar}
          <rect
            x={xScale(bar.year) - xScale.bandwidth() / 2}
            y={yScale(bar.loss)}
            width={xScale.bandwidth()}
            height={Math.abs(yScale(bar.loss) - yScale(0))}
            fill={Colors.ColorVisBinaryNeg}
          />
        {/each}

        {#each labelData as label}
        <text x={xScale(label.year)} y={yScale(0)} dy={16} text-anchor={'middle'} class="small"
          >{label.year}</text
        >
        <text
          x={xScale(label.year)}
          y={yScale(label.loss)}
          dy={-6}
          text-anchor={'middle'}
          class="val small stronger"
          fill={Colors.ColorVisBinaryNeg}>
          {label.loss}
          </text
        >
      {/each}
      </g>
    </svg>
    {/if}