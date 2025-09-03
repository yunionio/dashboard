<template>
  <div>
    <page-header
     :title="$t('network.text_571')"
     :tabs="cloudEnvOptions"
     :current-tab.sync="cloudEnv"
     isShowResStatusTab
     :status-opts="statusOpts"
     :status-click-handle="statusClickHandle" />
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
      statusNormalList: ['available'],
    }
  },
}
</script>
