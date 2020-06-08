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
    <component :is="params.windowData.currentTab" :res-id="data.id" :data="detailData" :on-manager="onManager" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import CloudregionDetail from './Detail'
import Dashboard from './Dashboard'
import ZoneList from '@Cloudenv/views/zone/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudregionSidePage',
  components: {
    CloudregionDetail,
    ZoneList,
    Dashboard,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'cloudregion-detail' },
        { label: '可用区', key: 'zone-list' },
        { label: '资源统计', key: 'dashboard' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'zone-list') {
        return {
          details: true,
          with_meta: true,
          cloud_env: 'private_or_onpremise',
          cloudregion_id: this.data.id,
        }
      }
      return null
    },
  },
}
</script>
