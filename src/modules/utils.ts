import * as math from 'mathjs';

// Round; @expensive
export const r = (val: number) => math.round(val, 2);
export const round = r;
export const range = (n: number) => Array(n).fill(1).map((_, i) => i);
export const range1 = (n: number) => Array(n).fill(1).map((_, i) => i + 1);
export const sum = (...args: number[]) => args.reduce((t, d) => t + d, 0);
// Do something every n times.
export const isEvery = (now: number, every: number) => !(now % every);

// Get a number within an acceptable min/max range.
export const within = (get: () => number, min: number, max: number) => {
  let tries = 1000; // overflow check

  while (tries) {
    tries -= 1;
    const n = get();
    if (n >= min && n <= max) {
      return n;
    }
  }

  throw new Error('All generated numbers fell out of range');
};
