<template>
  <div class="disk-list">
    <a-form-item label="磁盘配置">
      <a-list
        :locale="locale"
        itemLayout="horizontal"
        :dataSource="diskList">
        <a-list-item slot="renderItem" slot-scope="item">
          {{ item.title }}
        </a-list-item>
      </a-list>
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: 'DiskList',
  props: {},
  data () {
    return {
      locale: {
        emptyText: '暂无数据',
      },
      diskList: [],
    }
  },
}
</script>
<style>

</style>
