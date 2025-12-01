<template>
  <base-side-page
    ref="sidePage"
    @cancel="cancelSidePage"
    :title="$t('compute.text_113')"
    icon="passthrough"
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
      :id="listId"
      :data="detailData"
      :on-manager="onManager"
      :getParams="getParams" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import AssociatedInstances from './AssociatedInstances'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import GpuDetail from './Detail'

export default {
  name: 'GpuSidePage',
  components: {
    GpuDetail,
    Actions,
    AssociatedInstances,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'gpu-detail' },
        { label: this.$t('compute.associated_instances'), key: 'associated-instances' },
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
        case 'associated-instances':
          return 'AssociatedGpusForGpuSidePage'
        default:
          return ''
      }
    },
  },
  created () {
    if (this.params.tab) this.handleTabChange(this.params.tab)
    this.$bus.$on('gpu-sidepage-refresh', () => {
      this.fetchData()
    })
  },
}
</script>
