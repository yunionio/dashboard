<template>
  <div class="wire vpc d-flex">
    <div class="text-center">
      <a-tooltip placement="right" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">VPC</p>
          <p>名称：{{ dataSource.name }}</p>
          <p>状态：{{ $t('status.vpc.' + dataSource.status) }}</p>
        </template>
        <icon type="res-vpc" />
      </a-tooltip>
      <span class="name">{{ dataSource.name }}</span>
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
