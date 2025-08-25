<template>
  <div>
    <page-header
      :title="$t('storage.text_37')"
      :tabs="cloudEnvOptions"
      :current-tab.sync="cloudEnv"
      isShowResStatusTab
      :status-opts="statusOpts"
      :status-click-handle="statusClickHandle" />
    <page-body>
      <list
        :id="listId"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        statusResKey="blockstorage"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import List from './components/List'

export default {
  name: 'BlockAtorage',
  components: {
    List,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'BlockStorageList',
      cloudEnvOptions: [
        { key: 'host', label: this.$t('compute.text_111') },
        { key: 'baremetal', label: this.$t('compute.text_112') },
      ],
      cloudEnv: 'host',
      statusModule: 'blockstorage',
      statusNormalList: ['online', 'offline', 'unmount'],
      statusHiddenList: ['error'],
    }
  },
}
</script>
