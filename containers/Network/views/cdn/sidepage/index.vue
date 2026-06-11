<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.cdn_domain')"
    icon="res-cdn"
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
import CdnHostname from '@Network/views/cdn-hostname/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import CdnDetail from './Detail'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
export default {
  name: 'CDNSidePage',
  components: {
    CdnDetail,
    Actions,
    CdnHostname,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
    }
  },
  computed: {
    detailTabs () {
      return [
        { label: this.$t('network.text_67'), key: 'cdn-detail' },
        { label: this.$t('network.cdn_custom_hostname'), key: 'cdn-hostname' },
        { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('network.text_150'), key: 'event-drawer' },
      ].filter(item => {
        if (this.detailData?.provider !== 'Cloudflare' && item.key === 'cdn-hostname') {
          return false
        }
        return true
      })
    },
    getParams () {
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForCDNSidePage'
        case 'cdn-hostname':
          return 'CdnHostnameListForCDNSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
