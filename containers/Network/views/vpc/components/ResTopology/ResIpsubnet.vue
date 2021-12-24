<template>
  <div class="res-container d-flex justify-content-center">
    <div class="res res-ipsubnet">
      <p class="desc">起:{{ network.guest_ip_start }}</p>
      <p class="desc">止:{{ network.guest_ip_end }}</p>
      <a-tooltip placement="right" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">IP子网</p>
          <p>名称：{{ network.name }}</p>
          <p>状态：{{ $t('status.network.' + network.status) }}</p>
        </template>
        <icon type="res-network" />
      </a-tooltip>
      <span class="name">{{ network.name }}</span>
    </div>
  </div>
</template>

<script>
import ResMixin from './ResMixin'

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
@import "index.scss";
</style>
