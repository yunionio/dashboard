<template>
  <div class="res-container d-flex justify-content-center align-items-center">
    <i class="line" :class="{'full': multiple}" />
    <div class="res d-flex">
      <a-tooltip placement="topLeft" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">{{ $t('network.topology.res_type.' + getType(resSource)) }}</p>
          <p>{{ $t('common.name') }}：{{ getName(resSource) }}</p>
          <p>{{ $t('common.status') }}：{{ getStatus(resSource) }}</p>
          <template v-if="type === 'vminstance'">
            <p>{{ $t('network.waf.rule_ip') }}：{{ resSource.ip_addr }}</p>
          </template>
          <template v-else-if="type === 'lb'">
            <p>{{ $t('network.text_248') }}：{{ resSource.ip_addr }}</p>
          </template>
          <template v-else-if="type === 'host'">
            <p v-for="(obj, idx) in resSource.networks" :key="idx">{{ $t('network.waf.rule_ip') }}：{{ obj.ip_addr }}</p>
          </template>
          <template v-else-if="type === 'baremetal'">
            <p v-for="(obj, idx) in resSource.networks" :key="idx">{{ $t('network.waf.rule_ip') }}：{{ obj.ip_addr }}</p>
          </template>
        </template>
        <div class="d-flex">
          <icon :type="iconType" />
          <span class="name text-truncate ml-1 pt-2">{{ getName(resSource) }}</span>
        </div>
      </a-tooltip>
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
    getStatus ({ status, owner_status }) {
      if (!status && !owner_status) return this.$t('common.text00001')
      return this.$t(`status.${STATUS_MAP[this.type] || this.type}.${status || owner_status}`)
    },
    getName ({ owner, name }) {
      return owner || name
    },
    getType ({ owner_type, host_type }) {
      return owner_type || host_type
    },
  },
}
</script>

<style lang="scss" scoped>
@import "index.scss";
</style>
