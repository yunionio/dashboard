<template>
  <div>
    <page-header title="硬盘快照" />
    <page-body>
      <snapshot-list :list="list" type="disk" />
    </page-body>
  </div>
</template>

<script>
import SnapshotList from './components/List'

export default {
  name: 'DiskIndex',
  components: {
    SnapshotList,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'VmDiskSnapshotsList',
        resource: 'snapshots',
        getParams: {
          details: true,
          with_meta: true,
          is_instance_snapshot: false,
        },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
        },
      }),
    }
  },
}
</script>
