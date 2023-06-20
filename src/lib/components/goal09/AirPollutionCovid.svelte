<script>
    import MultiplesContainer from '../general/MultiplesContainer.svelte';
    import MultipleCell from '../general/MultipleCell.svelte';
    import AirPollutionMultiple from './AirPollutionMultiple.svelte';
    import { _ } from 'svelte-i18n';
  
    export let data;
    export let xaxistitle;
    export let yaxistitle;
    export let yaxisunits;
    export let no2;
    export let pm25;
    export let predicted;
    export let observed;
  
    const metrics = ["no2", "pm25"]
    const metricsMap = {
      no2: no2,
      pm25: pm25
    }
  </script>
  
  {#if data}
    <MultiplesContainer>
      {#each metrics as metric}
        <MultipleCell>
          <AirPollutionMultiple data={data.filter(d => d.param == metric)} title={metricsMap[metric]} {xaxistitle} {yaxistitle} {yaxisunits} {predicted} {observed} showLabels={metric == "no2"} {metric}/>
        </MultipleCell>
      {/each}
    </MultiplesContainer>
  {/if}
