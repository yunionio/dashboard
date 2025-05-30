<template>
  <div>
    <page-header :title="$t('network.text_714')"
     :tabs="cloudEnvOptions"
     :current-tab.sync="cloudEnv"
     isShowResStatusTab
     :status-opts="statusOpts"
     :status-click-handle="statusClickHandle" />
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
      cloudEnvOptions: getCloudEnvOptions('loadbalancer_engine_brands'),
      cloudEnv: '',
      getParams: {
        details: true,
      },
      statusNormalList: ['enabled', 'disabled'],
      statusHiddenList: ['fail'],
    }
  },
}
</script>
