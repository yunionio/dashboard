<template>
  <div>
    <page-header
      :title="$t('aice.mounted_apps')"
      isShowResStatusTab
      :status-opts="statusOpts"
      :status-click-handle="statusClickHandle" />
    <page-body>
      <list :id="listId" :filterParams="filterParams" statusResKey="image" @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import List from './components/List'

export default {
  name: 'PhoneInstantAppIndex',
  components: {
    List,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'PhoneInstantAppList',
      statusNormalList: ['active'],
    }
  },
}
</script>
