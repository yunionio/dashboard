<template>
  <div class="res-container d-flex justify-content-center">
    <div class="res res-ipsubnet">
      <p class="desc">{{ desc }}</p>
      <a-tooltip placement="right" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">IP子网</p>
          <p>名称：{{ name }}</p>
          <p>状态：运行中</p>
        </template>
        <icon type="res-network" />
      </a-tooltip>
      <span class="name">{{ name }}</span>
    </div>
  </div>
</template>

<script>
import ResMixin from './ResMixin'

export default {
  name: 'ResIpsubnet',
  mixins: [ResMixin],
  props: {
    name: String,
    desc: String,
  },
  data () {
    return {}
  },
}
</script>

<style lang="scss" scoped>
@import "index.scss";
</style>
