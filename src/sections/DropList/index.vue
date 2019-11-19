<template>
  <div class="cell-drop-list">
    <a-collapse :bordered="false" @change="handleClick">
      <a-collapse-panel v-for="item in dropMsg" :header="item.title" :key="item.type">
        <template v-if="item.list && item.list.length">
          <p v-for="ListItem in item.list" :key="ListItem.id">{{ ListItem.value }}</p>
        </template>
        <p v-else class="no-data">暂无数据</p>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script>
export default {
  name: 'BaseDropList',
  props: {
    dropMsg: {
      type: Array,
      required: true,
    },
  },
  methods: {
    handleClick () {
      this.$emit('fetchData')
    },
  },
}
</script>

<style lang="scss" scoped>
.cell-drop-list {
  .arrow {
    color: #409EFF;
    cursor: pointer;
    transition: all ease .2s;
  }
  .no-data {
    font-size: 12px;
    color: #909399;
  }
}
.ant-collapse-borderless {
  background: none;
  .ant-collapse-item {
    border-bottom: none;
  }
}
</style>
