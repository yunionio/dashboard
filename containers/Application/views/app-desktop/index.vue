<template>
  <div>
    <page-header
      :title="$t('aice.desktop_llm')"
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
import List from '@Ai/views/llm/components/List'
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'

export default {
  name: 'AppDesktopIndex',
  components: {
    List,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'AppDesktopList',
      statusNormalList: ['running', 'ready'],
    }
  },
}
</script>
