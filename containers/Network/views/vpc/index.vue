<template>
  <div>
   <page-header :title="$t('dictionary.vpc')"
    :tabs="cloudEnvOptions"
    :current-tab.sync="cloudEnv"
    isShowResStatusTab
    :status-opts="statusOpts"
    :status-click-handle="statusClickHandle" />
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
      statusNormalList: ['available'],
    }
  },
}
</script>
