<template>
  <h2 class="container-title">{{ title }}</h2>
</template>

<script>
export default {
  name: 'ContainerTitle',
  props: {
    title: {
      type: String,
      required: true,
    },
  },
}
</script>

<style lang="scss">
.container-title {
  font-size: 18px;
  margin: 30px 0;
}
</style>
