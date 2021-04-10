<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('cloudenv.text_11')"
    icon="res-zone"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :id="listId"
      :data="detailData"
      :on-manager="onManager"
      :getParams="getParams"
      @side-page-trigger-handle="sidePageTriggerHandle"
      @init-side-page-tab="initSidePageTab"
      @single-refresh="singleRefresh" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import ZoneDetail from './Detail'
import Dashboard from './Dashboard'
import HostList from './Host'
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
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('cloudenv.text_237'), key: 'zone-detail' },
        { label: this.$t('cloudenv.text_101'), key: 'host-list' },
        { label: this.$t('cloudenv.text_319'), key: 'dashboard' },
        { label: this.$t('cloudenv.text_15'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'host-list') {
        return () => {
          return {
            zone: this.data.id,
            details: true,
          }
        }
      }
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForZoneSidePage'
        case 'host-list':
          return 'HostListForZoneSidePage'
        default:
          return ''
      }
    },
    hiddenActions () {
      return this.params.hiddenActions || []
    },
  },
}
</script>
