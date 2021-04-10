<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('network.text_143')"
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
      :id="listId"
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
        { label: this.$t('network.text_67'), key: 'lbcert-detail' },
        { label: this.$t('network.text_138'), key: 'loadbalancerlisteners-list' },
        { label: this.$t('network.text_316'), key: 'lbcert-cache-list' },
        { label: this.$t('network.text_150'), key: 'event-drawer' },
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
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForLbcertSidePage'
        case 'loadbalancerlisteners-list':
          return 'LoadbalancerlistenersListForLbcertSidePage'
        case 'lbcert-cache-list':
          return 'LbcertCacheListForLbcertSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
