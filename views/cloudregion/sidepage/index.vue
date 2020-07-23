<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="区域"
    icon="res-region"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <component :is="params.windowData.currentTab" :res-id="data.id" :data="detailData" :on-manager="onManager" @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import CloudregionDetail from './Detail'
import Dashboard from './Dashboard'
import VPCList from './VPCList'
import NetworkList from './NetworkList'
import ZoneList from './ZoneList'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudregionSidePage',
  components: {
    CloudregionDetail,
    ZoneList,
    Dashboard,
    VPCList,
    NetworkList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'cloudregion-detail' },
        { label: '可用区', key: 'zone-list' },
        { label: 'VPC', key: 'v-p-c-list' },
        { label: 'IP子网', key: 'network-list' },
        { label: '资源统计', key: 'dashboard' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
}
</script>
