<template>
  <p class="warning-color quota-message">{{$t('system.text_24')}}</p>
</template>

<script>
export default {
  name: 'QuotaMessage',
  data () {
    return {}
  },
}
</script>

<style lang="less" scoped>
.quota-message {
  font-size: 12px;
  margin-top: 6px;
}
</style>
