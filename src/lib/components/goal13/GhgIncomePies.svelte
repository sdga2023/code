<script>
    import MultiplesContainer from '../general/MultiplesContainer.svelte';
    import MultipleCell from '../general/MultipleCell.svelte';
    import GhgSharesIncomePie from './GhgSharesIncomePie.svelte';
    import * as Colors from '$lib/styles/tokens.es6.js';
    import { _ } from 'svelte-i18n';
  
    export let data;
    export let sharescumulative;
    export let emissions2019;
    export let shares2019;

    let colorScale = {
      HIC: { label: $_('income.HIC'), color: Colors.ColorVisIncomeHigh },
      UMC: { label: $_('income.UMC'), color: Colors.ColorVisIncomeUpperMiddle },
      LMC: { label: $_('income.LMC'), color: Colors.ColorVisIncomeLowerMiddle },
      LIC: { label: $_('income.LIC'), color: Colors.ColorVisIncomeLow },
    }

  
  </script>
  
  {#if data}
    <MultiplesContainer>
        <MultipleCell>
            <GhgSharesIncomePie data={data.filter(d => d.type == "Cumulative")} title={sharescumulative} height={400} colors={colorScale} pieSize="big"/>
          </MultipleCell>
          <!--MultipleCell>
            <GhgSharesIncomePie data={data.filter(d => d.type == "2019")} title={emissions2019} height={400} colors={colorScale} pieSize="small"/>
          </MultipleCell-->
          <MultipleCell>
            <GhgSharesIncomePie data={data.filter(d => d.type == "2019")} title={shares2019} height={400} colors={colorScale} pieSize="big"/>
          </MultipleCell>
    </MultiplesContainer>
  {/if}