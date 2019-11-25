<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="弹性网卡"
    icon="res-flexnetwork"
    :res-name="data.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <component :is="params.windowData.currentTab" :res-id="params.resId" :data="data" :list="params.list" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import FlexNetworkDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'FlexNetworkSidePage',
  components: {
    FlexNetworkDetail,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'flex-network-detail' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return null
    },
    data () {
      return this.params.list.data[this.params.resId].data
    },
  },
}
</script>
