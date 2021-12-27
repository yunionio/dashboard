<template>
  <div class="res-container d-flex justify-content-center align-items-center">
    <i class="line" :class="{'full': multiple}" />
    <div class="res d-flex">
      <a-tooltip placement="right" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">{{ $t('network.topology.res_type.' + getType(resSource)) }}</p>
          <p>{{ $t('common.name') }}：{{ getName(resSource) }}</p>
          <p>{{ $t('common.status') }}：{{ getStatus(resSource) }}</p>
        </template>
        <icon :type="iconType" />
      </a-tooltip>
      <span class="name ml-1 pt-2">{{ getName(resSource) }}</span>
    </div>
  </div>
</template>

<script>
import ResMixin from './ResMixin'
import { STATUS_MAP } from './constants'

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
  methods: {
    getStatus (resSource) {
      if (!resSource.status) return this.$t('common.text00001')
      return this.$t(`status.${STATUS_MAP[this.type] || this.type}.${resSource.status}`)
    },
    getName (resSource) {
      return resSource.owner || resSource.name
    },
    getType (resSource) {
      return resSource.owner_type || resSource.host_type
    },
  },
}
</script>

<style lang="scss" scoped>
@import "index.scss";
</style>
