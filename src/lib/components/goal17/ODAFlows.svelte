<script>
  import { chordDirected, arc, ribbonArrow, ascending, extent, max, scaleLinear } from 'd3';
  import { _ } from 'svelte-i18n';
  import Tooltip from '../general/Tooltip.svelte';
  import Number from '../general/Number.svelte';
  import { getRegion, getIncomeLevel, regionDefaultSortOrder } from '../../../data/countryRegionIncomeDictionary';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import CountryPicker from '../general/CountryPicker.svelte';
  import ODACountryRanking from './ODACountryRanking.svelte';
  import { isMobile } from '$lib/stores/isMobile';

  export let data = [];
  export let label_units = 'million USD';
  export let label_provided = 'providers';
  export let label_received = 'receivers';

  export let parentWidth;

  let clientWidth;
  $: clientHeight = Math.min(900, clientWidth * 0.8);

  const outerRingWidth = 20;
  $: radius = clientWidth * ($isMobile ? 0.31 : 0.35);

  const myExtent = (d, a) => (d ? extent(d, a) : [0, 0]);

  const RECIPROCAL = {
    iso3_donor: 'iso3_recipient',
    iso3_recipient: 'iso3_donor'
  };
  const typeLabels = {
    iso3_donor: label_received,
    iso3_recipient: label_provided
  };

  const yearAccessor = (d) => d.year;
  $: years = myExtent(data, (d) => yearAccessor(d));

  $: currentData = data
    ? data
        ?.filter((d) => yearAccessor(d) === years[1])
        ?.map((d) => ({
          ...d,
          regionDonor: getRegion(d.iso3_donor),
          regionRecipient: getRegion(d.iso3_recipient),
          incomeDonor: getIncomeLevel(d.iso3_donor),
          incomeRecipient: getIncomeLevel(d.iso3_recipient)
        }))
    : [];

  $: donorCountries = Array.from(new Set(currentData?.map((d) => d.iso3_donor)));
  $: donations = donorCountries.map((iso) => ({
    iso,
    value: currentData.filter((d) => d.iso3_donor === iso).reduce((a, v) => a + v.value, 0)
  }));

  $: recipientCountries = Array.from(new Set(currentData.map((d) => d.iso3_recipient)));
  $: received = recipientCountries.map((iso) => ({
    iso,
    value: currentData.filter((d) => d.iso3_recipient === iso).reduce((a, v) => a + v, 0)
  }));

  let selectedCountry = null;
  $: selectedCountryRegion = getRegion(selectedCountry);
  $: activelySelectedCountryData = currentData.filter((d) => d.iso3_donor === selectedCountry || d.iso3_recipient === selectedCountry);
  $: selectedCountryTypes = ['iso3_donor', 'iso3_recipient']; /*.filter(
    (t) => (!selectedCountry && t === 'iso3_donor') || selectedCountryData.some((d) => d[t] === selectedCountry)
  );*/

  $: selectedCountryData = ['iso3_donor', 'iso3_recipient'].reduce((acc, typ) => {
    const source = geos[currentRibbonData?.source.index];
    const target = geos[currentRibbonData?.target.index];

    let filteredData = [];
    // no country selected
    if (typ === 'iso3_donor') {
      filteredData = currentData
        .filter(
          (d) =>
            d.regionDonor === source &&
            d.regionRecipient === target &&
            d.iso3_donor !== selectedCountry &&
            d.iso3_recipient !== selectedCountry
        )
        .map((d) => ({ ...d, iso3: d.iso3_recipient, region: d.regionRecipient }));
    } else if (typ === 'iso3_recipient') {
      filteredData = currentData
        .filter(
          (d) =>
            d.regionDonor === source &&
            d.regionRecipient === target &&
            d.iso3_donor !== selectedCountry &&
            d.iso3_recipient !== selectedCountry
        )
        .map((d) => ({ ...d, iso3: d.iso3_donor, region: d.regionDonor }));
    }

    if (selectedCountry && source && target) {
      if (source === selectedCountry /* && typ === 'iso3_donor'*/) {
        // donations from selectedCountry to target region
        filteredData = activelySelectedCountryData
          .filter((d) => d.regionRecipient === target.split('_')[0])
          .map((d) => ({ ...d, iso3: d.iso3_recipient, region: d.regionRecipient }));
      } else if (target === selectedCountry /* && typ === 'iso3_recipient'*/) {
        // donations to selectedCountry from source region
        filteredData = activelySelectedCountryData
          .filter((d) => d.regionDonor === source.split('_')[0])
          .map((d) => ({ ...d, iso3: d.iso3_donor, region: d.regionDonor }));
      }
    } else if (selectedCountry) {
      if (typ === 'iso3_donor') {
        filteredData = activelySelectedCountryData.map((d) => ({ ...d, iso3: d.iso3_recipient, region: d.regionRecipient }));
      } else if (typ === 'iso3_recipient') {
        // donations to selectedCountry from source region
        filteredData = activelySelectedCountryData.map((d) => ({ ...d, iso3: d.iso3_donor, region: d.regionDonor }));
      }
    }

    // summarize contributions from- or to a single country (one country might appear multiple times
    // in the data since we're filtering for regions)
    let summarizedData = [];
    if (filteredData.length > 0) {
      if (typ === 'iso3_donor') {
        // find all receiving countries:
        const receivingCountries = Array.from(new Set(filteredData.map((d) => d.iso3_recipient)));
        const receivingRegions = receivingCountries.reduce((acc, iso3) => {
          acc[iso3] = filteredData.find((d) => d.iso3_recipient === iso3).regionRecipient;
          return acc;
        }, {});
        summarizedData = receivingCountries.map((iso) => ({
          iso3_recipient: iso,
          iso3: iso,
          region: receivingRegions[iso],
          value: filteredData.filter((d) => d.iso3_recipient === iso).reduce((acc, val) => acc + val.value, 0)
        }));
      } else if (typ === 'iso3_recipient') {
        const donatingCountries = Array.from(new Set(filteredData.map((d) => d.iso3_donor)));
        const donatingRegions = donatingCountries.reduce((acc, iso3) => {
          acc[iso3] = filteredData.find((d) => d.iso3_donor === iso3).regionDonor;
          return acc;
        }, {});
        summarizedData = donatingCountries.map((iso) => ({
          iso3_donor: iso,
          iso3: iso,
          region: donatingRegions[iso],
          value: filteredData.filter((d) => d.iso3_donor === iso).reduce((acc, val) => acc + val.value, 0)
        }));
      }
    }

    acc[typ] = summarizedData.sort((a, b) => b.value - a.value);

    return acc;
  }, {});

  $: regions = [
    ...regionDefaultSortOrder
      .filter((d) => d !== 'WLD')
      .reduce((a, v) => {
        if (selectedCountry) {
          if (v === selectedCountryRegion) {
            a.push(v, selectedCountry);
          } else {
            a.push(v, v + '_' + selectedCountry);
          }
        } else {
          a.push(v);
        }
        return a;
      }, [])
  ];

  const colorMap = (region) => {
    if (region.indexOf('_') !== -1) {
      const actualRegion = region.split('_')[0];
      return `var(--color-vis-region-${actualRegion})`;
    } else {
      return `var(--color-vis-region-${region})`;
    }
  };

  $: matrixData = regions.map((donor, i) => {
    const rowData = new Array(regions.length).fill(0);

    if (selectedCountry) {
      if (donor === selectedCountry) {
        for (let j = 0; j < regions.length; j++) {
          const recipient = regions[j];
          let filter;
          if (recipient === selectedCountry) {
            // donations from selected country to itself - in case that ever happens...
            filter = (d) => d.iso3_donor === selectedCountry && d.iso3_recipient === selectedCountry;
          } else if (recipient === selectedCountryRegion) {
            // donations from selected country to other countries in its region
            filter = (d) =>
              d.iso3_donor === selectedCountry && d.regionRecipient === selectedCountryRegion && d.iso3_recipient !== selectedCountry;
          } else if (recipient.indexOf('_') !== -1) {
            // donations from selected country to other region
            filter = (d) => d.iso3_donor === selectedCountry && d.regionRecipient === recipient.split('_')[0];
          } else {
            // donations from selected country to region slice reserved for donations from other countries in the selected country's region
            // => should be 0
            filter = (d) => false;
          }

          currentData.filter(filter).forEach((v) => (rowData[j] += Math.abs(v.value)));
        }
      } else if (donor === selectedCountryRegion) {
        for (let j = 0; j < regions.length; j++) {
          const recipient = regions[j];
          let filter;
          if (recipient === selectedCountry) {
            // donations from selected country's region to it
            filter = (d) => d.regionDonor === selectedCountryRegion && d.iso3_recipient === selectedCountry;
          } else if (recipient === selectedCountryRegion) {
            // donations from selected country's region to itself (including from selected country, but not TO it)
            filter = (d) =>
              d.regionDonor === selectedCountryRegion &&
              d.iso3_recipient !== selectedCountry &&
              d.regionRecipient === selectedCountryRegion;
          } else if (recipient.indexOf('_') !== -1) {
            // donations from selected country's region to selected country donation slot in other region
            // => should be 0
            filter = (d) => false;
          } else {
            // donations from selected country's region to region slice reserved for donations from non-selected countries
            filter = (d) => d.regionDonor === selectedCountryRegion && d.iso3_donor !== selectedCountry && d.regionRecipient === recipient;
          }

          currentData.filter(filter).forEach((v) => (rowData[j] += Math.abs(v.value)));
        }
      } else if (donor.indexOf('_') !== -1) {
        // donor providing donations to selected country
        for (let j = 0; j < regions.length; j++) {
          const recipient = regions[j];
          if (recipient === selectedCountry) {
            currentData
              .filter((d) => d.regionDonor === donor.split('_')[0] && d.iso3_recipient === selectedCountry)
              .forEach((v) => (rowData[j] += Math.abs(v.value)));
          }
        }
      } else {
        // donor providing donations to non-selected countries
        for (let j = 0; j < regions.length; j++) {
          const recipient = regions[j];
          let filter;
          if (recipient === selectedCountry) {
            // should be 0
            filter = (d) => false;
          } else if (recipient === selectedCountryRegion) {
            // donations to other countries from selected country's region
            filter = (d) => d.regionDonor === donor && d.regionRecipient === recipient && d.iso3_recipient !== selectedCountry;
          } else if (recipient.indexOf('_') !== -1) {
            // donations to other regions' selected country slot
            // => should be 0
            filter = (d) => false;
          } else {
            filter = (d) => d.regionDonor === donor && d.regionRecipient === recipient;
          }
          currentData.filter(filter).forEach((v) => (rowData[j] += Math.abs(v.value)));
        }
      }
    } else {
      // no country selected - just sum up all contributions of given donor to all regions
      for (let j = 0; j < regions.length; j++) {
        const recipient = regions[j];
        currentData
          .filter((d) => d.regionDonor === donor && d.regionRecipient === recipient)
          .forEach((v) => {
            rowData[j] += v.value;
          });
      }
    }

    return rowData;
  });

  $: sidebarScale = scaleLinear().domain([0, 1000000 /* max(selectedCountryData?.map((d) => d.value)) */]).range([0, 100]);

  $: geos = regions;

  $: odaChord = matrixData
    ? chordDirected()
        .padAngle(0)
        .sortSubgroups(ascending)(matrixData)
        .sort((a, b) => {
          return a.source.value - b.source.value;
        })
    : [];

  let currentCountryData;
  let currentRibbonData;

  let sidebarEl;
  $: sidebarElBB = sidebarEl?.getBoundingClientRect();

  let mousePos;
  function updateMouse(evt) {
    if (sidebarEl) {
      mousePos = { x: sidebarElBB.x, y: 0 };
    }
  }
