<template>
  <div>
    <a-dropdown :trigger="['click']">
      <div class="trigger d-flex align-items-center justify-content-center">
        <icon type="question" style="font-size: 24px;" />
      </div>
      <a-menu slot="overlay" @click="handleDropdownClick">
        <a-menu-item key="https://docs.yunion.cn/docs/">产品手册</a-menu-item>
        <a-menu-item :key="`${$appConfig.v1Perfix}/licenses`">
          <span>关于</span>
          <a-icon v-if="isAdminMode && updateInfo.updateAvailable" type="arrow-up" style="color: #67C23A;" />
        </a-menu-item>
      </a-menu>
    </a-dropdown>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'HelpPopover',
  data () {
    return {
      updateInfo: {},
    }
  },
  computed: mapGetters(['isAdminMode']),
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('updates', 'v1')
  },
  methods: {
    getUpdateInfo () {
      this.manager.list().then(res => {
        if (res.data.total >= 1) {
          this.updateInfo = res.data.data[0]
        }
      })
    },
    handleDropdownClick (item) {
      window.location.href = item.key
    },
  },
}
</script>

<style lang="scss" scoped>
.trigger {
  height: 100%;
  padding: 0 20px;
  cursor: pointer;
  text-decoration: none;
}
</style>
