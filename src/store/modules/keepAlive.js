export default {
  state: {
    cachedComponentNames: [],
    delayEvents: {}, // keep-alive 组件重新激活后需要执行这里的event
  },
  mutations: {
    ADD_CACHED_COMPONENT (state, payloud) {
      if (!state.cachedComponentNames.includes(payloud)) {
        state.cachedComponentNames.push(payloud)
      }
    },
    DELETE_CACHED_COMPONENT (state, payloud) {
      state.cachedComponentNames = state.cachedComponentNames.filter(view => view !== payloud)
    },
    ADD_DELAY_EVENT (state, payloud) {
      state.delayEvents[payloud.name] = payloud
    },
    DELETE_DELAY_EVENT (state, payloud) {
      const ret = { ...state.delayEvents }
      delete ret[payloud]
      state.delayEvents = ret
    },
    CLEAR_DELAY_EVENTS (state) {
      state.delayEvents = {}
    },
  },
}
