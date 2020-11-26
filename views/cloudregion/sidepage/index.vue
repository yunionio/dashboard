<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('cloudenv.text_10')"
    icon="res-region"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <component
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :id="listId"
      :data="detailData"
      :on-manager="onManager"
      @tab-change="handleTabChange" />
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
        { label: this.$t('cloudenv.text_237'), key: 'cloudregion-detail' },
        { label: this.$t('cloudenv.text_11'), key: 'zone-list' },
        { label: 'VPC', key: 'v-p-c-list' },
        { label: this.$t('cloudenv.text_181'), key: 'network-list' },
        { label: this.$t('cloudenv.text_319'), key: 'dashboard' },
        { label: this.$t('cloudenv.text_15'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForCloudregionSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
