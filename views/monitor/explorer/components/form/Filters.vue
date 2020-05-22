<template>
  <div>
    <div v-for="item in filters" :key="item.key" />
    <div class="d-flex align-items-center">
      <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
      <a-button type="link" @click="add">添加过滤条件</a-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExplorerFormFilters',
  props: {
    decorators: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      filters: [],
    }
  },
  methods: {
    add () {

    },
  },
}
</script>

<style>

</style>
