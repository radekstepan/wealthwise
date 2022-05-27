export default {
  state: {
    previous: null,
    current: null
  },
  reducers: {
    setMeta: (state, meta) => ({
      previous: state.current,
      current: meta
    })
  },
};
