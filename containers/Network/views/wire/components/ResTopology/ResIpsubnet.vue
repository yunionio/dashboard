<template>
  <div class="res-container d-flex justify-content-center">
    <div class="res res-ipsubnet">
      <p class="desc">{{ $t('network.topology.start') }}:{{ network.guest_ip_start }}</p>
      <p class="desc">{{ $t('network.topology.end') }}:{{ network.guest_ip_end }}</p>
      <a-tooltip placement="top" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">{{ $t('common_228') }}</p>
          <p>{{ $t('common.name') }}：{{ network.name }}</p>
          <p>{{ $t('common.status') }}：{{ $t('status.network.' + network.status) }}</p>
        </template>
        <icon type="res-network" />
        <span class="name text-truncate text-center">{{ network.name }}</span>
      </a-tooltip>
    </div>
  </div>
</template>

<script>
import ResMixin from '@Network/sections/Topology/ResMixin'

export default {
  name: 'ResIpsubnet',
  mixins: [ResMixin],
  props: {
    dataSource: Object,
  },
  data () {
    return {}
  },
  computed: {
    network () {
      return this.dataSource || {}
    },
  },
}
</script>

<style lang="scss" scoped>
// @import "@Network/sections/Topology/index.scss";
</style>
