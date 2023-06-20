<script>
  import vars from '$lib/variables.js';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import {
    geoEqualEarthRaw,
    geoEqualEarth,
    geoGraticule10,
    geoOrthographic,
    geoOrthographicRaw,
    geoProjection,
    geoPath,
    json,
    geoClipAntimeridian,
    geoClipCircle,
    easeQuadInOut,
    scaleThreshold,
    extent,
    interpolateRgbBasis,
    scaleSequential,
    color
  } from 'd3';
  import * as topojson from 'topojson-client';

  import Legend from '$lib/components/general/Legend.svelte';
  import Tooltip from '$lib/components/general/Tooltip.svelte';
  import countriesJSON from '../../../data/other/countries-110m.json';

  export let data;
  export let legend;

  $: console.log(data);

  let canvas;
  let w;
  let h;

  let countries = topojson.feature(countriesJSON, countriesJSON.objects.countries);
  let land = topojson.feature(countriesJSON, countriesJSON.objects.land);
  $: ctx = canvas ? canvas.getContext('2d') : null;
  const globeOffset = 32;

  $: projection = geoEqualEarth()
    .fitExtent(
      [
        [globeOffset, globeOffset],
        [w - globeOffset, h - globeOffset]
      ],
      { type: 'Sphere' }
    )
    .clipExtent([
      [globeOffset, globeOffset],
      [w - globeOffset, h - globeOffset]
    ]);
  const sphere = { type: 'Sphere' };

  $: path = geoPath(projection, ctx).pointRadius(1.5);

  $: graticule = geoGraticule10();

  let colorScale;

  $: if (data) {
    const [min, max] = extent(data.filter((c) => c.year === '2020-2021').map((c) => c['excess.mean']));

    const dmax = max;
    const dmin = Math.abs(min);
    const d = Math.max(dmax, dmin) / 2;

    const ramp = interpolateRgbBasis([Colors.ColorBaseBlue700, Colors.ColorBaseDarkPurple100, Colors.ColorBasePink600]);

    colorScale = scaleSequential(ramp).domain([-d * 2, d * 2]);
  }

  const renderGlobe = () => {
    if (!ctx || !path || !data) return;
    ctx.clearRect(0, 0, w, h);

    /*ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#29273D';
    ctx.beginPath();
    path(sphere);
    ctx.fill();
    ctx.globalAlpha = 1;
    const globeGradient = ctx.createRadialGradient(w / 4, h / 4, 0, w / 4, h / 4, w / 2);
    globeGradient.addColorStop(0, '#4B4869');
    globeGradient.addColorStop(1, '#29273D');
    ctx.fillStyle = globeGradient;
    ctx.beginPath();
    path(sphere);
    ctx.fill();
    
    ctx.strokeStyle = Colors.ColorGrey200;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    path(graticule);
    ctx.stroke();

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = Colors.ColorGreyDarkest;
    ctx.beginPath();
    path(land);
    //ctx.fill();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = Colors.ColorThemeDarkBase;
    */
    ctx.beginPath();
    path(countries);
    ctx.fillStyle = Colors.ColorVisNotAvailable;
    ctx.fill();

    countries?.features.forEach((country) => {
      const { name, iso3 } = country.properties;

      const countryData = data.find((c) => c.iso3 === iso3 && c.year === '2020-2021');

      if (countryData) {
        ctx.fillStyle = colorScale(countryData['excess.mean']);

        const darkerCol = color(ctx.fillStyle).darker(1);
        ctx.strokeStyle = darkerCol;

        ctx.beginPath();
        path(country);
        ctx.fill();
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });
  };
  $: projection, path, w, h, land, countries, data, renderGlobe();

  let latLng, mousePos;

  function checkPos(evt) {
    const bounds = canvas.getBoundingClientRect();
    mousePos = [evt.clientX, evt.clientY];
    if (projection) {
      latLng = projection.invert([mousePos[0] - bounds.left, mousePos[1] - bounds.top]);
      //console.log(latLng);
    }
  }
</script>

<div class="globe-wrapper">
  <div class="globe" bind:clientWidth={w} bind:clientHeight={h}>
    <canvas
      bind:this={canvas}
      width={w}
      height={h}
      on:mousemove={checkPos}
      on:mouseout={() => (latLng = null)}
      on:blur={() => (latLng = null)}
    />
  </div>
  <Legend title={legend} color={colorScale} />
  {#if latLng}
    <Tooltip visible={true} targetPos={{ x: mousePos[0], y: mousePos[1] }}>{latLng}</Tooltip>
  {/if}
</div>

<style type="scss">
  .globe-wrapper {
    grid-column: full;

    position: relative;

    height: 80vh;
  }
  .globe {
    position: absolute;
    top: 0;
    left: 0;

    display: flex;
    width: 100%;
    height: 100%;
  }
</style>
