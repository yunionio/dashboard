<template>
  <div class="wire vpc d-flex">
    <div class="text-center">
      <a-tooltip placement="left" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">VPC</p>
          <p>{{ $t('common.name') }}：{{ dataSource.name }}</p>
          <p>{{ $t('common.status') }}：{{ $t('status.vpc.' + dataSource.status) }}</p>
        </template>
        <icon type="res-vpc" />
        <span class="name text-truncate">{{ dataSource.name }}</span>
      </a-tooltip>
    </div>
    <span class="line" />
  </div>
</template>

<script>
import ResMixin from './ResMixin'

export default {
  name: 'ResVpc',
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
@import "index.scss";
</style>
