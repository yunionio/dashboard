<template>
    <keep-alive v-if="keepAlive">
      <router-view :key="key" />
    </keep-alive>
    <router-view v-else :key="key" />
</template>

<script>
export default {
  computed: {
    key () {
      return this.$route.fullPath
    },
    keepAlive () {
      const { meta = {} } = this.$route
      const { keepAlive = false } = meta
      return keepAlive
    },
  },
}
</script>
