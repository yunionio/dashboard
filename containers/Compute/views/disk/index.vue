<template>
  <div>
    <page-header
      :title="$t('compute.text_100')"
      :tabs="cloudEnvOptions"
      :current-tab.sync="cloudEnv"
      isShowResStatusTab
      :status-opts="statusOpts"
      :status-click-handle="statusClickHandle" />
    <page-body>
      <disk-list
        :id="listId"
        :getParams="getParams"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        statusResKey="disk"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import DiskList from './components/List'

export default {
  name: 'DiskIndex',
  components: {
    DiskList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'DiskList',
      getParams: {
        details: true,
        'filter.0': 'disk_type.notin(volume)',
      },
      cloudEnvOptions: getCloudEnvOptions('compute_engine_brands'),
      cloudEnv: '',
      statusModule: 'disk',
      statusNormalList: ['ready'],
    }
  },
}
</script>
