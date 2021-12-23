<template>
  <div class="wire vpc d-flex">
    <div class="text-center">
      <a-tooltip placement="right" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">VPC</p>
          <p>名称：{{ name }}</p>
          <p>状态：运行中</p>
        </template>
        <icon type="res-vpc" />
      </a-tooltip>
      <span class="name">{{ name }}</span>
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
    name: String,
  },
  data () {
    return {}
  },
}
</script>

<style lang="scss" scoped>
@import "index.scss";
</style>
