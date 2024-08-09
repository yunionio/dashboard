<template>
  <div>
   <page-header :title="$t('dictionary.vpc')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv">
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
      :cloud-env="cloudEnv"
      :get-params="getParams"
      :cloudEnvOptions="cloudEnvOptions"
      :filterParams="filterParams"
      statusResKey="vpc"
      @resStatisticsChange="resStatisticsChange" />
   </page-body>
  </div>
</template>

<script>
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import List from './components/List'

export default {
  name: 'VPCIndex',
  components: {
    List,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'VpcList',
      cloudEnvOptions: getCloudEnvOptions('network_manage_brands'),
      cloudEnv: '',
      getParams: {
        details: true,
      },
      resStaticsResource: 'vpcs',
    }
  },
  methods: {
    getStatusOpts (data) {
      const { available = {} } = data
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
          if (!['available'].includes(k)) {
            this.otherFilterStatus.push(k)
            other += data[k].total_count
          }
        }
      }
      const statusOpts = [
        { title: this.$t('compute.text_576'), type: 'total', num: total },
        { title: this.$t('status.vpc.available'), type: 'available', num: available?.total_count || 0 },
        { title: this.$t('common_623', [this.$t('scope.text_61')]), type: 'error', num: error },
        { title: this.$t('compute.text_674'), type: 'other', num: other },
      ]
      return statusOpts
    },
  },
}
</script>
