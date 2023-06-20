import chapters from '../data/chapters.js';
import vars from '$lib/variables.js';

import homepage from '../data/homepage/homepage.json';

import { base } from '$app/paths';

const loadGoals = () => {
  const numberifyGoal = (goalNumber) => (('' + goalNumber).length === 1 ? `0${goalNumber}` : '' + goalNumber);
  return Object.values(chapters).map((chapter, i) => ({
    number: i + 1,
    index: numberifyGoal(i + 1),
    headline: homepage.headlines?.[i + 1] ?? '',
    url: base + '/' + chapter?.url,
    title: chapter?.title,
    real: i + 1 >= 1 && i + 1 <= 17
  }));
};

export async function load() {
  return { goals: loadGoals(), homepage };
}
