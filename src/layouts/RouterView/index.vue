<template>
    <keep-alive :include="cachedComponentNames">
      <router-view />
    </keep-alive>
</template>

<script>
// cachedComponentNames 为需要缓存的页面里的组件名称，当前默认路由中name和组件名称一致且只有一个
import store from '@/store'

export default {
  computed: {
    cachedComponentNames () {
      return this.$store.state.keepAlive.cachedComponentNames
    },
  },
  beforeRouteLeave (to, from, next) {
    // 关闭页面开启的详情
    this.$bus.$emit('destroyKeepAliveSidePage')
    this.updateCachedCoponents(to, from)
    setTimeout(() => next())
  },
  beforeRouteUpdate (to, from, next) {
    // 关闭页面开启的详情
    this.$bus.$emit('destroyKeepAliveSidePage')
    this.updateCachedCoponents(to, from)
    setTimeout(() => next())
  },
  methods: {
    updateCachedCoponents (to, from) {
      const { keepAlive = false } = (from.meta || {})
      const { keepAliveViews = [] } = (to.meta || {})
      // 页面离开时，若本页面需要被缓存，则缓存
      if (keepAlive) {
        store.commit('keepAlive/ADD_CACHED_COMPONENT', from.name)
      }
      // 若本页面在去往的页面中被设置了需要保留状态，则保留，否则就删除去往页面的状态
      if (!keepAliveViews.includes(from.name) && this.cachedComponentNames.includes(to.name)) {
        store.commit('keepAlive/DELETE_CACHED_COMPONENT', to.name)
      }
    },
  },
}
</script>
