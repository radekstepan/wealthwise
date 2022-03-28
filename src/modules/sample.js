import sampler from './samplers';

function type(val) {
  switch (typeof val) {
    case 'string':
      return sampler(val);
    case 'number':
      return val;
    default:
      return sample(val);
  }

  typeof val === 'string' ? sampler(val) : sample(val)
}

const sample = (opts) => Object.entries(opts).reduce((d, [key, val]) => ({
  ...d,
  [key]: type(val)
}), {});

export default sample;
