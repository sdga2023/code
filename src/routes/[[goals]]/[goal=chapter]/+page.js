import { browser } from '$app/environment';

export async function load({ params, fetch }) {
  let { goal } = params;

  // if goal doesn't exist, use location
  if (!goal && browser) {
    const pathParts = document?.location?.pathname?.split('/');
    if (pathParts.length > 0) {
      goal = pathParts[pathParts.length - 1];
    }
  }

  try {
    let parsedGoal = goal?.match(/(\d{1,2})/)?.[1];
    if (('' + parsedGoal).length === 1) {
      parsedGoal = '0' + parsedGoal;
    }
    parsedGoal = 'goal' + parsedGoal;

    if (parsedGoal === 'goalundefined' && params?.goal === 'demopage') {
      parsedGoal = 'demopage';
    }

    const archie = await import(`../../../data/${parsedGoal}/${parsedGoal}.json`);

    return { goal: parsedGoal, archie };
  } catch (e) {
    return { goal: 'goal00', archie: { content: [], config: {} } };
  }
}
