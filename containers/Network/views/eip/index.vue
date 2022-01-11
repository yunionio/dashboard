<template>
  <div>
    <page-header :title="$t('network.text_221')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <eip-list
        :id="listId"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        statusRes="eip" />
    </page-body>
  </div>
</template>

<script>
import EipList from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsMixin from '@/mixins/resStatisticsMixin'

export default {
  name: 'EipIndex',
  components: {
    EipList,
  },
  mixins: [ResStatisticsMixin],
  data () {
    return {
      listId: 'EipList',
      cloudEnvOptions: getCloudEnvOptions('network_manage_brands'),
      cloudEnv: '',
      resStaticsResource: 'eips',
    }
  },
  created () {
    this.fetchResStatistics({
      scope: this.$store.getters.scope,
    }, (resData) => {
      return this.getStatusOpts(resData)
    })
  },
  methods: {
    getStatusOpts (data) {
      const { ready = {} } = data
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
          if (!['ready'].includes(k)) {
            this.otherFilterStatus.push(k)
            other += data[k].total_count
          }
        }
      }
      const statusOpts = [
        { title: this.$t('compute.text_576'), type: 'total', num: total },
        { title: this.$t('status.eip.ready'), type: 'ready', num: ready?.total_count || 0 },
        { title: this.$t('common_623', [this.$t('scope.text_61')]), type: 'error', num: error },
        { title: this.$t('compute.text_674'), type: 'other', num: other },
      ]
      return statusOpts
    },
  },
}
</script>
