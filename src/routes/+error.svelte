<script>
  import chapters from '../data/chapters.js';

  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { base } from '$app/paths';

  import vars from '$lib/variables.js';

  const FORMER_GOAL_PAGE = /(\/goals\/)?(goal\d{1,2})/;

  let potentialTarget = $page?.url?.pathname.match(FORMER_GOAL_PAGE)?.[2] ?? null;

  if (potentialTarget) {
    let potentialNumber = parseInt(potentialTarget.match(/(\d+)/)?.[1]);
    console.log(potentialNumber);
    if (potentialNumber > 0 && potentialNumber < 18) {
      potentialTarget = potentialNumber;
    } else {
      potentialTarget = null;
    }
    console.log(potentialTarget);
  }

  if (browser) {
    if (potentialTarget) {
      console.log('redirecting to');
      console.log('https://' + vars.hostname + base + '/' + chapters[potentialTarget]?.url);
      goto('https://' + vars.hostname + base + '/' + chapters[potentialTarget]?.url);
    } else if ($page?.url?.pathname === '/goals/demopage') {
      goto('http://localhost:5173/goals/demopage');
    } else {
      console.log('https://' + vars.hostname + '/' + base);
      goto('https://' + vars.hostname + '/' + base);
    }
  }
</script>
