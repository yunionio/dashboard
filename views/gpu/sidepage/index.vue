<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.text_113')"
    icon="res-gpu"
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
      :res-id="data.resId"
      :id="listId"
      :data="detailData"
      :on-manager="onManager"
      :getParams="getParams" />
  </base-side-page>
</template>

<script>
import serversList from '../../vminstance/components/List'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import GpuDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'GpuSidePage',
  components: {
    GpuDetail,
    serversList,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'gpu-detail' },
        { label: this.$t('compute.text_483', [this.$t('dictionary.server')]), key: 'servers-list' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'servers-list') {
        return {
          filter: `id.equals(${this.detailData.guest_id})`,
        }
      }
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForGpuSidePage'
        case 'servers-list':
          return 'ServersListForGpuSidePage'
        default:
          return ''
      }
    },
  },
  created () {
    if (this.params.tab) this.handleTabChange(this.params.tab)
  },
}
</script>
