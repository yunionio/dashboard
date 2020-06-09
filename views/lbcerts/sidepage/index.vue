<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="证书"
    icon="res-lbcert"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :res-id="detailData.id"
      :data="detailData"
      :getParams="getParams"
      :on-manager="onManager"
      @side-page-trigger-handle="sidePageTriggerHandle"
      @init-side-page-tab="initSidePageTab"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import LbcertDetail from './Detail'
import LbcertCacheList from './Cache'
import LoadbalancerlistenersList from '@Network/views/loadbalancerlistener/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'LbcertSidePage',
  components: {
    LbcertDetail,
    LbcertCacheList,
    LoadbalancerlistenersList,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'lbcert-detail' },
        { label: '监听', key: 'loadbalancerlisteners-list' },
        { label: '缓存列表', key: 'lbcert-cache-list' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (['loadbalancerlisteners-list', 'lbcert-cache-list'].indexOf(this.params.windowData.currentTab) > -1) {
        return {
          details: true,
          certificate_id: this.detailData.id,
        }
      }
      return null
    },
  },
}
</script>
