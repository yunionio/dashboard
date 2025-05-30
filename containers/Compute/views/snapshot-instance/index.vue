<template>
  <div>
    <page-header
     :title="$t('compute.text_102')"
     :tabs="cloudEnvOptions"
     :current-tab.sync="cloudEnv"
     isShowResStatusTab
     :status-opts="statusOpts"
     :status-click-handle="statusClickHandle" />
    <page-body>
      <snapshot-list
        :id="listId"
        :cloud-env="cloudEnv"
        :filterParams="filterParams"
        statusResKey="snapshot"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import SnapshotList from './components/List'

export default {
  name: 'VmInstanceSnapshotsIndex',
  components: {
    SnapshotList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'VmInstanceSnapshotsList',
      cloudEnvOptions: getCloudEnvOptions('compute_engine_brands'),
      cloudEnv: '',
      statusNormalList: ['ready'],
    }
  },
}
</script>
