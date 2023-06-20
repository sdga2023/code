<script>
  import { YellowRamp } from '$lib/styles/colorscales';
  import IncidenceScroller from './IncidenceScroller.svelte';
  import * as Colors from '$lib/styles/tokens.es6';

  export let parentWidth;
  export let parentHeight;
  export let data;
  export let activeScene;

  export let malaria_incidence = 'Malaria incidence per 1000 at-risk people';
  export let malaria_cases = 'Malaria cases';
  export let malaria_incidence_worldwide = 'Malaria incidence worldwide per 1000 at-risk people';
  export let malaria_cases_worldwide = 'Malaria cases worldwide (estimated)';

  let accessors = [
    { prop: 'per1000', label: malaria_incidence, relative: true, digits: 1 },
    { prop: 'cases', label: malaria_cases, absolute: true, digits: 0 }
  ];

  let forcedLabels = ['COD', 'ZAF'];

  $: activeState = activeScene.index < 2 ? 0 : activeScene.index < 4 ? 1 : 2;
</script>

<IncidenceScroller
  {parentWidth}
  {parentHeight}
  {data}
  {activeState}
  {accessors}
  {forcedLabels}
  maxYear={2021}
  colorRamp={YellowRamp}
  baseColor={Colors.ColorVisRed}
  incidence={malaria_incidence}
  incidence_worldwide={malaria_incidence_worldwide}
  cases_worldwide={malaria_cases_worldwide}
/>
