<template>
  <div>
    <page-header :title="$t('network.text_571')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :loading="statisticsLoading"
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <wire-list
      :id="listId"
      :cloud-env="cloudEnv"
      :cloudEnvOptions="cloudEnvOptions"
      :filterParams="filterParams"
      statusResKey="wire"
      @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import WireList from './components/List'

export default {
  name: 'WireIndex',
  components: {
    WireList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'WireList',
      cloudEnvOptions: getCloudEnvOptions('network_brands').filter(item => item.key !== 'public'),
      cloudEnv: '',
      resStaticsResource: 'wires',
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
        { title: this.$t('status.wire.available'), type: 'available', num: available?.total_count || 0 },
        { title: this.$t('common_623', [this.$t('scope.text_61')]), type: 'error', num: error },
        { title: this.$t('compute.text_674'), type: 'other', num: other },
      ]
      return statusOpts
    },
  },
}
</script>
