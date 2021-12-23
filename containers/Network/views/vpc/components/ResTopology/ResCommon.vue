<template>
  <div class="res-container d-flex justify-content-center align-items-center">
    <i class="line" :class="{'full': multiple}" />
    <div class="res d-flex">
      <a-tooltip placement="right" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">资源类型</p>
          <p>名称：{{ name }}</p>
          <p>状态：运行中</p>
        </template>
        <icon :type="iconType" />
      </a-tooltip>
      <span class="name ml-1 pt-2">{{ name }}</span>
    </div>
  </div>
</template>

<script>
import ResMixin from './ResMixin'

export default {
  name: 'ResCommon',
  mixins: [ResMixin],
  props: {
    name: String,
    type: String,
    multiple: Boolean,
  },
  data () {
    return {}
  },
  computed: {
    iconType () {
      return `res-${this.type}`
    },
  },
}
</script>

<style lang="scss" scoped>
@import "index.scss";
</style>
