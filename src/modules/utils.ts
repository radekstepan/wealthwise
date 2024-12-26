// Round a number to two decimal places; @expensive
export const r = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100
export const round = r;
// Generate an array of numbers starting from 0
export const range = (n: number) => {
  const arr = new Array(n);
  for (let i = 0; i < n; i++) {
    arr[i] = i;
  }
  return arr;
}

// Generate an array of numbers starting from 1
export const range1 = (n: number) => {
  const arr = new Array(n);
  for (let i = 0; i < n; i++) {
    arr[i] = i + 1;
  }
  return arr;
}
// Calculates the sum of a given set of numbers.
export const sum = (...args: number[]) => {
  let total = 0;
  for (let i = 0; i < args.length; i++) {
    total += args[i];
  }
  return total;
}
// Do something every n times (handles 0).
export const isEvery = (now: number, every: number) => now && !(now % every);
