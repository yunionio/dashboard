<template>
  <div v-if="!physical" class="wire d-flex">
    <span class="line" />
    <div class="text-center">
      <a-tooltip placement="right" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">二层网络</p>
          <p>名称：{{ name }}</p>
          <p>状态：运行中</p>
        </template>
        <icon type="res-wire" />
      </a-tooltip>
      <span class="name">{{ name }}</span>
    </div>
    <span class="line" />
  </div>
  <div v-else class="res-container d-flex justify-content-center">
    <div class="res res-ipsubnet" style="transform: translateY(-34%)">
      <a-tooltip placement="right" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">二层网络</p>
          <p>名称：{{ name }}</p>
          <p>状态：运行中</p>
        </template>
        <icon type="res-wire" />
      </a-tooltip>
      <span class="name">{{ name }}</span>
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
