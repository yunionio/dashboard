<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('network.text_142')"
    icon="res-lbacl"
    :res-name="detailData.name"
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
import LbaclDetail from './Detail'
import LbaclCacheList from './Cache'
import LbaclListenersList from '@Network/views/loadbalancerlistener/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'LbaclSidePage',
  components: {
    LbaclDetail,
    LbaclListenersList,
    LbaclCacheList,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('network.text_67'), key: 'lbacl-detail' },
        { label: this.$t('network.text_138'), key: 'lbacl-listeners-list' },
        { label: this.$t('network.text_316'), key: 'lbacl-cache-list' },
        { label: this.$t('network.text_150'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (['lbacl-listeners-list', 'lbacl-cache-list'].indexOf(this.params.windowData.currentTab) > -1) {
        return {
          details: true,
          acl_id: this.detailData.id,
        }
      }
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForLbaclSidePage'
        case 'lbacl-listeners-list':
          return 'LbaclListenersListForLbaclSidePage'
        case 'lbacl-cache-list':
          return 'LbaclCacheListForLbaclSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
