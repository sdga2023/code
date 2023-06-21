<script>
  import { _ } from 'svelte-i18n';
  import { referenceCountry } from '$lib/stores/referenceCountry.js';
  import * as topojson from 'topojson-client';
  import { geoEqualEarth, geoPath, json, color, scaleSequential, piecewise, interpolateLab } from 'd3';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import Tooltip from '$lib/components/general/Tooltip.svelte';
  import { GreenRamp, DivergingNegPos } from '$lib/styles/colorscales';
  import Legend from '../general/Legend.svelte';
  import Number from '../general/Number.svelte';

  import countriesJSON from '../../../data/other/wb_countries_topo.json';
  import disputedJSON from '../../../data/other/wb_disputed_areas_topo.json';
  import centroidsJSON from '../../../data/other/country_centroids.json';
  import { isMobile } from '$lib/stores/isMobile';
  import { RefCountryOffset } from '$lib/styles/vis';

  export let data;
  export let legendtitle;
  export let chorotype;
  export let nodata;
  export let less5percent;

  let w;
  $: h = w / 1.7;

  let ramp = piecewise(interpolateLab, [
    Colors.ColorBaseOrange100,
    Colors.ColorBaseGreen300,
    Colors.ColorBaseGreen500,
    Colors.ColorBaseGreen700
  ]);
  $: if (chorotype == 'trend') {
    ramp = piecewise(interpolateLab, [
      Colors.ColorBaseOrange500,
      Colors.ColorBaseOrange400,
      Colors.ColorBaseOrange300,
      Colors.ColorBaseDarkPurple200,
      Colors.ColorBaseGreen300,
      Colors.ColorBaseGreen400,
      Colors.ColorBaseGreen500
    ]);
  }
  let domain = [0, 100];
  $: if (chorotype == 'trend') {
    domain = [-50, 50];
  }
  $: colorScale = scaleSequential(ramp).domain(domain);

  let disputed = topojson.feature(disputedJSON, disputedJSON.objects.wb_disputed_areas).features;
  let centroids = centroidsJSON.features;

  $: countries = topojson.feature(countriesJSON, countriesJSON.objects.wb_countries).features.map((c) => {
    const iso3 = c.properties.ISO_A3;
    let countryData = data?.find((c) => c.iso3c === iso3);

    const centroid = centroids?.find((c) => c.properties.iso_3c === iso3)?.geometry.coordinates;

    let fill = Colors.ColorVisNotAvailable;
    if (countryData) {
      fill = colorScale(countryData[chorotype == 'share' ? 'forests_2020' : 'trend']);
      // Set trend to nodata when forests_2022 < 5%
      if (chorotype == 'trend' && countryData.forests_2020 < 5) {
        fill = Colors.ColorVisNotAvailable;
      }
      if (chorotype == 'trend' && countryData.trend != 0 && !countryData.trend) {
        fill = Colors.ColorVisNotAvailable;
      }
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
    if(refCountry){
    const projected = projection(refCountry.centroid);
    refCountry.projected = { x: projected[0], y: projected[1] };
    refCountry.data = data.find((d) => d.iso3c == $referenceCountry);
    }
  } else {
    refCountry = null;
  }
</script>

<div bind:clientWidth={w}>
  {#if w}
    <Legend
      title={legendtitle}
      color={colorScale}
      units="%"
      digits="0"
      tickLabels={chorotype == 'trend'
        ? [
            { value: -50, label: '-50%' },
            { value: 0, label: '0%' },
            { value: 50, label: '50%' }
          ]
        : [
            { value: 0, label: '0%' },
            { value: 100, label: '100%' }
          ]}
    />
    <svg width={w} height={h} on:mousemove={updateMouse} class="map">
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
            fill="transparent"
            class="reference"
            on:mouseover={() => (currentCountry = refCountry.properties.ISO_A3)}
            on:focus={() => (currentCountry = refCountry.properties.ISO_A3)}
            on:mouseout={() => (currentCountry = null)}
            on:blur={() => (currentCountry = null)}
          />
          <text class="reference-label" x={refCountry.projected.x} y={refCountry.projected.y + RefCountryOffset} text-anchor="middle"
            >{$_(`country.${refCountry.properties.ISO_A3.toLowerCase()}`)}</text
          >
          <text class="reference-label" x={refCountry.projected.x} y={refCountry.projected.y + RefCountryOffset + 20} text-anchor="middle">
            {#if refCountry.data}
              <Number value={refCountry.data[chorotype == 'share' ? 'forests_2020' : 'trend']} unit="%" digits={1} />
            {:else}
              {nodata}
            {/if}
          </text>
        {/if}

        {#if disputed}
          {#each disputed as disp}
            <path d={geoPath().projection(projection)(disp)} fill="var(--color-vis-not-available)" stroke="#FFFFFF" stroke-width={0.5} />
          {/each}
        {/if}

        {#if currentCountryData}
          <path d={geoPath().projection(projection)(currentCountryData)} class="emphasisbg" />
          <path d={geoPath().projection(projection)(currentCountryData)} class="emphasis" />
          />
        {/if}
      {/if}
    </svg>
    {#if currentCountryData && mousePos}
      <Tooltip visible={true} targetPos={mousePos}
        ><p class="label caps">{$_(`country.${currentCountry.toLowerCase()}`)}</p>

        {#if currentCountryData.data && chorotype == 'share'}
          <p class="label stronger">
            <Number value={currentCountryData.data.forests_2020} digits={1} unit={'%'} />
          </p>
        {/if}

        {#if currentCountryData.data && chorotype == 'trend' && currentCountryData.data.forests_2020 > 5}
          <p class="label stronger">
            <Number value={currentCountryData.data.trend} digits={1} unit={'%'} />
          </p>
        {/if}

        {#if currentCountryData.data && chorotype == 'trend' && currentCountryData.data.forests_2020 < 5}
          <p class="label stronger">
            {less5percent}
          </p>
        {/if}

        {#if !currentCountryData.data}
          <p class="label stronger">
            {nodata}
          </p>
        {/if}

        {#if chorotype == 'trend' && currentCountryData.data && currentCountryData.data.trend != 0 && !currentCountryData.data.trend}
          <p class="label stronger">
            {nodata}
          </p>
        {/if}
        {#if !(currentCountryData.data && chorotype == 'trend' && currentCountryData.data.forests_2020 < 5)}
          <p class="label small weaker">{legendtitle}</p>
        {/if}
      </Tooltip>
    {/if}
  {/if}
</div>
