<template>
  <div>
    <page-header
      :title="$t('compute.text_97')"
      isShowResStatusTab
      :status-opts="statusOpts"
      :status-click-handle="statusClickHandle" />
    <page-body>
      <image-list
        :id="listId"
        :filterParams="filterParams"
        :diskFormats="diskFormats"
        statusResKey="image"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import ImageList from './components/List'

export default {
  name: 'ImageIndex',
  components: {
    ImageList,
  },
  mixins: [ResStatisticsV2Mixin],
  props: {
    diskFormats: {
      type: Array,
    },
  },
  data () {
    return {
      listId: 'ImageList',
      apiVersion: 'v1',
      statusNormalList: ['active'],
    }
  },
}
</script>
