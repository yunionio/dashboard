<template>
  <div>
    <template v-if="isGlobalSearch">
      <snapshot-list :list="list" v-bind="$props" />
    </template>
    <template v-else>
      <page-header :title="$t('compute.text_102')" />
      <page-body>
        <snapshot-list :list="list" v-bind="$props" />
      </page-body>
    </template>
  </div>
</template>

<script>
import { steadyStatus } from './constants'
import SnapshotList from './components/List'
import { getTenantFilter, getStatusFilter, getDomainFilter } from '@/utils/common/tableFilter'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'VmInstanceSnapshotsIndex',
  components: {
    SnapshotList,
  },
  mixins: [GlobalSearchMixin],
  data () {
    return {
      cloudEnvOptions: getCloudEnvOptions('compute_engine_brands'),
      cloudEnv: '',
      list: this.$list.createList(this, {
        id: 'VmInstanceSnapshotsList',
        resource: 'instance_snapshots',
        getParams: this.getParam,
        steadyStatus,
        filterOptions: {
          name: {
            label: this.$t('compute.text_228'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('snapshot'),
          projects: getTenantFilter(),
          domain: getDomainFilter(),
          region: {
            label: '区域',
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
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
  },
}
</script>
