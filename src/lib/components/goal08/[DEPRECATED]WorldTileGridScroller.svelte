<script>
  import { scaleLinear } from 'd3-scale';
  import { grid } from '../../../data/worldtilegrid.js';
  import { max, extent } from 'd3-array';
  import DifferenceChartSmallMult from './DifferenceChartSmallMult.svelte';
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import { _ } from 'svelte-i18n';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  //import { CountryPicker } from '$lib/components';

  export let data;
  export let activeScene;

  let highlight = {
    'gridmap-intro': [],
    'zoom-asia': [],
    'idn-ind': ['IND', 'IDN'],
    'arg-usa': ['ARG', 'USA'],
    chn: ['CHN'],
    'nic-ven-irl-lby-irn': ['NIC', 'GUY', 'IRL', 'LBY', 'IRN'],
    'tourism-countries': [
      'ATG',
      'ALB',
      'ARM',
      'BRB',
      'BHS',
      'CPV',
      'CYP',
      'FJI',
      'GEO',
      'GMB',
      'GRC',
      'HRV',
      'JOR',
      'KHM',
      'LBN',
      'MNE',
      'MAC',
      'MUS',
      'MDV',
      'PAN',
      'PRT',
      'PLW',
      'SYC',
      'THA',
      'TON',
      'VCT',
      'VUT',
      'WSM'
    ],
    'zoomout-world': []
  };

  $: tiledata = data ? data : [];

  let margins = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  };

  let w;
  let h = 600;
  let tilepadding = 2;

  // Scales for tile grid
  $: xScale = scaleLinear()
    .domain([1, max(grid, (d) => d.x) + 1])
    .range([0, w - margins.left - margins.right]);
  $: tileWidth = xScale(2) - xScale(1) - tilepadding;
  $: yScale = scaleLinear()
    .domain([1, max(grid, (d) => d.y) + 1])
    .range([0, h - margins.top - margins.bottom]);
  $: tileHeight = yScale(2) - yScale(1) - tilepadding;

  // Scales for small multiples
  $: xScaleMult = scaleLinear()
    .domain(extent(tiledata, (d) => d.year))
    .range([0, tileWidth - tilepadding]);
  $: yScaleMult = scaleLinear().domain([90, 130]).range([tileHeight, 0]);

  // Scales for single country 
  $: xScaleSingle = scaleLinear()
    .domain(extent(tiledata, (d) => d.year))
    .range([0, w])
  $: yScaleSingle = scaleLinear()
    .domain([90, 130]).range([h, 0])

  const zoomDuration = 2000;
  const vBoxX = tweened(0, {
    duration: zoomDuration,
    easing: cubicInOut
  });
  const vBoxY = tweened(0, {
    duration: zoomDuration,
    easing: cubicInOut
  });
  const vBoxWidth = tweened(w, {
    duration: zoomDuration,
    easing: cubicInOut
  });
  const vBoxHeight = tweened(h, {
    duration: zoomDuration,
    easing: cubicInOut
  });

  $: if (activeScene.index == 1 || activeScene.index == 3) {
    vBoxX.set(xScale(22));
    vBoxY.set(yScale(5));
    vBoxWidth.set(xScale(26) - xScale(21));
    vBoxHeight.set(yScale(14) - yScale(4));
  }
  $: if (activeScene.index == 4) {
    vBoxX.set(xScale(0));
    vBoxY.set(yScale(0));
    vBoxWidth.set(xScale(8) - xScale(0));
    vBoxHeight.set(yScale(16) - yScale(0));
  }
  $: if (activeScene.index == 0 || activeScene.id == 'nic-ven-irl-lby-irn' || activeScene.id == 'zoomout-world') {
    vBoxX.set(0);
    vBoxY.set(0);
    vBoxWidth.set(w);
    vBoxHeight.set(h);
  }

  //let selectedCountry

</script>

<div bind:clientWidth={w}>
  {#if w < 800 && $referenceCountry}
    <!--div class="picker-container">
  <CountryPicker bind:selectedCountry />
</div-->
    <svg width={w} height={h} viewBox={`${$vBoxX} ${$vBoxY} ${$vBoxWidth} ${$vBoxHeight}`}>
      <rect x={0} y={0} width={w} height={h} fill="#cccccc" title={$referenceCountry} opacity={0.2} />
      <DifferenceChartSmallMult data={tiledata.filter((d) => d.iso3c == $referenceCountry)} xScale={xScaleSingle} yScale={yScaleSingle} />
      <text x={tileWidth / 2} y={6} class={'small countrycode texthalo'}>{$_(`country.${$referenceCountry.toLowerCase()}`)}</text>
    </svg>
  {/if}
  {#if w > 800 || !$referenceCountry}
  <svg width={w} height={h} viewBox={`${$vBoxX} ${$vBoxY} ${$vBoxWidth} ${$vBoxHeight}`}>
    {#if tiledata && tiledata.length > 0 && activeScene.id}
      <g transform={'translate(' + margins.left + ',' + margins.top + ')'}>
        {#each grid as tile}
          <g
            transform={'translate(' + xScale(tile.x) + ',' + yScale(tile.y) + ')'}
            opacity={activeScene.index == 0
              ? 1
              : highlight[activeScene.id].length == 0 || highlight[activeScene.id].includes(tile.iso3c)
              ? 1
              : 0.1}
            class="tile"
          >
            <rect x={0} y={0} width={tileWidth} height={tileHeight} fill="#cccccc" title={tile.iso3c} opacity={0.2} />
            <DifferenceChartSmallMult data={tiledata.filter((d) => d.iso3c == tile.iso3c)} xScale={xScaleMult} yScale={yScaleMult} />
            <text x={tileWidth / 2} y={6} class={'small countrycode texthalo'}
              >{highlight[activeScene.id].includes(tile.iso3c) ? $_(`country.${tile.iso3c.toLowerCase()}`) : tile.iso3c}</text
            >
          </g>
        {/each}
      </g>
    {/if}
  </svg>
  {/if}
</div>

<style>
  .countrycode {
    text-anchor: middle;
  }
  .texthalo {
    font-size: 0.7em;
    opacity: 0.5;
    text-shadow: -1px -1px white, -1px 1px white, 1px 1px white, 1px -1px white, -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
  }
  .tile {
    transition: opacity 0.5s;
  }
  .picker-container {
    pointer-events: auto;
  }
</style>
