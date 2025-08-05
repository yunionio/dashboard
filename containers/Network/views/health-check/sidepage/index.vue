<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('network.health_check')"
    icon="res-health-check"
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
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import Detail from './Detail'

export default {
  name: 'HealthCheckSidePage',
  components: {
    Detail,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    const tabs = [
      { label: this.$t('network.text_67'), key: 'detail' },
      { label: this.$t('network.text_150'), key: 'event-drawer' },
    ]

    return {
      detailTabs: tabs,
    }
  },
  computed: {
    getParams () {
      const params = {
        // loadbalancer: this.detailData.id,
      }
      // if (this.params.windowData.currentTab === 'loadbalancerbackendgroups-list') {
      //   if (this.detailData.provider && this.detailData.provider.toLowerCase() === 'aliyun') {
      //     params['filter.0'] = 'type.notequals("default")'
      //   }
      // }
      return params
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForHealthCheckSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
