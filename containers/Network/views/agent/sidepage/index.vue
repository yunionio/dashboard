<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('network.text_20')"
    icon="res-lbagent"
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
import AgentDetail from './Detail'
import Asbook from './Asbook'

export default {
  name: 'AgentSidePage',
  components: {
    AgentDetail,
    Asbook,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  computed: {
    detailTabs () {
      const tabs = [
        { label: this.$t('network.text_67'), key: 'agent-detail' },
        { label: this.$t('network.text_150'), key: 'event-drawer' },
      ]
      if (this.detailData.deployment && this.detailData.deployment.ansible_playbook) {
        tabs.splice(1, 0, { label: this.$t('network.text_151'), key: 'asbook' })
      }
      return tabs
    },
    getParams () {
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForAgentSidePage'
        default:
          return ''
      }
    },
  },
  watch: {
    detailTabs (tabs) {
      if (tabs.length === 2 && this.params.windowData.currentTab === 'asbook') {
        this.handleTabChange('agent-detail')
      }
    },
  },
}
</script>
