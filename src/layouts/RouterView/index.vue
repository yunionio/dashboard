<template>
    <keep-alive :include="cachedViews">
      <router-view />
    </keep-alive>
</template>

<script>
import store from '@/store'

export default {
  computed: {
    cachedViews () {
      return this.$store.state.keepAlive.cachedViews
    },
  },
  beforeRouteLeave (to, from, next) {
    const { keepAlive = false } = (from.meta || {})
    const { keepAliveViews = [] } = (to.meta || {})
    // 页面离开时，若本页面需要被缓存，则缓存
    if (keepAlive) {
      store.commit('keepAlive/ADD_CACHED_VIEW', from.name)
    }
    // 若本页面在去往的页面中被设置了需要保留状态，则保留，否则就删除去往页面的状态
    if (!keepAliveViews.includes(from.name) && this.cachedViews.includes(to.name)) {
      store.commit('keepAlive/DELETE_CACHED_VIEW', to.name)
    }
    setTimeout(() => next())
  },
}
</script>
