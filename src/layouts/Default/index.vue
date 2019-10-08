<template>
  <div class="app-container">
    <sidebar :l2-menu-visible.sync="l2MenuVisible" />
    <div class="position-relative">
      <navbar />
      <div class="app-page px-4 pb-4" :class="{ 'l2-menu-show': l2MenuVisible }">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '../Sidebar'
import Navbar from '../Navbar'

export default {
  name: 'DefaultLayout',
  components: {
    Sidebar,
    Navbar,
  },
  data () {
    return {
      l2MenuVisible: false,
    }
  },
}
</script>

<style lang="scss" scoped>
.app-page {
  padding-top: 80px;
  margin-left: 80px;
  margin-bottom: 74px;
  &.l2-menu-show {
    margin-left: 224px;
  }
}
</style>
