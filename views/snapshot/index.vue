<template>
  <div>
    <template v-if="isGlobalSearch">
      <snapshot-list :list="list" v-bind="$props" />
    </template>
    <template v-else>
      <page-header title="硬盘快照" />
      <page-body>
        <snapshot-list :list="list" />
      </page-body>
    </template>
  </div>
</template>

<script>
import { steadyStatus } from './constants'
import SnapshotList from './components/List'
import { getTenantFilter, getStatusFilter, getBrandFilter } from '@/utils/common/tableFilter'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'VmDiskSnapshotsIndex',
  components: {
    SnapshotList,
  },
  mixins: [GlobalSearchMixin],
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
          projects: getTenantFilter(),
          disk_name: {
            label: '硬盘',
            jointFilter: true,
            filter: true,
            formatter: val => {
              return `disks.id(disk_id).name.contains("${val}")`
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
        responseData: this.responseData,
      }),
    }
  },
  computed: {
    isGlobalSearch () {
      return this.responseData && this.showGroupActions === false && this.showSearchbox === false
    },
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
