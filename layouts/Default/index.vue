<template>
  <div class="app-container">
    <navbar />
    <div class="app-content position-relative h-100">
      <sidebar :l2-menu-visible.sync="l2MenuVisible" />
      <div id="app-page" class="app-page" :class="{ 'l2-menu-show': l2MenuVisible }">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import Navbar from '@scope/layouts/Navbar'
import Sidebar from '../Sidebar'
import notificationListener from '@/utils/notificationListener'

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
  computed: {
    ...mapGetters(['auth']),
  },
  watch: {
    'auth.auth': {
      handler (val, oldVal) {
        if (val && val.session && !R.equals(val, oldVal)) {
          this.initIO()
        }
      },
      immediate: true,
    },
  },
  methods: {
    initIO () {
      if (!this.$appConfig.isPrivate) return
      const options = {
        session: this.auth.auth.session,
      }
      if (process.env.NODE_ENV === 'production') {
        options.server = '/'
      }
      notificationListener(this.$store, options)
    },
  },
}
</script>

<style lang="scss" scoped>
.app-content {
  padding-top: 60px;
}
.app-page {
  margin-left: 60px;
  margin-bottom: 74px;
  padding: 15px;
  &.l2-menu-show {
    margin-left: 224px;
  }
}
</style>
