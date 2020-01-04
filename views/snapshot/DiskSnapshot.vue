<template>
  <div>
    <page-header title="硬盘快照" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <snapshot-list :list="list" type="disk" :cloud-env="cloudEnv" />
    </page-body>
  </div>
</template>

<script>
import { steadyStatus } from './constants'
import SnapshotList from './components/List'
import { getTenantFilter, getStatusFilter, getBrandFilter } from '@/utils/common/tableFilter'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'VmDiskSnapshotsIndex',
  components: {
    SnapshotList,
  },
  data () {
    return {
      cloudEnvOptions: getCloudEnvOptions('compute_engine_brands'),
      cloudEnv: '',
      list: this.$list.createList(this, {
        id: 'VmDiskSnapshotsList',
        resource: 'snapshots',
        getParams: this.getParam,
        steadyStatus,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('snapshot'),
          brand: getBrandFilter(),
          tenant: getTenantFilter(),
          // storage_type: {
          //   label: '存储类型',
          //   dropdown: true,
          //   multiple: true,
          //   distinctField: {
          //     type: 'field',
          //     key: 'storage_type',
          //   },
          //   // items: Object.keys(STORAGE_TYPES).map(k => {
          //   //   return { label: STORAGE_TYPES[k], key: k }
          //   // }),
          // },
          disk_name: {
            label: '硬盘',
            jointFilter: true,
            filter: true,
            formatter: val => {
              return `disks.id(disk_id).name.contains("${val}")`
            },
          },
          // guest: {
          //   label: '虚拟机',
          //   dropdown: true,
          //   multiple: true,
          //   distinctField: {
          //     type: 'field',
          //     key: 'guest',
          //   },
          // },
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
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        with_meta: true,
        is_instance_snapshot: false,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
  },
}
</script>
