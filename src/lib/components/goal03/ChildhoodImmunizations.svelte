<script>
  import VaxLine from './VaxLine.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';
  import MultipleCell from '../general/MultipleCell.svelte';
  import MultiplesContainer from '../general/MultiplesContainer.svelte';

  export let data;

  export let vax_label_1;
  export let vax_label_2;
  export let vax_label_3;

  const vaxTypes = [
    'Immunization, measles (% of children 12-23 months)',
    'Immunization, HepB3 (% of one-year-old children)',
    'Immunization, DPT (% of children 12-23 months)'
  ];

  const vaxLabels = [vax_label_1, vax_label_2, vax_label_3];
  const vaxColors = [Colors.ColorVisBlue, Colors.ColorVisOrange, Colors.ColorVisTeal];

  let richData = {};
  $: if (data) {
    richData = vaxTypes.reduce((acc, vaxType) => {
      acc[vaxType] = data.map((d) => ({ year: d.Time, value: d[vaxType] })).filter((d) => d.value !== undefined && d.value !== null);
      return acc;
    }, {});
  }
</script>

<div class="childhood-immunizations">
  <MultiplesContainer>
    {#each vaxTypes as vaxType, i}
      <MultipleCell><VaxLine data={richData[vaxType]} title={vaxLabels[i]} strokeColor={vaxColors[i]} /></MultipleCell>
    {/each}
  </MultiplesContainer>
</div>
