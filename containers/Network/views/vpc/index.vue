<template>
  <div>
   <page-header :title="$t('dictionary.vpc')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv">
     <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
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
      statusRes="vpc" />
   </page-body>
  </div>
</template>

<script>
import List from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsMixin from '@/mixins/resStatisticsMixin'

export default {
  name: 'VPCIndex',
  components: {
    List,
  },
  mixins: [ResStatisticsMixin],
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
  created () {
    this.fetchResStatistics({
      scope: this.$store.getters.scope,
    }, (resData) => {
      return this.getStatusOpts(resData)
    })
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
