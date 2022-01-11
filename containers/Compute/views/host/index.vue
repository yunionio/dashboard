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
      <host-list
        :get-params="listParams"
        :id="listId"
        :filterParams="filterParams"
        @refresh="refreshHandle" />
    </page-body>
  </div>
</template>

<script>
import HostList from './components/List'
import ResStatisticsMixin from '@/mixins/resStatisticsMixin'

export default {
  name: 'HostIndex',
  components: {
    HostList,
  },
  mixins: [ResStatisticsMixin],
  data () {
    return {
      listId: 'HostList',
      listParams: {
        details: true,
        baremetal: false,
      },
      resStaticsResource: 'hosts',
    }
  },
  created () {
    this.fetchResStatistics({
      scope: this.$store.getters.scope,
      baremetal: false,
    }, (resData) => {
      return this.getStatusOpts(resData)
    })
  },
  methods: {
    getStatusOpts (data) {
      const { running = {} } = data
      // 统计
      let total = 0
      let error = 0
      let other = 0
      for (const k in data) {
        total += data[k].total_count
        if (new RegExp('fail').test(k)) {
          this.errorFilterStatus.push(k)
          error += data[k].total_count
        } else {
          if (!['running'].includes(k)) {
            this.otherFilterStatus.push(k)
            other += data[k].total_count
          }
        }
      }
      const statusOpts = [
        { title: this.$t('compute.text_576'), type: 'total', num: total },
        { title: this.$t('status.host.running'), type: 'running', num: running?.total_count || 0 },
        { title: this.$t('common_623', [this.$t('scope.text_61')]), type: 'error', num: error },
        { title: this.$t('compute.text_674'), type: 'other', num: other },
      ]
      return statusOpts
    },
  },
}
</script>
