<script>
  import MultiplesContainer from '../general/MultiplesContainer.svelte';
  import MultipleCell from '../general/MultipleCell.svelte';
  import GhgGwpBars from './GhgGwpBars.svelte';
  import GhgSharesPie from './GhgSharesPie.svelte';
  import * as Colors from '$lib/styles/tokens.es6.js';

  export let data;
  export let co2;
  export let ch4;
  export let n20;
  export let fluor;
  export let gwp;
  export let shares;

  let colorScale = {
    co2: { label: co2, color: Colors.ColorBasePurple500 },
    ch4: { label: ch4, color: Colors.ColorBaseRed300 },
    n2o: { label: n20, color: Colors.ColorBaseRed500 },
    fluor: { label: fluor, color: Colors.ColorBaseRed700 }
  };
</script>

{#if data}
  <MultiplesContainer>
    <MultipleCell>
      <GhgGwpBars {data} title={gwp} height={400} colors={colorScale} />
    </MultipleCell>
    <MultipleCell>
      <GhgSharesPie {data} title={shares} height={400} colors={colorScale} />
    </MultipleCell>
  </MultiplesContainer>
{/if}
