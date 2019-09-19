<template>
  <div id="app">
    <component :is="layout">
      <router-view />
    </component>
  </div>
</template>

<script>
import DefaultLayout from '@/layouts/Default'
import FullScreenLayout from '@/layouts/FullScreen'

export default {
  name: 'App',
  components: {
    DefaultLayout,
    FullScreenLayout,
  },
  computed: {
    layout () {
      return `${(this.$route.meta.layout || 'default')}-layout`
    },
  },
}
</script>
