<script>
  import MultiplesContainer from '../general/MultiplesContainer.svelte';
  import MultipleCell from '../general/MultipleCell.svelte';
  import RoadEmissionsMultiple from './RoadEmissionsMultiple.svelte';
  import CategoricalLegend from '../general/CategoricalLegend.svelte';

  export let data;
  export let hic;
  export let other;
  export let yaxisunits;
</script>

<CategoricalLegend legendType={'income'} top={true} />
<MultiplesContainer>
  <MultipleCell cols="6">
    <RoadEmissionsMultiple {data} title={hic} type="hic" {yaxisunits} />
  </MultipleCell>
  <MultipleCell cols="6">
    <RoadEmissionsMultiple {data} title={other} type="other" {yaxisunits} />
  </MultipleCell>
</MultiplesContainer>
