export default {
  state: {
    previous: null,
    current: null,
    dist: null
  },
  reducers: {
    setMeta: (state, meta) => ({
      ...state,
      previous: state.current,
      current: meta
    }),
    setDist: (state, dist) => ({
      ...state,
      dist
    })
  },
};
