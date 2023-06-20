<script>
  import { referenceCountry } from '$lib/stores/referenceCountry';
  import { _ } from 'svelte-i18n';
  import { Number, Tooltip } from '$lib/components';
  import { min, scaleLinear } from 'd3';

  import TimeSlider from './TimeSlider.svelte';

  export let data;

  const exists = (d) => d;

  let currentYear = 2021;

  $: years = [1992, 2021];

  let yearAccessor = (d) => d?.year;
  const ACC_ABS_ATTRIBUTE = 'viz_oda_usdmn';
  let acc = (d) => d?.[ACC_ABS_ATTRIBUTE];
  let refugeeAcc = (d) => d?.viz_odamn_refugees;

  $: countries = data ? Array.from(new Set(data.map((d) => d.iso3))).filter((d, i) => d !== 'DAC' && exists(d)) : [];

  let barScale = scaleLinear().domain([0, 1]).range([0, 100]);

  $: enrichedData = data
    .filter((d) => yearAccessor(d) === currentYear)
    .filter((d) => countries.includes(d.iso3))
    .filter((d) => refugeeAcc(d) > 0)
    .map((d) => ({ iso3: d.iso3, ratio: refugeeAcc(d) / acc(d) }))
    .sort((a, b) => b.ratio - a.ratio);
</script>

<div class="oda-refugee">
  <TimeSlider enabled={true} {years} bind:currentYear />

  {#each enrichedData as country (country?.iso3)}
    <div class="full-bar" class:reference={country?.iso3 === $referenceCountry}>
      <p class="label small country-values">
        <span class="country">{$_(`country.${country?.iso3.toLowerCase()}`)}</span><span class="number small"
          ><Number value={country.ratio * 100} unit="%" digits="1" />
        </span>
      </p>
      <div class="bar-container">
        <div class="bar" style:width={'100%'} />
        <div class="bar refugee" style:width={barScale(country.ratio) + '%'} />
      </div>
    </div>
  {/each}
</div>

<style>
  .oda-refugee {
    position: relative;
    height: 100%;
  }

  .full-bar {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .full-bar p {
    flex-basis: 200px;
    white-space: nowrap;
  }
  .full-bar p span {
    display: inline-block;
  }
  .full-bar p .country {
    width: 100px;
  }
  .full-bar p .number {
    width: 100px;
    text-align: right;
    margin-right: var(--space-s);
  }

  .bar-container {
    width: 100%;
    flex: 1;
    position: relative;
  }

  .bar {
    position: absolute;
    z-index: 2;
    height: 16px;
    margin-top: 2px;
    margin-right: 0px;
    transition: 0.5s all;
  }

  .bar {
    background-color: var(--color-base-blue400);
    opacity: 0.5;
  }

  .bar.refugee {
    background-color: var(--color-vis-cat8-1);
    opacity: 1;
  }
</style>
