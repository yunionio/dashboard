<template>
  <div>
    <page-header :title="$t('network.text_714')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :loading="statisticsLoading"
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <list
        :id="listId"
        :get-params="getParams"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        statusResKey="lb"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import List from './components/List'

export default {
  name: 'LbIndex',
  components: {
    List,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'LbList',
      cloudEnvOptions: getCloudEnvOptions('loadbalancer_brands'),
      cloudEnv: '',
      getParams: {
        details: true,
      },
      resStaticsResource: 'loadbalancers',
    }
  },
  methods: {
    getStatusOpts (data) {
      const { enabled = {}, disabled = {} } = data
      // 统计
      let total = 0
      let other = 0
      for (const k in data) {
        total += data[k].total_count
        if (!['enabled', 'disabled'].includes(k)) {
          this.otherFilterStatus.push(k)
          other += data[k].total_count
        }
      }
      const statusOpts = [
        { title: this.$t('compute.text_576'), type: 'total', num: total },
        { title: this.$t('status.enabled.true'), type: 'enabled', num: enabled?.total_count || 0 },
        { title: this.$t('status.enabled.false'), type: 'disabled', num: disabled?.total_count || 0 },
        { title: this.$t('compute.text_674'), type: 'other', num: other },
      ]
      return statusOpts
    },
  },
}
</script>
