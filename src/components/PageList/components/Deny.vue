<template>
  <div class="wrap d-flex justify-content-center align-items-center">
    <div>
      <div class="empty-image">
        <img src="../../../assets/images/empty.svg" />
      </div>
      <div class="empty-description">{{ $t('common.permission.403') }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Deny',
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
  },
}
</script>

<style lang="less" scoped>
.wrap {
  margin: 32px 0;
  color: rgba(0, 0, 0, .25);
}
.image {
  height: 40px;
}
</style>
