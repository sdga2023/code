import { writable } from 'svelte/store';

const randomGoal = Math.max(1, Math.floor(Math.random() * 17));
export const activeGoal = writable({ string: 'goal' + String(randomGoal).padStart(2, '0'), number: randomGoal });
