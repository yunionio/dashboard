<template>
  <div class="wrap d-flex justify-content-center align-items-center">
    <div v-if="loading">
      <div class="loading-image">
        <a-icon type="sync" spin />
      </div>
      <div class="loading-description">{{this.$t('common.loding')}}</div>
    </div>
    <div v-else>
      <div class="empty-image">
        <img src="../../assets/images/empty.svg" />
      </div>
      <div class="empty-description">{{this.$t('coomon.notData')}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageListEmpty',
  props: {
    loading: {
      type: Boolean,
      required: true,
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
