<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.tap_service')"
    icon="res-secgroup"
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
      :id="listId"
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :data="detailData"
      :getParams="getParams"
      res-type="secgroup"
      :on-manager="onManager"
      :columns="columns"
      :hidden-columns="hiddenColumns"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import TapFlowList from './TapFlow'
import TapServiceDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'TapServiceSidePage',
  components: {
    TapServiceDetail,
    Actions,
    TapFlowList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'tap-service-detail' },
        { label: this.$t('dictionary.tap_flow'), key: 'tap-flow-list' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'tap-flow-list') {
        return {
          tap_id: this.detailData.id,
        }
      }
      return null
    },
    hiddenActions () {
      return this.params.hiddenActions || []
    },
    hiddenColumns () {
      return this.params.hiddenColumns || []
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'tap-flow-list':
          return 'TapFlowListForTapServiceSidePage'
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
