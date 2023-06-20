<script>
  import { _ } from 'svelte-i18n';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import * as topojson from 'topojson-client';
  import { geoEqualEarth, geoPath, json, color } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Tooltip from '$lib/components/general/Tooltip.svelte';
  import CategoricalLegend from './../general/CategoricalLegend.svelte';

  import countriesJSON from '../../../data/other/wb_countries_topo.json';
  import disputedJSON from '../../../data/other/wb_disputed_areas_topo.json';
  import centroidsJSON from '../../../data/other/country_centroids.json';
  import { isMobile } from '$lib/stores/isMobile';

  export let data;
  export let id;

  export let banned;
  export let three;
  export let four;
  export let six;
  export let nine;
  export let nolimit;
  export let euro3;
  export let euro4;
  export let euro5;
  export let nostandard;

  let w;
  $: h = w / 1.7;

  $: colorScale =
    id == 'emissions'
      ? /*? [
    { key: 'Very good', label: verygood, colour: Colors.ColorBaseBlue500 },
    { key: 'Good', label: good, colour: Colors.ColorBaseBlue200 },
    { key: 'Weak', label: weak, colour: Colors.ColorBaseRed200 },
    { key: 'Very weak', label: veryweak, colour: Colors.ColorBaseRed500 },
    { key: 'Banned', label: banned, colour: Colors.ColorGrey500 }
  ]*/
        [
          { key: 'nostandard', label: nostandard, colour: Colors.ColorBaseOrange400 },
          { key: 'euro3', label: euro3, colour: Colors.ColorBaseOrange200 },
          { key: 'euro4', label: euro4, colour: Colors.ColorBaseGreen200 },
          { key: 'euro5', label: euro5, colour: Colors.ColorBaseGreen500 },
          { key: 'banned', label: banned, colour: Colors.ColorGrey400 }
        ]
      : [
          { key: 'three', label: three, colour: Colors.ColorBaseTeal500 },
          { key: 'four', label: four, colour: Colors.ColorBaseTeal200 },
          { key: 'six', label: six, colour: Colors.ColorBaseRed200 },
          { key: 'nineplus', label: nine, colour: Colors.ColorBasePink500 },
          { key: 'nolimit', label: nolimit, colour: Colors.ColorBasePink700 },
          { key: 'banned', label: banned, colour: Colors.ColorGrey400 }
        ];

  let disputed = topojson.feature(disputedJSON, disputedJSON.objects.wb_disputed_areas).features;
  let centroids = centroidsJSON.features;

  $: countries = topojson.feature(countriesJSON, countriesJSON.objects.wb_countries).features.map((c) => {
    const iso3 = c.properties.ISO_A3;
    let countryData = data?.find((c) => c.iso3c === iso3);

    const centroid = centroids?.find((c) => c.properties.iso_3c === iso3)?.geometry.coordinates;

    let fill = Colors.ColorVisNotAvailable;
    if (countryData) {
      const datum = countryData['ranking'];
      fill = colorScale.find((d) => d.key == datum).colour;
    }
    //const stroke = color(fill).darker(1);
    const stroke = '#FFFFFF';
    return { ...c, fill, stroke, centroid, data: countryData };
  });

  $: globeOffset = $isMobile ? -40 : 0;

  $: projection = geoEqualEarth().fitExtent(
    [
      [globeOffset, globeOffset],
      [w - globeOffset, h - globeOffset]
    ],
    { type: 'Sphere' }
  );

  let mousePos;
  function updateMouse(evt) {
    mousePos = { x: evt.clientX, y: evt.clientY };
  }

  let currentCountry;
  $: currentCountryData = currentCountry ? countries.find((c) => c.properties.ISO_A3 === currentCountry) : null;
  let refCountry;

  $: if (countries && $referenceCountry) {
    refCountry = countries.find((c) => c.properties.ISO_A3 === $referenceCountry);
    const projected = projection(refCountry.centroid);
    refCountry.projected = { x: projected[0], y: projected[1] };
  } else {
    refCountry = null;
  }
</script>

<div bind:clientWidth={w} class="map">
  {#if w}
    <CategoricalLegend
      legendType="custom"
      customItems={colorScale.map((d) => {
        return { key: d.label, colour: d.colour };
      })}
      top={true}
    />
    <svg width={w} height={h} on:mousemove={updateMouse}>
      {#if countries && projection}
        {#each countries as country}
          <path
            d={geoPath().projection(projection)(country)}
            fill={country.fill}
            on:mouseover={() => (currentCountry = country.properties.ISO_A3)}
            on:focus={() => (currentCountry = country.properties.ISO_A3)}
            on:mouseout={() => (currentCountry = null)}
            on:blur={() => (currentCountry = null)}
          />
          {#if false && country.centroid}
            <text x={projection(country.centroid)?.[0]} y={projection(country.centroid)?.[1]}>{country.properties.ISO_A3}</text>
          {/if}
        {/each}

        {#if disputed}
          {#each disputed as disp}
            <path d={geoPath().projection(projection)(disp)} fill="var(--color-vis-not-available)" stroke="#FFFFFF" stroke-width={0.5} />
          {/each}
        {/if}

        {#if refCountry}
          <path
            d={geoPath().projection(projection)(refCountry)}
            class="emphasisbg"
            on:mouseover={() => (currentCountry = refCountry.properties.ISO_A3)}
            on:focus={() => (currentCountry = refCountry.properties.ISO_A3)}
            on:mouseout={() => (currentCountry = null)}
            on:blur={() => (currentCountry = null)}
          />
          <path
            d={geoPath().projection(projection)(refCountry)}
            class="reference"
            on:mouseover={() => (currentCountry = refCountry.properties.ISO_A3)}
            on:focus={() => (currentCountry = refCountry.properties.ISO_A3)}
            on:mouseout={() => (currentCountry = null)}
            on:blur={() => (currentCountry = null)}
          />

          <text class="reference-label" x={refCountry.projected.x} y={refCountry.projected.y} text-anchor="middle"
            >{$_(`country.${refCountry.properties.ISO_A3.toLowerCase()}`)}</text
          >
          <text class="reference-label" x={refCountry.projected.x} y={refCountry.projected.y + 20} text-anchor="middle">
            {refCountry.data ? colorScale.find((c => c.key == refCountry.data['ranking'])).label : 'No data'}
          </text>
        {/if}

        {#if currentCountryData}
          <path d={geoPath().projection(projection)(currentCountryData)} class="hover-outline emphasisbg" />
          <path d={geoPath().projection(projection)(currentCountryData)} class="hover-outline emphasis" />
          />
        {/if}
      {/if}
    </svg>
    {#if currentCountry && mousePos}
      <Tooltip visible={true} targetPos={mousePos}
        ><p class="label geo">{$_(`country.${currentCountry?.toLowerCase()}`)}</p>
        <p class="label number">
          {data.find((c) => c.iso3c === currentCountry)
            ? colorScale.find((c) => c.key == data.find((c) => c.iso3c === currentCountry).ranking).label
            : 'No data'}
        </p>
      </Tooltip>
    {/if}
  {/if}
</div>

<style>
  .hover-outline {
    pointer-events: none;
  }
</style>
