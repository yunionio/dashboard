<template>
  <div>
    <page-header :title="$t('dictionary.dbinstance')">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :loading="statisticsLoading"
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <rds-list
        :id="listId"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        statusResKey="rds"
        @refresh="refreshHandle"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import rdsList from './components/List'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'

export default {
  name: 'RDSIndex',
  components: {
    rdsList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'RDSList',
      cloudEnvOptions: getCloudEnvOptions('rds_brands'),
      cloudEnv: '',
      resStaticsResource: 'dbinstances',
    }
  },
  methods: {
    createServer () {
      this.$router.push('/rds/create')
    },
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
        { title: this.$t('status.rds.running'), type: 'running', num: running?.total_count || 0 },
        { title: this.$t('common_623', [this.$t('scope.text_61')]), type: 'error', num: error },
        { title: this.$t('compute.text_674'), type: 'other', num: other },
      ]
      return statusOpts
    },
  },
}
</script>
