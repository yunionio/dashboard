<template>
  <div class="wrap d-flex justify-content-center align-items-center">
    <div v-if="loading" class="text-center">
      <div class="loading-image">
        <a-icon type="sync" spin />
      </div>
      <div class="loading-description">加载中</div>
    </div>
    <div v-else class="text-center">
      <a-empty :description="noDataText" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Loader',
  props: {
    loading: {
      type: Boolean,
    },
    noDataText: {
      type: String,
      default: '暂无数据',
    },
  },
}
</script>

<style lang="scss" scoped>
.wrap {
  margin: 32px 0;
  color: rgba(0, 0, 0, .25);
}
.empty-image {
  height: 40px;
}
</style>
