<template>
  <div>
    <page-header :title="$t('compute.text_92')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <baremetal-list :id="listId" :cloud-env="cloudEnv" @refresh="refreshHandle" />
    </page-body>
  </div>
</template>

<script>
import ResStatusTab from '@/sections/ResStatusTab'
import BaremetalList from './components/List'

export default {
  name: 'BaremetalIndex',
  components: {
    BaremetalList,
    ResStatusTab,
  },
  data () {
    return {
      listId: 'BaremetalList',
      cloudEnvOptions: [
        { key: '', label: this.$t('compute.text_4') },
      ],
      cloudEnv: '',
      statusOpts: [],
      statusArr: [],
      errorFilterStatus: [],
      otherFilterStatus: [],
    }
  },
  created () {
    this.resStaticsManager = new this.$Manager('servers/statistics')
    this.fetchResStatistics()
  },
  beforeDestroy () {
    this.serverStaticsManager = null
  },
  methods: {
    fetchResStatistics () {
      this.errorFilterStatus = []
      this.otherFilterStatus = []
      console.log(1)
      this.resStaticsManager.list({
        params: {
          scope: this.$store.getters.scope,
          hypervisor: 'baremetal',
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
      this.fetchResStatistics()
    },
  },
}
</script>
