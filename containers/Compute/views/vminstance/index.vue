<template>
  <div>
    <page-header :title="$t('compute.text_91')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <vm-instance-list
        :id="listId"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        @updateCloudEnvOptions="updateCloudEnvOptions"
        @refresh="refreshHandle" />
    </page-body>
  </div>
</template>

<script>
import VmInstanceList from './components/List'
import ResStatusTab from '@/sections/ResStatusTab'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'VmInstanceIndex',
  components: {
    VmInstanceList,
    ResStatusTab,
  },
  data () {
    return {
      listId: 'VMInstanceList',
      cloudEnv: '',
      filterParams: {},
      statusOpts: [],
      statusArr: [],
      errorFilterStatus: [],
      otherFilterStatus: [],
    }
  },
  computed: {
    cloudEnvOptions: () => {
      return getCloudEnvOptions('compute_engine_brands')
    },
  },
  created () {
    this.serverStaticsManager = new this.$Manager('servers/statistics2')
    this.fetchServersStatistics()
  },
  beforeDestroy () {
    this.serverStaticsManager = null
  },
  methods: {
    getStatusCheckArr (statusCheckArr, statusArr, isFirstLoad) {
      if (statusCheckArr && statusCheckArr.length > 0) {
        this.filterParams = {
          statusCheckArr: statusCheckArr,
          statusArr: statusArr,
          isFirstLoad: isFirstLoad,
        }
      } else {
        this.filterParams = {
          statusCheckArr: [],
          isFirstLoad: isFirstLoad,
        }
      }
    },
    statusClickHandle (obj) {
      let statusCheckArr = []
      if (obj.num > 0) {
        switch (obj.type) {
          case 'total':
            statusCheckArr = []
            break
          case 'error':
            statusCheckArr = [...this.errorFilterStatus]
            break
          case 'other':
            statusCheckArr = [...this.otherFilterStatus]
            break
          default:
            statusCheckArr = [obj.type]
        }
        this.filterParams = {
          statusCheckArr,
          statusArr: this.statusArr,
        }
      }
    },
    fetchServersStatistics () {
      this.errorFilterStatus = []
      this.otherFilterStatus = []
      this.serverStaticsManager.list({
        params: {
          scope: this.$store.getters.scope,
        },
      }).then(res => {
        const { ready, running } = res.data

        // 统计
        let total = 0
        let error = 0
        let other = 0
        for (const k in res.data) {
          total += res.data[k].total_count
          if (new RegExp('fail').test(k)) {
            this.errorFilterStatus.push(k)
            error += res.data[k].total_count
          } else {
            if (!['running', 'ready'].includes(k)) {
              this.otherFilterStatus.push(k)
              other += res.data[k].total_count
            }
          }
        }

        const statusOpts = [
          { title: this.$t('compute.text_576'), type: 'total', num: total },
          { title: this.$t('compute.text_574'), type: 'running', num: running.total_count },
          { title: this.$t('compute.text_273'), type: 'ready', num: ready.total_count },
          { title: this.$t('common_623', [this.$t('scope.text_61')]), type: 'error', num: error },
          { title: this.$t('compute.text_674'), type: 'other', num: other },
        ]
        this.statusOpts = statusOpts
        this.statusArr = Object.keys(res.data)
      }).catch(err => {
        console.error(err)
        this.statusOpts = []
      })
    },
    refreshHandle () {
      this.fetchServersStatistics()
    },
  },
}
</script>
