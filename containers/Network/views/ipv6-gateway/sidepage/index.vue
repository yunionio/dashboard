<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.ipv6_gateway')"
    icon="res-ipv6-gateway"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <!-- <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template> -->
    <component
      :is="params.windowData.currentTab"
      :id="listId"
      :res-id="detailData.id"
      :data="detailData"
      :getParams="getParams"
      :on-manager="onManager"
      :columns="columns"
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
import Ipv6GatewayDetail from './Detail'

export default {
  name: 'Ipv6GatewaySidePage',
  components: {
    Ipv6GatewayDetail,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin],
  data () {
    const tabs = [
      { label: this.$t('network.text_67'), key: 'ipv6-gateway-detail' },
      { label: this.$t('network.text_150'), key: 'event-drawer' },
    ]

    return {
      detailTabs: tabs,
    }
  },
  computed: {
    getParams () {
      const params = {}
      return params
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForLbSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
