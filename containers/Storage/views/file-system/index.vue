<template>
  <div>
    <page-header
      :title="$t('dictionary.filesystem')"
      :tabs="cloudEnvOptions"
      :current-tab.sync="cloudEnv"
      isShowResStatusTab
      :status-opts="statusOpts"
      :status-click-handle="statusClickHandle" />
    <page-body>
      <file-system-list :id="listId" :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        statusResKey="nas"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import FileSystemList from './components/List'

export default {
  name: 'FileSystem',
  components: {
    FileSystemList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'FileSystemList',
      cloudEnvOptions: getCloudEnvOptions('object_storage_brands'),
      cloudEnv: '',
      statusNormalList: ['available'],
    }
  },
}
</script>
