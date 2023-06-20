<script>
  import { OrangeRamp } from '$lib/styles/colorscales';
  import IncidenceScroller from './IncidenceScroller.svelte';
  import * as Colors from '$lib/styles/tokens.es6';

  export let parentWidth;
  export let parentHeight;
  export let data;
  export let activeScene;

  export let tb_incidence = 'Tuberculosis incidence per 100k';
  export let tb_cases = 'Tuberculosis cases';
  export let tb_incidence_worldwide = 'Tuberculosis incidence worldwide per 100k people';
  export let tb_cases_worldwide = 'Tuberculosis cases worldwide (estimated)';

  //  export let tb_notifications = 'Tuberculosis notifications';

  let accessors = [
    { prop: 'per100k', label: tb_incidence, relative: true, digits: 1 },
    { prop: 'numerical', label: tb_cases, absolute: true, digits: 0 }
    /* { prop: 'notifications', label: tb_notifications } */
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
  colorRamp={OrangeRamp}
  baseColor={Colors.ColorVisRed}
  incidence={tb_incidence}
  incidence_worldwide={tb_incidence_worldwide}
  cases_worldwide={tb_cases_worldwide}
/>
