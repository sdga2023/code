<script>
  import variables from '$lib/variables.js';

  import { inview } from 'svelte-inview';

  import { activeGoal } from '$lib/stores/activeGoal';
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from '$lib/external/three.js/OrbitControls.js';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import { referenceCountry } from '$lib/stores/referenceCountry';

  import { geoPath, geoOrthographic, easeCubic } from 'd3';
  import * as topojson from 'topojson-client';
  import landJSON from '../../data/other/wb_land_topo.json';
  import countriesJSON from '../../data/other/wb_countries_topo.json';
  import centroidsJSON from '../../data/other/country_centroids.json';
  import { isScreenshotting } from '$lib/stores/isScreenshotting';
  import { isMobile } from '$lib/stores/isMobile';
  import { isTablet } from '$lib/stores/isTablet';
  import { Loading } from '$lib/components';

  export let width = 0;
  export let height = 0;

  export let selectedCountry;

  export let onHomepage = false;
  export let globedescription;

  let rot = 0;

  // d3.projection zone:
  let svgEl;

  let countries = topojson.feature(countriesJSON, countriesJSON.objects.wb_countries);
  let land = topojson.feature(landJSON, landJSON.objects.wb_land);
  let centroids = centroidsJSON.features;

  let d, dSel, dRef;

  let globeOffset = 5;

  const rad2deg = (rad) => (rad * 180) / Math.PI;
  const deg2rad = (deg) => (deg / 180) * Math.PI;

  export let projection;

  $: projection = geoOrthographic()
    .scale(height / 2 - globeOffset)
    .translate([width / 2, height / 2 - globeOffset]);

  $: path = geoPath().projection(projection);
  $: d = path(land);

  let countryDs;
  let ref, sel;

  let rotaScale = (r) => rad2deg(Math.PI / 2 - r);

  $: {
    projection.rotate([rotaScale(rot[0]), -rotaScale(rot[1])]);
    // d = path(land);

    if (mouseIsOver && !isMoving && !onHomepage) {
      countryDs = countries?.features.map((c, i) => path(c));
    }

    if (selectedCountry) {
      sel = countries.features.find((d) => d.properties.ISO_A3 === selectedCountry);
      dSel = path(sel);
    }
    if ($referenceCountry) {
      ref = countries.features.find((d) => d.properties.ISO_A3 === $referenceCountry);
      dRef = path(ref);
    }
  }

  // three.js zone:
  let el;

  let renderer, geometry, scene, camera, baseMap, ambLight, light1, light2;
  let controls;

  // provide two meshes/materials so we can blend between them when loading new textures:
  let earthMeshes = [null, null];
  let earthMaterials = [null, null];

  let activeEarthIndex = 0;
  let activeGoalTexture = -1;

  const clock = new THREE.Clock();

  const loadingManager = new THREE.LoadingManager();
  let loader = new THREE.TextureLoader(loadingManager);

  loadingManager.onStart = () => {
    isLoadingTextures = true;
    activeEarthIndex = activeEarthIndex === 1 ? 0 : 1;
  };
  loadingManager.onLoad = () => {
    isLoadingTextures = false;
  };
  loadingManager.onError = () => {
    isLoadingTextures = false;
  };

  $: {
    if (el && width && height) {
      if (!renderer) {
        renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(new THREE.Color(Colors.ColorThemeDarkBgWeakest));
        // renderer.shadowMap.enabled = true;
        // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      }
      renderer.setSize(width, height);
    }
  }

  $: if ($activeGoal && !isRefreshingGlobeTexture && activeGoalTexture !== $activeGoal.number) {
    /*if (onHomepage && !$isMobile) {
      activeGoalTexture = $activeGoal.number;
    }*/

    const setTexture = (t) => {
      if (isInitialTextureLoad) {
        // on first load, initialize all textures with current texture
        // (otherwise, blends won't work)
        earthMaterials.forEach((em) => {
          em.map = t;
          em.opacity = 0;
        });
        earthMaterials[activeEarthIndex].opacity = 1;

        isInitialTextureLoad = false;
      } else {
        earthMaterials[activeEarthIndex].map = t;
      }

      activeGoalTexture = $activeGoal.number;
    };

    isRefreshingGlobeTexture = true;
    loader?.load(
      `${variables.pathPrefix}/assets/textures/${$activeGoal.string}.png`,
      (t) => {
        t.anisotropy = renderer?.capabilities?.getMaxAnisotropy();
        t.generateMipmaps = false;

        if (earthMaterials[activeEarthIndex]) {
          setTexture(t);
        }

        isRefreshingGlobeTexture = false;
      },
      undefined,
      (err) => {
        // fall back to base:
        if (earthMaterials[activeEarthIndex]) {
          if (!baseMap) {
            // load, then set baseMap:
            baseMap = loader.load(`${variables.pathPrefix}/assets/textures/baseMap.png`, (t) => {
              setTexture(baseMap);
            });
          } else {
            // baseMap is available, set it directly:
            setTexture(baseMap);
          }
        }
        isRefreshingGlobeTexture = false;
        activeGoalTexture = $activeGoal.number;
      }
    );
  }

  $: {
    $referenceCountry;
    lastPannedToCountry = null;
  }

  $: if ($isScreenshotting && controls) {
    controls.autoRotate = false;

    const c = [70, 10];
    let phi = ((90 - c[1]) * Math.PI) / 180;
    let theta = ((c[0] - 270) * Math.PI) / 180;

    camera.position.setFromSphericalCoords(1, phi, theta);
    controls.update();
  }

  // disable rotation when loading textures to prevent stuttering
  /*$: if (controls) {
    if (isLoadingTextures) {
      controls.autoRotate = false;
    } else {
      controls.autoRotate = !mouseIsOver;
    }
  }*/

  let isRendering = true;
  let isRefreshingGlobeTexture;
  let isLoadingTextures = true;
  let isInitialTextureLoad = true;
  let lastPannedToCountry = null;
  let slerpProgress = 0;
  let initialPos;
  let endAngle;
  let normal;

  function render() {
    const delta = clock.getDelta();

    if (controls && camera) {
      if (selectedCountry !== lastPannedToCountry) {
        // start panning...
        if (slerpProgress === 0) {
          const targetPos = new THREE.Vector3(1, 0, 0);
          const c = centroids.find((d) => d.properties.iso_3c === selectedCountry)?.geometry?.coordinates;
          if (c) {
            let cOff = [0, 0];
            if (onHomepage && !$isMobile && !$isTablet) {
              // rotate towards the upper-right on homepage:
              cOff[1] = 30;
              cOff[0] = -15;
            }
            //targetPos.applyEuler(new THREE.Euler((c[0] < 0 ? -1 : 1) * deg2rad(c[1]), deg2rad(c[0]), 0));
            let phi = ((90 - c[1] + cOff[1]) * Math.PI) / 180;
            let theta = ((c[0] - 270 + cOff[0]) * Math.PI) / 180;

            targetPos.setFromSphericalCoords(1, phi, theta);

            initialPos = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);

            normal = new THREE.Vector3();
            normal.copy(initialPos).cross(targetPos).normalize();
            endAngle = initialPos.angleTo(targetPos);
          } else {
            // centroid not available - stop camera pan:
            slerpProgress = 1;
          }
        }

        if (slerpProgress >= 1) {
          lastPannedToCountry = selectedCountry;
          slerpProgress = 0;
        } else {
          camera.position.copy(initialPos).applyAxisAngle(normal, endAngle * easeCubic(slerpProgress));
          camera.lookAt(0, 0, 0);

          slerpProgress += delta;
        }
      }
    }
    controls.update();

    if (!$referenceCountry && !selectedCountry && (!mouseIsOver || onHomepage)) {
      controls.autoRotate = true;
    } else {
      controls.autoRotate = false;
    }

    // check if is panning to selected or reference country:
    if ((slerpProgress > 0 && slerpProgress < 1 && selectedCountry !== lastPannedToCountry) || (isMouseMove && !$isMobile)) {
      // ... then don't show SVG countries:
      isMoving = true;
    } else {
      isMoving = false;
    }

    earthMeshes.forEach((mesh, i) => {
      if (mesh) {
        let material = earthMaterials[i];

        if (material.opacity < 1 && i === activeEarthIndex && !isLoadingTextures) {
          material.opacity += delta;
          if (material.opacity > 1) {
            material.opacity = 1;
            isRefreshingGlobeTexture = false;
          }
        }
        if (material.opacity > 0 && i !== activeEarthIndex && !isLoadingTextures) {
          material.opacity -= delta;
          if (material.opacity < 0) {
            material.opacity = 0;
          }
        }
      }
    });

    if (!isInitialTextureLoad) {
      renderer?.render(scene, camera);

      rot = [controls.getAzimuthalAngle(), controls.getPolarAngle()];
    }

    if (isRendering || isRefreshingGlobeTexture) {
      requestAnimationFrame(render);
    }
  }

  async function initGlobe() {
    // Setup scene
    scene = new THREE.Scene();

    // Setup camera
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.0, 100);
    camera.position.x = 0;
    camera.position.z = -1;

    // setup light
    ambLight = new THREE.AmbientLight();
    ambLight.intensity = 0.4;
    scene.add(ambLight);

    light1 = new THREE.DirectionalLight();
    light1.position.set(-5, 8, 5);
    light1.intensity = 0.65;
    light1.color = new THREE.Color(Colors.ColorThemeBgWeaker);
    camera.add(light1);

    light1 = new THREE.DirectionalLight();
    light1.position.set(-5, 0, -5);
    light1.intensity = 0.5;
    // light1.color = new THREE.Color('#FFD492');
    light1.color = new THREE.Color(Colors.ColorThemeBgWeaker);
    camera.add(light1);

    light2 = new THREE.DirectionalLight();
    light2.position.set(5, -5, 5);
    light2.intensity = 0.3;
    light2.color = new THREE.Color('#F5E3C7');
    camera.add(light2);

    // to have lights in scene which have been added to camera:
    scene.add(camera);

    geometry = new THREE.SphereGeometry(1, 32, 32);
    geometry.receiveShadow = true;

    earthMeshes = earthMeshes.map((mesh, i) => {
      // create material:
      let material = new THREE.MeshPhysicalMaterial({
        bumpMap: loader.load(`${variables.pathPrefix}/assets/textures/subtleDry.png`),
        // bumpMap: loader.load(`${variables.pathPrefix}/assets/textures/elevations_smooth.png`),

        gradientMap: loader.load(`${variables.pathPrefix}/assets/textures/fiveTone.jpg`, (t) => {
          t.minFilter = THREE.NearestFilter;
          t.magFilter = THREE.NearestFilter;
          return t;
        })
      });
      //  material.emissive = new THREE.Color(Colors.ColorThemeBgWeaker);
      //  material.emissiveIntensity = 0.1;
      material.color = new THREE.Color(Colors.ColorThemeBgWeaker);
      material.bumpScale = 0.02;

      material.transparent = true;
      material.opacity = 0;

      earthMaterials[i] = material;

      const earthMesh = new THREE.Mesh(geometry, earthMaterials[i]);
      scene.add(earthMesh);

      return earthMesh;
    });

    const emptyMaterial = new THREE.MeshStandardMaterial();
    // emptyMaterial.color = new THREE.Color(Colors.ColorThemeDarkBgWeaker);
    emptyMaterial.color = new THREE.Color(Colors.ColorThemeBgWeaker);

    controls = new OrbitControls(camera, $isMobile ? el : svgEl);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    //controls.minPolarAngle = Math.PI * 0.35;
    //controls.maxPolarAngle = Math.PI * 0.65;
    controls.autoRotateSpeed = 0.7;

    isRendering = true;
    render();
  }

  let mouseIsOver = false;
  let isMouseDown = false;
  let isMouseMove = false;
  let isMoving = false;
  function stopRotation() {
    mouseIsOver = true;
  }
  function resumeRotation(e) {
    mouseIsOver = false;
    lastPannedToCountry = null;
    isMouseDown = false;
  }

  function stopRendering() {
    isRendering = false;
  }
  function resumeRendering() {
    isRendering = true;
    render();
  }

  function deselectCountry(e) {
    if (isMouseMove) {
    } else {
      if ($referenceCountry) {
        selectedCountry = $referenceCountry;
      } else {
        selectedCountry = null;
      }
    }
  }

  onMount(() => {
    initGlobe(el);
  });
  onDestroy(() => {
    isRendering = false;
  });
