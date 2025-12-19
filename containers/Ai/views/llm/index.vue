<template>
  <div>
    <page-header
      :title="$t('aice.llm')"
      isShowResStatusTab
      :status-opts="statusOpts"
      :status-click-handle="statusClickHandle" />
    <page-body>
      <list
        :id="listId"
        :filterParams="filterParams"
        statusResKey="server"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import List from './components/List'

export default {
  name: 'PhoneIndex',
  components: {
    List,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'PhoneList',
      statusNormalList: ['running', 'ready'],
    }
  },
}
</script>
