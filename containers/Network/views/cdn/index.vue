<template>
  <div>
    <page-header :title="$t('dictionary.cdn_domain')"
     isShowResStatusTab
     :status-opts="statusOpts"
     :status-click-handle="statusClickHandle" />
    <page-body>
      <domain-list
        :id="listId"
        :filterParams="filterParams"
        statusResKey="cdnDomain"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import DomainList from './components/List'

export default {
  name: 'DomainIndex',
  components: {
    DomainList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'DomainList',
      statusNormalList: ['online', 'offline'],
    }
  },
}
</script>
