<script>
  import CountryPicker from '../general/CountryPicker.svelte';
  import { Number } from '$lib/components';
  import countriesISO from '../../../data/other/wb_countries_iso3.json';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';
  import { referenceCountry } from '$lib/stores/referenceCountry';

  export let more_women_label = 'More than 50% of graduates female';
  export let more_men_label = 'More than 50% of graduates male';

  export let data;

  export let label_eng = 'Engineering, manufacturing and construction';
  export let label_stem = 'Science, Technology, Engineering and Mathematics (STEM)';
  export let label_agr = 'Agriculture, Forestry, Fisheries and Veterinary';
  export let label_ser = 'Services';
  export let label_stats = 'Natural Sciences, Mathematics and Statistics';
  export let label_ss = 'Social Sciences, Journalism and Information';
  export let label_arts = 'Arts and Humanities';
  export let label_edu = 'Education';
  export let label_health = 'Health and welfare';

  const removedDisaggregations = ['Unknown or unspecified fields'];
  const highlightedDisaggregations = [
    'Engineering, manufacturing and construction',
    'Science, Technology, Engineering and Mathematics (STEM)'
  ];
  const disaggregationOrder = [
    'Engineering, manufacturing and construction',
    'Science, Technology, Engineering and Mathematics (STEM)',
    'Agriculture, Forestry, Fisheries and Veterinary',
    'Services',
    'Natural Sciences, Mathematics and Statistics',
    'Social Sciences, Journalism and Information',
    'Arts and Humanities',
    'Education',
    'Health and welfare'
  ];

  const labels = {
    'Engineering, manufacturing and construction': label_eng,
    'Science, Technology, Engineering and Mathematics (STEM)': label_stem,
    'Agriculture, Forestry, Fisheries and Veterinary': label_agr,
    Services: label_ser,
    'Natural Sciences, Mathematics and Statistics': label_stats,
    'Social Sciences, Journalism and Information': label_ss,
    'Arts and Humanities': label_arts,
    Education: label_edu,
    'Health and welfare': label_health
  };

  const exists = (d) => d;

  const femaleAcc = (d) => d?.Value;
  const maleAcc = (d) => 100 - d?.Value;
  const countryAcc = (d) => d?.['Country Code'];
  const yearAcc = (d) => d?.Year;
  const disaggregationAcc = (d) => d?.Disaggregation;

  $: disaggregations = Array.from(new Set(data.map(disaggregationAcc))).filter((d) => !removedDisaggregations.includes(d));
  $: countries = Array.from(new Set(data.map(countryAcc))).filter((iso3) => countriesISO.includes(iso3));

  $: richData = disaggregations.map((agg) => {
    // find the latest data for each country for the given disaggregation:
    const aggData = data.filter((d) => disaggregationAcc(d) === agg);
    let countryData = countries
      .map((iso3) => aggData.filter((d) => countryAcc(d) === iso3).sort((a, b) => yearAcc(b) - yearAcc(a))[0])
      .filter(exists)
      .sort((a, b) => femaleAcc(b) - femaleAcc(a));
    countryData.agg = agg;

    return countryData;
  });

  /*
  $: exportData = [
    'iso' + disaggregations.reduce((a, v) => a + ';' + v, ''),
    ...countries.map((iso) => {
      let resu = iso + ';';
      disaggregations.forEach((dis, i) => {
        let countryData = femaleAcc(richData[i].find((d) => countryAcc(d) === iso));
        resu += (countryData ? countryData : '') + (i < disaggregations.length - 1 ? ';' : '');
      });
      return resu;
    })
  ];
  $: console.log(exportData);
*/
  let selectedCountry = $referenceCountry ? $referenceCountry : null;
  function updateHover(e, agg) {
    const aggData = richData.find((d) => d.agg === agg);
    const mousePos = {
      x: e.offsetX,
      y: e.offsetY
    };
    const bbox = e?.target.getBoundingClientRect();
    let ratio = Math.min(1, Math.max(0, mousePos.x / bbox.width));

    selectedCountry = countryAcc(aggData[Math.floor(ratio * aggData.length)]);
  }
</script>

<CountryPicker bind:selectedCountry top />
<CategoricalLegend
  legendType="custom"
  customItems={[
    { key: more_women_label, colour: 'var(--color-vis-gender-female)' },
    { key: more_men_label, colour: 'var(--color-vis-gender-male)' }
  ]}
  top
/>
<div class="tertiary-institutions">
  {#each disaggregationOrder as agg}
    <div class="disaggregation">
      <div class:highlight={highlightedDisaggregations.includes(agg)}>
        <div
          class="agg-box"
          on:mousemove={(e) => updateHover(e, agg)}
          on:mouseover={(e) => updateHover(e, agg)}
          on:focus={(e) => updateHover(e, agg)}
          on:mouseout={() => (selectedCountry = null)}
          on:blur={(e) => (selectedCountry = null)}
        >
          {#each richData.filter((d) => d.agg === agg) as countries}
            {#each countries as d}
              <div
                class="agg-val"
                class:fainty={selectedCountry}
                class:reference={$referenceCountry === countryAcc(d)}
                class:hover={selectedCountry === countryAcc(d)}
              >
                {#if maleAcc(d) <= 50}
                  <div class="male faint" style:height={maleAcc(d) + '%'} />
                  <div class="female" style:height={femaleAcc(d) - 50 + '%'} />
                  <div class="female faint dominant" style:height={'50%'} />
                {:else}
                  <div class="male faint dominant" style:height={'50%'} />
                  <div class="male" style:height={maleAcc(d) - 50 + '%'} />
                  <div class="female faint" style:height={femaleAcc(d) + '%'} />
                {/if}
                {#if selectedCountry === countryAcc(d)}
                  <p class="label small number overlap" style:top={maleAcc(d) < 50 ? '40%' : '50%'}>
                    <Number value={maleAcc(d) < 50 ? femaleAcc(d) : maleAcc(d)} unit="%" digits="2" />
                  </p>
                {/if}
              </div>
            {/each}
          {/each}
          {#if selectedCountry}
            <div class="sep-50" />
          {/if}
        </div>
      </div>
      <p class="label small" style:text-align="center">{labels[agg]}</p>
    </div>
  {/each}
</div>

<style>
  .tertiary-institutions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-s);
  }

  .disaggregation {
    width: 280px;

    display: flex;
    flex-direction: column;
  }
  .highlight {
    border: 2px solid var(--color-theme-text);
  }
  .agg-box {
    position: relative;

    width: 100%;
    height: 200px;

    display: flex;
    flex-direction: row;
    align-items: stretch;
  }

  .agg-box * {
    pointer-events: none;
  }

  .agg-val {
    flex: 1;

    display: flex;
    flex-direction: column;
  }
  .agg-val.reference {
    flex-basis: 5px;
    border: 1px solid var(--color-reference-country);
  }
  .agg-val.hover {
    flex-basis: 45px;
  }

  .agg-val > div.faint {
    opacity: 0.1;
  }
  .agg-val.fainty:not(.hover) > div:not(.faint) {
    opacity: 0.5;
  }

  .agg-val.hover > div.faint.dominant {
    opacity: 1;
  }
  .agg-val > div.male {
    background-color: var(--color-vis-gender-male);
  }
  .agg-val > div.female {
    background-color: var(--color-vis-gender-female);
  }

  p.overlap {
    pointer-events: none;
    position: absolute;
    text-align: right;
  }

  .sep-50 {
    pointer-events: none;
    position: absolute;
    top: 50%;
    width: 100%;
    height: 2px;
    background-color: white;
  }
</style>
