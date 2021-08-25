<template>
  <div class="page-card-loader">
    <div v-if="loading">
      <a-skeleton active />
    </div>
    <div v-else>
      <data-empty />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageCardListLoader',
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
  },
}
</script>

<style lang="less" scoped>
.page-card-loader {
  ::v-deep .ant-skeleton .ant-skeleton-paragraph {
    padding: 0;
  }
}
</style>
