<template>
  <div>
    <page-header
      :title="$t('dictionary.filesystem')"
      isShowResStatusTab
      :status-opts="statusOpts"
      :status-click-handle="statusClickHandle" />
    <page-body>
      <file-system-list
        :id="listId"
        :filterParams="filterParams"
        statusResKey="nas"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
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
      statusNormalList: ['available'],
    }
  },
}
</script>
