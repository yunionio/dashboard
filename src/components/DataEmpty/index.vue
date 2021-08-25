<template>
  <div class="wrap d-flex justify-content-center align-items-center">
    <div>
      <a-empty :description="noDataText">
        <slot />
        <icon slot="image" type="data-empty" class="data-empty" />
      </a-empty>
    </div>
  </div>
</template>

<script>
import i18n from '@/locales'

export default {
  name: 'DataEmpty',
  props: {
    noDataText: {
      type: String,
      default: i18n.t('common.notData'),
    },
  },
}
</script>

<style lang="less" scoped>
.wrap {
  margin: 32px 0;
  color: rgba(0, 0, 0, .25);
}
.empty-image {
  height: 40px;
}
.data-empty {
  margin-top: 46px;
  font-size: 60px;
}
</style>
