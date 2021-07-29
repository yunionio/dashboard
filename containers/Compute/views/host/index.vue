<template>
  <div>
    <page-header :title="$t('compute.text_111')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <server-error-status-tab
        resource="hosts"
        status="host"
        @getStatusCheckArr="getStatusCheckArr" />
      <host-list :get-params="listParams" :id="listId" @refresh="refreshHandle" />
    </page-body>
  </div>
</template>

<script>
import HostList from './components/List'
import ResStatusTab from '@/sections/ResStatusTab'
export default {
  name: 'HostIndex',
  components: {
    HostList,
    ResStatusTab,
  },
  data () {
    return {
      listId: 'HostList',
      listParams: {
        details: true,
        baremetal: false,
      },
      statusOpts: [],
      statusArr: [],
      errorFilterStatus: [],
      otherFilterStatus: [],
    }
  },
  created () {
    this.resStaticsManager = new this.$Manager('hosts/statistics')
    this.fetchResStatistics()
  },
  beforeDestroy () {
    this.resStaticsManager = null
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
    fetchResStatistics () {
      this.errorFilterStatus = []
      this.otherFilterStatus = []
      this.resStaticsManager.list({
        params: {
          scope: this.$store.getters.scope,
        },
      }).then(res => {
        const { ready = {}, running = {} } = res.data

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
          { title: this.$t('compute.text_574'), type: 'running', num: running?.total_count || 0 },
          { title: this.$t('compute.text_273'), type: 'ready', num: ready?.total_count || 0 },
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
