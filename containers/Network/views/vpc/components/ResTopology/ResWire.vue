<template>
  <div v-if="!physical" class="wire d-flex">
    <span class="line" />
    <div class="text-center">
      <a-tooltip placement="right" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">二层网络</p>
          <p>名称：{{ dataSource.name }}</p>
          <p>状态：{{ $t('status.wire.' + dataSource.status) }}</p>
        </template>
        <icon type="res-broadcast" />
      </a-tooltip>
      <span class="name">{{ dataSource.name }}</span>
    </div>
    <span class="line" />
  </div>
  <div v-else class="res-container d-flex justify-content-center">
    <div class="res res-ipsubnet" style="transform: translateY(-34%)">
      <a-tooltip placement="right" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">二层网络</p>
          <p>名称：{{ dataSource.name }}</p>
          <p>状态：{{ $t('status.wire.' + dataSource.status) }}</p>
        </template>
        <icon type="res-broadcast" />
      </a-tooltip>
      <span class="name">{{ dataSource.name }}</span>
    </div>
  </div>
</template>

<script>
import ResMixin from './ResMixin'

export default {
  name: 'ResWire',
  mixins: [ResMixin],
  props: {
    name: String,
    dataSource: Object,
    physical: String,
  },
  data () {
    return {}
  },
}
</script>

<style lang="scss" scoped>
@import "index.scss";
</style>
