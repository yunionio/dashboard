<template>
  <div>
    <page-header
     :title="$t('dictionary.dbinstance')"
     isShowResStatusTab
     :status-opts="statusOpts"
     :status-click-handle="statusClickHandle" />
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
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import rdsList from './components/List'

export default {
  name: 'RDSIndex',
  components: {
    rdsList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'RDSList',
      cloudEnvOptions: getCloudEnvOptions('rds_engine_brands'),
      cloudEnv: '',
      statusNormalList: ['running'],
    }
  },
  methods: {
    createServer () {
      this.$router.push('/rds/create')
    },
  },
}
</script>
