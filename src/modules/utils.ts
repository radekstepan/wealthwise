export const range = (n: number) => Array(n).fill(true).map((_, i) => i);
export const range1 = (n: number) => Array(n).fill(true).map((_, i) => i + 1);
export const sum = (...args: number[]) => args.reduce((t, d) => t + d, 0);
