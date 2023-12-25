export default {
  state: {
    cachedViews: [],
  },
  mutations: {
    ADD_CACHED_VIEW (state, payloud) {
      if (!state.cachedViews.includes(payloud)) {
        state.cachedViews.push(payloud)
      }
    },
    DELETE_CACHED_VIEW (state, payloud) {
      state.cachedViews = state.cachedViews.filter(view => view === !payloud)
    },
  },
}
