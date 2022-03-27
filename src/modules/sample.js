import sampler from './samplers';

const sample = (opts) => Object.entries(opts).reduce((d, [key, val]) => ({
  ...d,
  [key]: typeof val === 'string' ? sampler(val) : sample(val)
}), {});

export default sample;
