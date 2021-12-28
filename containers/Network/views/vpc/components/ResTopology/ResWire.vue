<template>
  <div v-if="!physical" class="wire d-flex">
    <span class="line" />
    <div class="text-center">
      <a-tooltip placement="left" :get-popup-container="getPopupContainer">
        <template slot="title">
          <!-- 二层网络 -->
          <p class="title">{{ $t('dictionary.wire') }}</p>
          <p>{{ $t('common.name') }}：{{ dataSource.name }}</p>
          <p>{{ $t('common.status') }}：{{ $t('status.wire.' + dataSource.status) }}</p>
        </template>
        <icon type="res-broadcast" />
        <span class="name text-truncate text-center">{{ dataSource.name }}</span>
      </a-tooltip>
    </div>
    <span class="line" />
  </div>
  <div v-else class="res-container d-flex justify-content-center">
    <div class="res res-ipsubnet" style="transform: translateY(-52%)">
      <a-tooltip placement="top" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">{{ $t('dictionary.wire') }}</p>
          <p>{{ $t('common.name') }}：{{ dataSource.name }}</p>
          <p>{{ $t('common.status') }}：{{ $t('status.wire.' + dataSource.status) }}</p>
        </template>
        <icon type="res-broadcast" />
        <span class="name text-truncate text-center">{{ dataSource.name }}</span>
      </a-tooltip>
    </div>
  </div>
</template>

<script>
import ResMixin from './ResMixin'

export default {
  name: 'ResWire',
  mixins: [ResMixin],
  props: {
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
