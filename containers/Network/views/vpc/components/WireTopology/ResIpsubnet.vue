<template>
  <div class="res-container d-flex justify-content-center">
    <div class="res res-ipsubnet">
      <span class="name">{{ name }}</span>
      <a-tooltip placement="right">
        <template slot="title">
          <p>名称：{{ name }}</p>
          <p>状态：运行中</p>
        </template>
        <icon type="res-network" />
      </a-tooltip>
      <p class="desc">{{ desc }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResIpsubnet',
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
