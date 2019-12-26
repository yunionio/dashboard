<template>
  <div>
    <page-header title="硬盘快照" />
    <page-body>
      <snapshot-list :list="list" type="disk" />
    </page-body>
  </div>
</template>

<script>
import { steadyStatus } from './constants'
import SnapshotList from './components/List'
import { getTenantFilter, getStatusFilter, getBrandFilter } from '@/utils/common/tableFilter'

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
        steadyStatus,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          status: getStatusFilter(),
          brand: getBrandFilter(),
          tenant: getTenantFilter(),
          storage_type: {
            label: '存储类型',
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'storage_type',
            },
            // items: Object.keys(STORAGE_TYPES).map(k => {
            //   return { label: STORAGE_TYPES[k], key: k }
            // }),
          },
          disk_name: {
            label: '硬盘',
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'disk_name',
            },
          },
          guest: {
            label: '虚拟机',
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'guest',
            },
          },
          disk_type: {
            label: '磁盘类型',
            dropdown: true,
            multiple: true,
            items: [
              { label: '数据盘', key: 'data' },
              { label: '系统盘', key: 'sys' },
            ],
          },
        },
      }),
    }
  },
}
</script>
