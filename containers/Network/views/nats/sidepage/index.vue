<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('network.text_227')"
    icon="res-nat"
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
import NatDetail from './Detail'
import Snat from './Snat'
import Dnat from './Dnat'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'NatSidePage',
  components: {
    NatDetail,
    Snat,
    Dnat,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {}
  },
  computed: {
    getParams () {
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForNatSidePage'
        default:
          return ''
      }
    },
    detailTabs () {
      const detailTabs = [
        { label: this.$t('network.text_67'), key: 'nat-detail' },
      ]
      if (this.detailData.brand && this.detailData.brand !== 'Aws') {
        detailTabs.push({ label: 'SNAT', key: 'snat' })
        detailTabs.push({ label: 'DNAT', key: 'dnat' })
      }
      detailTabs.push({ label: this.$t('network.text_150'), key: 'event-drawer' })
      return detailTabs
    },
  },
}
</script>
