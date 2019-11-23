<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="可用区"
    icon="res-zone"
    :res-name="data.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="params.resId" :data="data" :list="params.list" :cloudprovider-id="params.resId" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import HostList from '@Compute/views/host/components/List'
import ZoneDetail from './Detail'
import Dashboard from './Dashboard'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'ZoneSidePage',
  components: {
    Actions,
    ZoneDetail,
    HostList,
    Dashboard,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'zone-detail' },
        { label: '宿主机', key: 'host-list' },
        { label: '资源统计', key: 'dashboard' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'host-list') {
        return () => {
          return {
            zone: this.params.resId,
            details: true,
          }
        }
      }
      return null
    },
    data () {
      return this.params.list.data[this.params.resId].data
    },
  },
}
</script>
