<template>
  <div>
    <page-header
     :title="`${$t('dictionary.guestimage')}`"
     isShowResStatusTab
     :status-opts="statusOpts"
     :status-click-handle="statusClickHandle" />
    <page-body>
      <host-image-list
        :id="listId"
        :filterParams="filterParams"
        statusResKey="image"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import HostImageList from './components/List'

export default {
  name: 'HostImageIndex',
  components: {
    HostImageList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'HostImageList',
      apiVersion: 'v1',
      statusNormalList: ['active'],
    }
  },
}
</script>