</script>

<div
  class="globe"
  class:screenshotting={$isScreenshotting}
  use:inview
  on:enter={resumeRendering}
  on:leave={stopRendering}
  {width}
  {height}
  on:mouseover={stopRotation}
  on:mouseleave={resumeRotation}
  on:focus={stopRotation}
  on:pointerdown={() => {
    isMouseDown = true;
  }}
  on:pointermove={() => {
    isMouseMove = isMouseDown;
  }}
  on:pointerup={() => {
    isMouseDown = false;
    isMouseMove = false;
  }}
  style={`width: ${width}px; height: ${height}px; --goal-color: var(--color-un-sdg{$activeGoal.number});`}
  role="img"
  aria-label={globedescription ? globedescription : 'Globe showing data related to SDG ' + $activeGoal.number}
>
  <canvas class="globe-canvas" class:active={!isInitialTextureLoad} bind:this={el} style="top: {0}px;" />
  {#if isInitialTextureLoad}
    <div class="loading-container" style="width: {width}px; height: {height}px">
      <Loading minHeight={false} />
    </div>
  {/if}

  <svg
    class="globe-svg"
    class:on-homepage={onHomepage}
    class:mobile={$isMobile}
    class:active={!isInitialTextureLoad}
    bind:this={svgEl}
    {width}
    {height}
    style="top: {globeOffset}px"
  >
    <circle cx={width / 2} cy={height / 2} r={width / 2} on:click={deselectCountry} on:keydown={deselectCountry} />
    <!--<path {d} class="land-outlines" />-->
    {#if mouseIsOver && !isMoving && !onHomepage}
      {#each countries?.features as c, i}
        <path
          class="country"
          class:enabled={c.properties.ISO_A3}
          d={countryDs[i]}
          on:click={() => {
            selectedCountry = c.properties.ISO_A3;
          }}
          on:keydown={() => (selectedCountry = c.properties.ISO_A3)}
        />
      {/each}
    {/if}
    {#if selectedCountry && selectedCountry !== $referenceCountry}
      <path style="stroke: white; stroke-width: 3px" d={dSel} />
      <path d={dSel} />
    {/if}
    {#if $referenceCountry}
      <path style="stroke: white; stroke-width: 3px" d={dRef} />
      <path class:refOutline={true} d={dRef} />
    {/if}
  </svg>
</div>

<style>
  .globe {
    position: relative;
  }

  .globe-canvas {
    position: absolute;
    border-radius: 100%;
    transition: border 1s ease-in-out, opacity 0.5s ease-in;
    border: 3px solid transparent;
    background-color: var(--color-theme-bg-weaker);
    opacity: 0.1;
  }
  .globe-canvas.active {
    /* border-color: var(--color-theme-text-weaker); */
    border-color: var(--color-vis-filtered-out);
    opacity: 1;
  }
  .loading-container {
    position: absolute;
  }

  .globe.screenshotting .globe-canvas {
    border: 5px solid white;
  }

  .globe-svg {
    position: absolute;
    transition: opacity 0.5s ease-in;
    opacity: 0;
    pointer-events: none;
  }
  .globe-svg.active {
    opacity: 1;
    pointer-events: all;
  }

  path {
    stroke: var(--color-theme-text);
    stroke-width: 1px;
    fill: transparent;
    pointer-events: none;
  }
  circle {
    fill: transparent;
  }

  .refOutline {
    stroke: var(--color-reference-country);
  }

  .country {
    fill: transparent;
    stroke: transparent;
    stroke-width: 0.5px;
    pointer-events: none;
    stroke-width: 0.5px;
  }
  .country.enabled {
    pointer-events: all;
    cursor: pointer;
  }

  .country:hover {
    fill: #ffffff55;
    stroke: var(--color-theme-text);
  }

  svg.on-homepage .country {
    pointer-events: none;
  }
</style>
