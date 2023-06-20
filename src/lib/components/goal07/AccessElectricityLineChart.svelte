<script>
  import { scaleLinear } from 'd3-scale';
  import { line, curveNatural } from 'd3-shape';
  import ChartGrid from './../ChartGrid.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Number from './../general/Number.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import { _ } from 'svelte-i18n';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import CountryPicker from '../general/CountryPicker.svelte';
  import countriesISO from '../../../data/other/wb_countries_iso3.json';
  import { LineChartCircleRadius } from '$lib/styles/vis';

  export let data;
  export let yaxistitle;
  export let yaxisunits;

  const regions = ['EAS', 'ECS', 'LCN', 'MEA', 'NAC', 'SAS', 'SSF', 'WLD'];

  const colorScale = {
    EAS: Colors.ColorVisRegionEAS,
    ECS: Colors.ColorVisRegionECS,
    LCN: Colors.ColorVisRegionLCN,
    MEA: Colors.ColorVisRegionMEA,
    NAC: Colors.ColorVisRegionNAC,
    SAS: Colors.ColorVisRegionSAS,
    SSF: Colors.ColorVisRegionSSF,
    WLD: Colors.ColorVisRegionWLD
  };

  $: regionsData = data.filter((d) => regions.includes(d.iso3c));
  $: labelData = regionsData.filter((d) => d.date == 2020 || d.date == 2000);

  $: selectedCountryData = data && selectedCountry ? data.filter((d) => d.iso3c == selectedCountry) : [];
  $: referenceCountryData = data && referenceCountry ? data.filter((d) => d.iso3c == $referenceCountry) : [];

  let margins = {
    top: 40,
    right: 64,
    bottom: 24,
    left: 60
  };

  let w;
  let h = 450;

  $: xScale = scaleLinear()
    .domain([2000, 2020])
    .range([0, w - margins.left - margins.right]);
  $: xTicks = [2000, 2010, 2020];
  $: yScale = scaleLinear()
    .domain([0, 100])
    .range([h - margins.top - margins.bottom, 0]);
  $: yTicks = [0, 25, 50, 75, 100];

  $: lineGenerator = line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value))
    .curve(curveNatural);

  let selectedCountry;
  let countriesToRemove = countriesISO.filter((d) => ![...new Set(data.map((c) => c.iso3c))].includes(d));
  let remove = (iso) => countriesToRemove.includes(iso);

</script>

<div bind:clientWidth={w} class="vis">
  <CountryPicker bind:selectedCountry {remove} />
  {#if w}
    <svg width={w} height={h} class="linechart">
      <g transform={'translate(0,' + margins.top + ')'}>
        {#if yScale && yTicks && w}
          <ChartGrid
            gridType="yGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.right}
            scale={yScale}
            ticks={yTicks}
            yAxisTitle={yaxistitle}
            yAxisUnits={yaxisunits}
          />
        {/if}
      </g>
      <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
        {#if xScale && xTicks && w}
          <ChartGrid
            gridType="xGrid"
            innerHeight={h - margins.top - margins.bottom}
            innerWidth={w - margins.left - margins.right}
            scale={xScale}
            ticks={xTicks}
          />
        {/if}

        {#each regions as region}
          <path d={lineGenerator(regionsData.filter((d) => d.iso3c == region))} fill="none" stroke={colorScale[region]} class="bg" />
          <path d={lineGenerator(regionsData.filter((d) => d.iso3c == region))} fill="none" stroke={colorScale[region]} />
        {/each}

        {#if labelData}
          {#each labelData as label}
            <circle cx={xScale(label.date)} cy={yScale(label.value)} r={LineChartCircleRadius} fill={colorScale[label.iso3c]} />

            {#if label.iso3c == 'WLD'}
              <text class={'geo middle'} x={xScale(2010) + 6} y={yScale(82.5)} fill={Colors.ColorVisRegionWLD}>{$_('region.WLD')}</text>
              {#if label.date == 2020}
                <text x={xScale(label.date) + 6} y={yScale(label.value) + 6} fill={Colors.ColorVisRegionWLD}
                  ><Number value={label.value} digits={1} unit={'%'} /></text
                >
              {:else}
                <text x={xScale(label.date) - 6} y={yScale(label.value) + 4} fill={Colors.ColorVisRegionWLD} text-anchor={'end'}
                  ><Number value={label.value} digits={1} unit={'%'} /></text
                >
              {/if}
            {/if}
          {/each}
        {/if}

        {#if selectedCountryData.length > 0}
          <path d={lineGenerator(selectedCountryData)} style:fill={'none'} class="bg" />
          <path d={lineGenerator(selectedCountryData)} style:fill={'none'} stroke={Colors.ColorVisSelected} />
        {/if}

        {#if referenceCountryData.length > 0}
          <path d={lineGenerator(referenceCountryData)} style:fill={'none'} class="bg" />
          <path d={lineGenerator(referenceCountryData)} style:fill={'none'} stroke={Colors.ColorReferenceCountry} />
        {/if}

        {#if referenceCountryData}
          {#each referenceCountryData as label}
            {#if label.date == 2000 || label.date == 2020}
              <circle
                cx={xScale(label.date)}
                cy={yScale(label.value)}
                r={LineChartCircleRadius}
                style:fill={Colors.ColorReferenceCountry}
              />
            {/if}
            {#if label.date == 2016}
              <text
                class={'reference-label middle'}
                x={xScale(label.date)}
                y={yScale(label.value) + 4}
                style:fill={Colors.ColorReferenceCountry}>{$_(`country.${$referenceCountry.toLowerCase()}`)}</text
              >
            {/if}
            {#if label.date == 2020}
              <text class={'number'} x={xScale(label.date) + 6} y={yScale(label.value) + 4} style:fill={Colors.ColorReferenceCountry}
                ><Number value={label.value} digits={1} unit={'%'} /></text
              >
            {/if}
          {/each}
        {/if}

        {#if selectedCountryData}
          {#each selectedCountryData as label}
            {#if label.date == 2000 || label.date == 2020}
              <circle cx={xScale(label.date)} cy={yScale(label.value)} r={LineChartCircleRadius} fill={Colors.ColorVisSelected} />
            {/if}
            {#if label.date == 2006}
              <text class={'geo middle'} x={xScale(label.date)} y={yScale(label.value) + 4} style:fill={Colors.ColorVisSelected}
                >{$_(`country.${selectedCountry.toLowerCase()}`)}</text
              >
            {/if}
            {#if label.date == 2020}
              <text class={'number'} x={xScale(label.date) + 6} y={yScale(label.value) + 4} style:fill={Colors.ColorVisSelected}
                ><Number value={label.value} digits={1} unit={'%'} /></text
              >
            {/if}
          {/each}
        {/if}
      </g>
    </svg>
  {/if}
  <CategoricalLegend legendType={'regions'} />
</div>
