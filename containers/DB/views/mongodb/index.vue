<template>
  <div>
    <page-header
     :title="$t('dictionary.mongodb')"
     isShowResStatusTab
     :status-opts="statusOpts"
     :status-click-handle="statusClickHandle" />
    <page-body>
      <mongodb-list
        :id="listId"
        :filterParams="filterParams"
        statusResKey="mongodb"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import mongodbList from './components/List'

export default {
  name: 'MongoDBIndex',
  components: {
    mongodbList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'MongoDBList',
      statusNormalList: ['running'],
    }
  },
}
</script>
