<script>
    import variables from '$lib/variables.js';
  
    import { activeGoal } from '$lib/stores/activeGoal';
    import { onMount, onDestroy } from 'svelte';
    import * as THREE from 'three';
    import { OrbitControls } from '$lib/external/three.js/OrbitControls.js';
    import * as Colors from '$lib/styles/tokens.es6.js';
    import { referenceCountry } from '$lib/stores/referenceCountry';
  
    import { geoPath, geoOrthographic, easeCubic } from 'd3';
    import * as topojson from 'topojson-client';
    import landJSON from '../../../data/other/wb_land_topo.json';
    import countriesJSON from '../../../data/other/wb_countries_topo.json';
    import centroidsJSON from '../../../data/other/country_centroids.json';
  
    export let width = 0;
    export let height = 0;
    export let textureUrl;
    export let activeScene;
  
    export let selectedCountry;
  
    let rot = 0;
  
    // d3.projection zone:
    let svgEl;
  
    let countries = topojson.feature(countriesJSON, countriesJSON.objects.wb_countries);
    let land = topojson.feature(landJSON, landJSON.objects.wb_land);
    let centroids = centroidsJSON.features;
  
    let d, dRef;
  
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
    let centroid = [0, 0];
    let ref;
  
    let rotaScale = (r) => rad2deg(Math.PI / 2 - r);
  
    $: {
      projection.rotate([rotaScale(rot[0]), -rotaScale(rot[1])]);
       d = path(land);
      if (!isDragging) {
        countryDs = countries?.features.map((c, i) => path(c));
      }
  
      if (selectedCountry) {
        ref = countries.features.find((d) => d.properties.ISO_A3 === selectedCountry);
        dRef = path(ref);
        centroid = centroids.find((d) => d.properties.iso_3c === selectedCountry);
        if (!centroid) {
          centroid = path.centroid(ref);
        }
      }
    }
  
    // three.js zone:
    let el;
  
    let renderer, geometry, fallbackMesh, scene, camera, material, baseMap, ambLight, light1, light2;
    let controls;
  
    // provide two meshes/materials so we can blend between them when loading new textures:
    let earthMeshes = [null, null];
    let earthMaterials = [null, null];
  
    let activeEarthIndex = 0;
  
    const loadingManager = new THREE.LoadingManager();
    let loader = new THREE.TextureLoader(loadingManager);
  
    loadingManager.onStart = () => {
      isLoadingTextures = true;
      activeEarthIndex = activeEarthIndex ? 0 : 1;
    };
    loadingManager.onLoad = () => {
      isLoadingTextures = false;
      isInitialTextureLoad = false;
    };
  
    $: {
      if (el && width && height) {
        if (!renderer) {
          renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el });
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.setClearColor(new THREE.Color(Colors.ColorThemeDarkBg));
          // renderer.shadowMap.enabled = true;
          // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        renderer.setSize(width, height);
      }
    }
  
    $: if ($activeGoal) {
      loader?.load(
        `${variables.pathPrefix}/${textureUrl}`,
        (t) => {
          t.anisotropy = renderer?.capabilities?.getMaxAnisotropy();
          t.generateMipmaps = false;
  
          earthMaterials[activeEarthIndex].map = t;
        },
        undefined,
        (err) => {
          // fall back to base:
          earthMaterials[activeEarthIndex].map = baseMap;
        }
      );
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
    let isLoadingTextures = true;
    let isInitialTextureLoad = true;
    let lastPannedToCountry = null;
    let slerpProgress = 0;
    let initialPos;
    let endAngle;
    let normal;
  
    function render() {
      // show a non-textured sphere until textures are available:
      if (isInitialTextureLoad) {
        fallbackMesh.visible = true;
      } else {
        fallbackMesh.visible = false;
      }
  
      if (controls && camera) {
        if (selectedCountry !== lastPannedToCountry) {
          // start panning...
          if (slerpProgress === 0) {
            const targetPos = new THREE.Vector3(1, 0, 0);
            const c = centroids.find((d) => d.properties.iso_3c === selectedCountry)?.geometry?.coordinates;
            if (c) {
              targetPos.applyEuler(new THREE.Euler((c[0] < 0 ? -1 : 1) * deg2rad(c[1]), deg2rad(c[0]), 0));
  
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
  
            slerpProgress += 0.025;
          }
        }
      }
      controls.update();
  
      earthMeshes.forEach((mesh, i) => {
        if (mesh) {
          let material = earthMaterials[i];
  
          if (material.opacity < 1 && i === activeEarthIndex && !isLoadingTextures) {
            material.opacity += 0.02;
            if (material.opacity > 1) {
              material.opacity = 1;
            }
          }
          if (material.opacity > 0 && i !== activeEarthIndex && !isLoadingTextures) {
            material.opacity -= 0.02;
            if (material.opacity < 0) {
              material.opacity = 0;
            }
          }
        }
      });
  
      renderer?.render(scene, camera);
  
      rot = [controls.getAzimuthalAngle(), controls.getPolarAngle()];
  
      if (isRendering) {
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
      light1.position.set(-10, 15, 10);
      light1.intensity = 0.6;
      light1.color = new THREE.Color('white');
      camera.add(light1);
  
      light2 = new THREE.DirectionalLight();
      light2.position.set(1, -10, 20);
      light2.intensity = 0.4;
      light2.color = new THREE.Color(Colors.ColorBasePurple200);
      camera.add(light2);
  
      // to have lights in scene which have been added to camera:
      scene.add(camera);
  
      baseMap = loader.load(`${variables.pathPrefix}/assets/textures/baseMap.png`);
  
      geometry = new THREE.SphereGeometry(1, 32, 32);
      geometry.receiveShadow = true;
  
      earthMeshes = earthMeshes.map((mesh, i) => {
        // create material:
        let material = new THREE.MeshLambertMaterial({
          map: baseMap,
  
          bumpMap: loader.load(`${variables.pathPrefix}/assets/textures/earthbump2k.jpg`),
          // bumpMap: loader.load(`${variables.pathPrefix}/assets/textures/elevations_smooth.png`),
  
          gradientMap: loader.load(`${variables.pathPrefix}/assets/textures/fiveTone.jpg`, (t) => {
            t.minFilter = THREE.NearestFilter;
            t.magFilter = THREE.NearestFilter;
            return t;
          }),
          emissiveMap: loader.load(`${variables.pathPrefix}/assets/textures/specMap.jpg`)
        });
  
        material.color = new THREE.Color(Colors.ColorThemeBgWeaker);
        material.bumpScale = 0.025;
  
        material.emissiveIntensity = 0.2;
        material.emissive = new THREE.Color(Colors.ColorThemeDarkBgWeaker);
  
        material.transparent = true;
        material.opacity = 0;
  
        earthMaterials[i] = material;
  
        const earthMesh = new THREE.Mesh(geometry, earthMaterials[i]);
        scene.add(earthMesh);
  
        return earthMesh;
      });
  
      const emptyMaterial = new THREE.MeshStandardMaterial();
      emptyMaterial.color = new THREE.Color(Colors.ColorThemeDarkBgWeaker);
      fallbackMesh = new THREE.Mesh(geometry, emptyMaterial);
  
      scene.add(fallbackMesh);
  
      controls = new OrbitControls(camera, svgEl);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      //controls.minPolarAngle = Math.PI * 0.35;
      //controls.maxPolarAngle = Math.PI * 0.65;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 2;
  
      isRendering = true;
      render();
    }
  
    let mouseIsOver = false;
    let isDragging = false;
    function stopRotation() {
      controls.autoRotate = false;
      mouseIsOver = true;
    }
    function resumeRotation(e) {
      controls.autoRotate = true;
      mouseIsOver = false;
    }
    function startDragging() {
      isDragging = true;
    }
    function stopDragging() {
      isDragging = false;
    }
  
    onMount(() => {
      initGlobe(el);
    });
    onDestroy(() => {
      isRendering = false;
    });

    $: if(activeScene.id == 'temperate' && camera){
      //TODO: pan camera to temperate/boreal regions
      //camera.position.set(0.5, 1, 1)
      //controls.update();
    }
  </script>
  
  <div
    class="globe"
    {width}
    {height}
    on:mouseover={stopRotation}
    on:mouseleave={resumeRotation}
    on:dragstart={startDragging}
    on:dragend={stopDragging}
    style={`width: ${width}px; height: ${height}px`}
  >
    <canvas class="globe-canvas" bind:this={el} style="--goal-color: var(--color-un-sdg{$activeGoal.number}); top: {0}px;" />
  
    <svg class="globe-svg" bind:this={svgEl} {width} {height} style="top: {globeOffset}px">
      <path {d} class="land-outlines" />
      {#if true}
        {#each countries?.features as c, i}
          <path class="country" d={countryDs[i]} on:click={() => (selectedCountry = c.properties.ISO_A3)} />
        {/each}
      {/if}
      {#if selectedCountry}
        <path style="stroke: white; stroke-width: 3px" d={dRef} />
        <path class={selectedCountry === $referenceCountry ? 'refOutline' : ''} d={dRef} />
      {/if}
    </svg>
  </div>
  
  <style>
    .globe {
      position: relative;
    }
  
    .globe-canvas {
      position: absolute;
  
      border: 5px solid var(--color-theme-bg);
      /*box-shadow: 0px 0px 24px 24px var(--color-base-dark-purple700);*/
      border-radius: 100%;
    }
  
    .globe-svg {
      position: absolute;
    }
  
    path,
    circle {
      stroke: var(--color-theme-text);
      stroke-width: 1px;
      fill: transparent;
    }
  
    .refOutline {
      stroke: var(--color-reference-country);
    }
  
    .land-outlines {
      stroke-width: 0px;
      stroke: var(--color-theme-text-weaker);
    }
  
    line {
      stroke-width: 2px;
      stroke: var(--color-reference-country);
    }
    .country {
      fill: transparent;
      stroke: transparent;
      stroke-width: 0.5px;
      cursor: pointer;
      pointer-events: all;
    }
  
    .country:hover {
      fill: #ffffff55;
      stroke: var(--color-theme-text);
    }
  </style>
  