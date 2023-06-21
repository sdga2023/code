<script>
  import { _ } from 'svelte-i18n';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import * as topojson from 'topojson-client';
  import { geoEqualEarth, geoPath, interpolateLab, piecewise, scaleSequential } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Tooltip from '$lib/components/general/Tooltip.svelte';
  import { BlueRamp } from '$lib/styles/colorscales';
  import Legend from '../general/Legend.svelte';
  import Number from '../general/Number.svelte';

  import countriesJSON from '../../../data/other/wb_countries_topo.json';
  import disputedJSON from '../../../data/other/wb_disputed_areas_topo.json';
  import fishingZonesJSON from '../../../data/other/overfishing-zones.json';

  export let data;
  export let legendtitle;

  export let pacificne;
  export let pacificec;
  export let pacificwc;
  export let pacificse;
  export let pacificsw;
  export let pacificnw;
  export let pacificant;
  export let arctic;
  export let atlanticne;
  export let atlanticnw;
  export let atlanticec;
  export let atlanticwc;
  export let atlanticsw;
  export let atlanticse;
  export let atlanticant;
  export let medblack;
  export let indianw;
  export let indianant;
  export let indiane;

  const zoneMapper = {
    pacificne: pacificne,
    pacificec: pacificec,
    pacificwc: pacificwc,
    pacificse: pacificse,
    pacificsw: pacificsw,
    pacificnw: pacificnw,
    pacificant: pacificant,
    arctic: arctic,
    atlanticne: atlanticne,
    atlanticnw: atlanticnw,
    atlanticec: atlanticec,
    atlanticwc: atlanticwc,
    atlanticsw: atlanticsw,
    atlanticse: atlanticse,
    atlanticant: atlanticant,
    medblack: medblack,
    indianw: indianw,
    indianant: indianant,
    indiane: indiane
  };

  let w;
  $: h = w / 1.7;

  $: colorScale = scaleSequential(
    piecewise(interpolateLab, [Colors.ColorBaseBlue100, Colors.ColorBaseTeal300, Colors.ColorBaseYellow500, Colors.ColorBaseRed700])
  ).domain([0, 70]);

  let disputed = topojson.feature(disputedJSON, disputedJSON.objects.wb_disputed_areas).features;

  $: countries = topojson.feature(countriesJSON, countriesJSON.objects.wb_countries).features;
  $: zones = topojson.feature(fishingZonesJSON, fishingZonesJSON.objects['overfishing-zones']).features;

  const globeOffset = 0;

  $: projection = geoEqualEarth() /*.rotate([-60, 0]).center([60, 0]).translate()*/
    .fitExtent(
      [
        [globeOffset, globeOffset],
        [w - globeOffset, h - globeOffset]
      ],
      { type: 'Sphere' }
    );
</script>

<div bind:clientWidth={w}>
  {#if w}
    <Legend
      title={legendtitle}
      color={colorScale}
      units="%"
      digits="0"
      tickLabels={[
        { value: 0, label: '0%' },
        { value: 35, label: '35%' },
        { value: 70, label: '70%' }
      ]}
    />
    <svg width={w} height={h}>
      {#if countries && projection}
        {#each countries as country}
          <path d={geoPath().projection(projection)(country)} fill={Colors.ColorThemeBgWeaker} stroke={country.stroke} stroke-width={0.5} />
        {/each}

        {#if disputed}
          {#each disputed as disp}
            <!--path d={geoPath().projection(projection)(disp)} fill="var(--color-vis-not-available)" stroke="#FFFFFF" stroke-width={0.5} /-->
          {/each}
        {/if}
      {/if}
      {#if zones && projection}
        {#each zones as zone}
          <path
            d={geoPath().projection(projection)(zone)}
            fill={data.find((d) => d.zone == zone.properties.zone).share_overfished_stocks
              ? colorScale(data.find((d) => d.zone == zone.properties.zone).share_overfished_stocks)
              : Colors.ColorVisNotAvailable}
            stroke={'white'}
            stroke-width={0.5}
          />
        {/each}
      {/if}
      {#each data as centroid}
        {#if w > 700}
          <text
            class={'small'}
            x={projection([centroid.lon, centroid.lat])[0]}
            y={projection([centroid.lon, centroid.lat])[1] - 10}
            text-anchor={'middle'}>{zoneMapper[centroid.zone]}</text
          >
        {/if}
        {#if centroid.share_overfished_stocks}
          <text
            class="number"
            x={projection([centroid.lon, centroid.lat])[0]}
            y={projection([centroid.lon, centroid.lat])[1] + 8}
            text-anchor={'middle'}><Number value={centroid.share_overfished_stocks} unit="%" /></text
          >
        {/if}
      {/each}
    </svg>
  {/if}
</div>

<style>
</style>
