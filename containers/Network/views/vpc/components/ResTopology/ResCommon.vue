<template>
  <div class="res-container d-flex justify-content-center align-items-center">
    <i class="line" :class="{'full': multiple}" />
    <div class="res d-flex">
      <a-tooltip placement="right" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">{{ $t('network.topology.res_type.' + resSource.owner_type) }}</p>
          <p>名称：{{ resSource.owner }}</p>
          <p>状态：{{ resSource.status || '可用' }}</p>
        </template>
        <icon :type="iconType" />
      </a-tooltip>
      <span class="name ml-1 pt-2">{{ resSource.owner }}</span>
    </div>
  </div>
</template>

<script>
import ResMixin from './ResMixin'

export default {
  name: 'ResCommon',
  mixins: [ResMixin],
  props: {
    dataSource: Object,
    multiple: Boolean,
    type: String,
  },
  data () {
    return {}
  },
  computed: {
    iconType () {
      return `res-${this.type}`
    },
    resSource () {
      return this.dataSource || {}
    },
  },
}
</script>

<style lang="scss" scoped>
@import "index.scss";
</style>
