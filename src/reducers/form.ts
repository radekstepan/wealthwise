import inputs from '../modules/inputs/inputs';

export default {
  state: inputs,
  reducers: {
    setForm: (state, cb) => cb(state)
  },
};
