<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('network.text_571')"
    icon="res-wire"
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
      :id="listId"
      :res-id="detailData.id"
      :data="detailData"
      :getParams="getParams"
      :on-manager="onManager"
      :columns="columns"
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
import NetworkList from './Network'
import WireDetail from './Detail'
import BaremetalsList from './Baremetals'
import HostsList from './Hosts'
import Dashboard from './Dashboard'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'WireSidePage',
  components: {
    WireDetail,
    BaremetalsList,
    HostsList,
    Dashboard,
    Actions,
    NetworkList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('network.text_67'), key: 'wire-detail' },
        { label: this.$t('network.text_565'), key: 'network-list' },
        { label: this.$t('network.text_598'), key: 'baremetals-list' },
        { label: this.$t('network.text_70'), key: 'hosts-list' },
        { label: this.$t('network.text_710'), key: 'dashboard' },
        { label: this.$t('network.text_150'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'network-list') {
        return {
          width_meta: true,
          wire: this.detailData.id,
          details: true,
        }
      }
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForWireSidePage'
        case 'network-list':
          return 'NetworkListForWireSidePage'
        case 'baremetals-list':
          return 'BaremetalsListForWireSidePage'
        case 'hosts-list':
          return 'HostsListForWireSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
