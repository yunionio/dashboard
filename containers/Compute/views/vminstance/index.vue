<template>
  <div>
    <page-header
      :title="$t('compute.text_91')"
      :tabs="cloudEnvOptions"
      :current-tab.sync="cloudEnv"
      isShowResStatusTab
      :status-opts="statusOpts"
      :status-click-handle="statusClickHandle" />
    <page-body>
      <vm-instance-list
        ref="list"
        :id="listId"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        :tableOverviewIndexs="tableOverviewIndexs"
        statusResKey="server"
        @updateCloudEnvOptions="updateCloudEnvOptions"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import KeepAliveMixin from '@/mixins/keepAlive'
import VmInstanceList from './components/List'

export default {
  name: 'VMInstanceIndex',
  components: {
    VmInstanceList,
  },
  mixins: [ResStatisticsV2Mixin, KeepAliveMixin],
  data () {
    return {
      listId: 'VMInstanceList',
      cloudEnv: '',
      statusModule: 'server',
    }
  },
  computed: {
    cloudEnvOptions: () => {
      return getCloudEnvOptions('compute_engine_brands')
    },
  },
}
</script>
