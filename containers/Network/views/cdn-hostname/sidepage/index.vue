<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.cdn_domain')"
    icon="res-cdn"
    :res-name="detailData.hostname"
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
      :cdn-id="detailData.id"
      taskResource="compute-tasks"
      @side-page-trigger-handle="sidePageTriggerHandle"
      @init-side-page-tab="initSidePageTab"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import ColumnsMixin from '../mixins/columns'
import CdnHostnameDetail from './Detail'

export default {
  name: 'CdnHostnameSidePage',
  components: {
    CdnHostnameDetail,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin],
  data () {
    return {
    }
  },
  computed: {
    detailTabs () {
      return [
        { label: this.$t('network.text_67'), key: 'cdn-hostname-detail' },
      ]
    },
    getParams () {
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForCDNSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
