<template>
  <base-side-page
      @cancel="cancelSidePage"
      :title="$t('network.ssh-proxy.endpoints')"
      icon="res-ssh-agent"
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
import SshAgentDetail from './Detail'

export default {
  name: 'SshAgentSidePage',
  components: {
    SshAgentDetail,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('network.text_67'), key: 'SshAgent-detail' },
        { label: this.$t('network.text_150'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        cluster: this.detailData.id,
      }
    },
    listId () {
      return ''
    },
  },
}
</script>
