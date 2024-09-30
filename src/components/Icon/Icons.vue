<template>
  <div>
    <a-button type="link" style="position:absolute;right:20px;top:20px" @click="() => {enableBorder = !enableBorder}">{{ enableBorder ? '取消边框' : '展示边框' }}</a-button>
    <div class="title">专用</div>
    <div class="icon-list d-flex flex-wrap">
      <div class="icon-item" v-for="key in scopeIcons" :key="key">
        <div class="icon">
          <icon :class="{ 'icon-svg': enableBorder }" :type="key" />
        </div>
        <div class="icon-name">{{ key }}</div>
      </div>
    </div>
    <div class="title">通用</div>
    <div class="icon-list d-flex flex-wrap">
      <div class="icon-item" v-for="key in commonIcons" :key="key">
        <div class="icon">
          <icon :class="{ 'icon-svg': enableBorder }" :type="key" />
        </div>
        <div class="icon-name">{{ key }}</div>
      </div>
    </div>
  </div>
</template>

<script>
const commonIcons = require.context('./assets', true, /\.svg$/).keys().map(key => {
  return key.replace('./auth/', '').replace('./', '').replace('.svg', '')
})
const scopeIcons = require.context('@scope/assets', true, /\.svg$/).keys().map(key => {
  return key.replace('./', '').replace('.svg', '')
})
export default {
  data () {
    return {
      enableBorder: false,
      commonIcons,
      scopeIcons,
    }
  },
}
</script>

<style lang="less" scoped>
.title {
  margin-top: 20px;
  font-size: 24px;
  text-align: center;
  clear: both;
}
.icon-list {
  padding: 0 30px 30px 30px;
}
.icon-item {
  margin: 20px 0;
  width: 100px;
  .icon {
    font-size: 50px;
    text-align: center;
    .icon-svg {
      border: solid 1px red;
    }
  }
  .icon-name {
    text-align: center;
  }
}
</style>
