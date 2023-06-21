<script>
  import MultiplesContainer from '../general/MultiplesContainer.svelte';
  import MultipleCell from '../general/MultipleCell.svelte';
  import TravelTimeBarChartMultiple from './TravelTimeBarChartMultiple.svelte';

  export let data;
  export let primary;
  export let postprimary;
  export let gross_enroll;
  export let net_enroll;
  export let completion;

  const levels = ['primary', 'postprimary'];
</script>

<MultiplesContainer>
  {#each levels as level}
    <MultipleCell>
      <TravelTimeBarChartMultiple {data} {level} height={220} {primary} {postprimary} {gross_enroll} {net_enroll} {completion} />
    </MultipleCell>
  {/each}
</MultiplesContainer>
