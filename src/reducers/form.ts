import inputs from '../modules/inputs';

export default {
  state: inputs,
  reducers: {
    setForm: (state, cb) => cb(state)
  },
};
