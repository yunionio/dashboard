<template>
  <div class="page-body">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'PageBody',
}
</script>

<style lang="less" scoped>
.page-body {
  margin: 20px 0 74px 0;
}
</style>
