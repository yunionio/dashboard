<template>
  <div>
    <a-dropdown :trigger="['click']" :getPopupContainer="triggerNode => triggerNode.parentNode">
      <a-tooltip :title="$t('common.more')" placement="right">
        <div class="trigger d-flex align-items-center justify-content-center">
          <icon type="navbar-more" style="font-size: 24px;" />
        </div>
      </a-tooltip>
      <a-menu slot="overlay" @click="handleDropdownClick">
        <a-menu-item key="/guide" v-if="isAdminMode">{{$t('navbar.button.feature_select')}}</a-menu-item>
        <a-menu-item :key="docsUrl">{{$t('navbar.button.docs')}}</a-menu-item>
        <a-menu-item key="/licenses">
          <span>{{$t('navbar.button.about')}}</span>
          <a-icon v-if="isAdminMode && updateAvailable" type="cloud-upload" class="success-color ml-1" />
        </a-menu-item>
      </a-menu>
    </a-dropdown>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'

export default {
  name: 'HelpPopover',
  data () {
    return {
      updateAvailable: false,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode']),
    docsUrl () {
      return `${window.location.origin}/docs/docs/`
    },
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('updates', 'v1')
    this.getUpdateInfo()
  },
  methods: {
    getUpdateInfo () {
      this.manager.list({
        params: {
          $t: +new Date(),
        },
      }).then(res => {
        if (res.data.data && res.data.data.length) {
          const updateInfo = R.find(R.propEq('updateAvailable', true))(res.data.data)
          if (updateInfo) {
            this.updateAvailable = true
          }
        }
      })
    },
    handleDropdownClick (item) {
      if (item.key === 'setting') return
      const newWindow = item.key.startsWith('http')
      if (newWindow) {
        window.open(item.key)
      } else {
        this.$router.push(item.key)
      }
    },
  },
}
</script>

<style lang="less" scoped>
.trigger {
  height: 100%;
  // padding: 0 20px;
  cursor: pointer;
  text-decoration: none;
}
</style>
