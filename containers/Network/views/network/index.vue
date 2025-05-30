<template>
  <div>
    <page-header
     :title="$t('network.text_565')"
     :tabs="cloudEnvOptions"
     :current-tab.sync="cloudEnv"
     isShowResStatusTab
     :status-opts="statusOpts"
     :status-click-handle="statusClickHandle" />
    <page-body>
      <network-list
        ref="list"
        :id="listId"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        statusResKey="network"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import KeepAliveMixin from '@/mixins/keepAlive'
import NetworkList from './components/List'

export default {
  name: 'NetworkIndex',
  components: {
    NetworkList,
  },
  mixins: [ResStatisticsV2Mixin, KeepAliveMixin],
  data () {
    return {
      listId: 'NetworkList',
      cloudEnvOptions: getCloudEnvOptions('network_manage_brands'),
      cloudEnv: '',
      statusNormalList: ['available'],
    }
  },
}
</script>
