<template>
  <div>
    <page-header
      :title="$t('dictionary.access_group')"
      isShowResStatusTab
      :status-opts="statusOpts"
      :status-click-handle="statusClickHandle" />
    <page-body>
      <access-group-list
        :id="listId"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        statusResKey="accessGroup"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import AccessGroupList from './components/List'

export default {
  name: 'AccessGroup',
  components: {
    AccessGroupList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'AccessGroupList',
      statusNormalList: ['available'],
    }
  },
}
</script>
