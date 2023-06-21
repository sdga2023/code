import { writable } from 'svelte/store';

/*
[
  {
    goal: 1,
    id: 'unique-id',
    hovered: false
  },
  {
    goal: 1,
    id: 'unique-id4',
    hovered: false
  },
  {
    goal: 5,
    id: 'unique-id2',
    hovered: true
  }
]
*/
export const highlightedGoals = writable([]);
