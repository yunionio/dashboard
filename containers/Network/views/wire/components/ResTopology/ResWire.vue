<template>
  <div class="wire vpc d-flex">
    <div class="text-center">
      <a-tooltip placement="left" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">{{ $t('dictionary.wire') }}</p>
          <p>{{ $t('common.name') }}：{{ dataSource.name }}</p>
          <p>{{ $t('common.status') }}：{{ $t('status.wire.' + dataSource.status) }}</p>
        </template>
        <icon type="res-wire" />
        <span class="name text-truncate">{{ dataSource.name }}</span>
      </a-tooltip>
    </div>
    <span class="line" />
  </div>
</template>

<script>
import ResMixin from '@Network/sections/Topology/ResMixin'

export default {
  name: 'ResWire',
  mixins: [ResMixin],
  props: {
    dataSource: {
      type: Object,
      default () {
        return {}
      },
    },
  },
  data () {
    return {}
  },
}
</script>

<style lang="scss" scoped>
// @import "@Network/sections/Topology/index.scss";
</style>