</script>

<CountryPicker bind:selectedCountry clear={() => (selectedCountry = null)} />

{#if odaChord.length > 0 && parentWidth}
  <div class="side-by-side-container" style:flex-wrap={$isMobile ? 'wrap' : 'nowrap'}>
    <div class="svg-container" bind:clientWidth>
      <svg width={clientWidth} height={clientHeight} on:mousemove={updateMouse}>
        <g transform={`translate(${clientWidth / 2}, ${radius + outerRingWidth})`}>
          {#each odaChord.sort( (a, b) => (geos[a.source.index] === selectedCountry ? 1 : -1) ) as chord (chord.source.index + '-' + chord.target.index)}
            <path
              class="ribbon"
              class:unselected={selectedCountry &&
                geos[chord.source.index] !== selectedCountry &&
                geos[chord.source.index].indexOf('_') === -1}
              d={ribbonArrow().radius(radius)(chord)}
              style={`--ribbon-color: ${
                geos[chord.source.index] === selectedCountry
                  ? colorMap(geos[chord.target.index].split('_')[0])
                  : colorMap(geos[chord.source.index].split('_')[0])
              }`}
              opacity={(currentCountryData &&
                (currentCountryData.index == chord.target.index || currentCountryData.index == chord.source.index)) ||
              geos[chord.source.index] === selectedCountry ||
              geos[chord.target.index] === selectedCountry
                ? 0.8
                : !currentCountryData
                ? 0.5
                : 0.1}
              on:mouseover={() => (currentRibbonData = chord)}
              on:mouseout={() => (currentRibbonData = null)}
              on:focus={() => (currentRibbonData = chord)}
              on:keydown={() => (currentRibbonData = chord)}
            />
          {/each}
          <!-- arcs -->
          {#each odaChord.groups as group (group.index)}
            <path
              class="arc"
              class:unselected={selectedCountry && geos[group.index] !== selectedCountry && geos[group.index].indexOf('_') === -1}
              d={arc()
                .innerRadius(radius)
                .outerRadius(radius + outerRingWidth)(group)}
              fill={geos[group.index] === selectedCountry ? colorMap(selectedCountryRegion) : colorMap(geos[group.index])}
              stroke={'white'}
              stroke-width={1}
              on:mouseover={() => (currentCountryData = group)}
              on:mouseout={() => (currentCountryData = null)}
              on:focus={() => (currentCountryData = group)}
              on:keydown={() => (currentCountryData = group)}
            />
          {/each}

          {#if currentCountryData}
            <path
              class="arc-outline"
              d={arc()
                .innerRadius(radius)
                .outerRadius(radius + outerRingWidth)(currentCountryData)}
              fill={'none'}
              stroke={'black'}
              stroke-width={2}
            />
          {/if}
          {#if currentRibbonData}
            <path
              class="ribbon-outline"
              d={ribbonArrow().radius(radius)(currentRibbonData)}
              stroke={'black'}
              stroke-width={2}
              fill={geos[currentRibbonData.source.index] === selectedCountry
                ? colorMap(geos[currentRibbonData.target.index].split('_')[0])
                : colorMap(geos[currentRibbonData.source.index])}
            />
          {/if}

          <!-- labels -->
          {#each odaChord.groups.filter((d) => geos[d.index].indexOf('_') === -1) as group}
            {#if $_(`country.${geos[group.index].split('_')[0].toLowerCase()}`).includes('&')}
              <text
                class="label small"
                x={arc()
                  .innerRadius(radius)
                  .outerRadius(radius + outerRingWidth)
                  .centroid(group)[0]}
                y={arc()
                  .innerRadius(radius)
                  .outerRadius(radius + outerRingWidth)
                  .centroid(group)[1] + 4}
                text-anchor={'middle'}
              >
                <tspan
                  x={arc()
                    .innerRadius(radius)
                    .outerRadius(radius + outerRingWidth)
                    .centroid(group)[0]}
                  class="label small"
                >
                  {$_(`country.${geos[group.index].split('_')[0].toLowerCase()}`).split('&')[0]}&amp;
                </tspan><tspan
                  dy={16}
                  x={arc()
                    .innerRadius(radius)
                    .outerRadius(radius + outerRingWidth)
                    .centroid(group)[0]}
                  class="label small">{$_(`country.${geos[group.index].split('_')[0].toLowerCase()}`).split('&')[1]}</tspan
                >
              </text>
            {:else}
              <text
                class="label small"
                x={arc()
                  .innerRadius(radius)
                  .outerRadius(radius + outerRingWidth)
                  .centroid(group)[0]}
                y={arc()
                  .innerRadius(radius)
                  .outerRadius(radius + outerRingWidth)
                  .centroid(group)[1] + 4}
                text-anchor={'middle'}>{$_(`country.${geos[group.index].split('_')[0].toLowerCase()}`)}</text
              >
            {/if}
          {/each}
        </g>
      </svg>
    </div>

    <div class="sidebar" bind:this={sidebarEl}>
      {#if currentCountryData && mousePos}
        <p class="label stronger centered">
          Total ODA ↑↓ {selectedCountry &&
          geos[currentCountryData.index] !== selectedCountryRegion &&
          geos[currentCountryData.index] !== selectedCountry
            ? geos[currentCountryData.index].indexOf('_') === -1
              ? `(without ${$_('country.' + selectedCountry.toLowerCase())})`
              : `(${$_('country.' + selectedCountry.toLowerCase())} only)`
            : ''}
        </p>
        <p class="label stronger centered" style="margin-bottom:var(--space-s)">
          {geos[currentCountryData.index] === selectedCountryRegion
            ? `${$_('country.' + selectedCountryRegion.toLowerCase())} (without ${$_('country.' + selectedCountry.toLowerCase())})`
            : $_(`country.${geos[currentCountryData.index].split('_')[0].toLowerCase()}`)}
        </p>
        <p class="label centered"><Number value={currentCountryData.value} digits={0} /> {label_units}</p>
      {:else if currentRibbonData && mousePos}
        <p class="label ribbon stronger">
          <span class="caps"
            >{geos[currentRibbonData.source.index] === selectedCountryRegion
              ? `${$_('country.' + selectedCountryRegion.toLowerCase())} (without ${$_('country.' + selectedCountry.toLowerCase())})`
              : $_(`country.${geos[currentRibbonData.source.index].split('_')[0].toLowerCase()}`)}</span
          >
          <br /><span style="display: inline-block; text-align: center; width: 100%">↓</span><br />
          <span class="caps">{$_(`country.${geos[currentRibbonData.target.index].split('_')[0].toLowerCase()}`)}</span>
        </p>
        <p class="label centered"><Number value={currentRibbonData.source.value} digits={0} /> {label_units}</p>

        <hr />

        <ODACountryRanking {selectedCountry} {selectedCountryTypes} {selectedCountryData} {label_units} {typeLabels} />
      {:else if selectedCountry}
        <p class="label stronger centered">Total ODA ↑↓ {$_(`country.${selectedCountry.toLowerCase()}`)}</p>
        <hr />
        <ODACountryRanking {selectedCountry} {selectedCountryTypes} {selectedCountryData} {label_units} {typeLabels} />
      {/if}
    </div>
  </div>
  <CategoricalLegend legendType="regions" />
{/if}

<style>
  .side-by-side-container {
    display: flex;
    width: 100%;
  }

  .svg-container {
    flex: 1;
  }

  .sidebar {
    flex: 0 0 300px;
  }

  .ribbon {
    transition: opacity 0.25s;
    stroke: var(--ribbon-color);
    stroke-width: 1px;
    fill: var(--ribbon-color);
  }
  .ribbon.unselected {
    fill: var(--color-vis-filtered-out);
    stroke: none;
  }

  .arc.unselected {
    opacity: 0.25;
  }

  text.label,
  .arc-outline,
  .ribbon-outline {
    pointer-events: none;
  }

  p.ribbon span {
    width: 100%;
    display: inline-block;
    text-align: center;
  }
  p.ribbon {
    margin-bottom: var(--space-s);
    line-height: 100%;
  }
</style>
