import chapters from '../data/chapters.js';

export function match(param) {
  const validChapter = Object.values(chapters)
    .map((ch) => ch.url)
    .includes(param);
  let validFallback = param.match(/(\/goals\/)?(goal(\d{1,2}))/);

  if (validFallback && validFallback?.[3]) {
    // check if the goal number is between 1 and 17:
    const fallbackNumber = +validFallback?.[3];
    if (fallbackNumber < 1 || fallbackNumber > 17) {
      validFallback = false;
    }
  } else {
    validFallback = false;
  }

  return param === 'demopage' || validChapter || validFallback;
}
