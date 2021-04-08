<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.access_group')"
    icon="res-nas"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
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
import ColumnsMixin from '../mixins/columns'
import AccessGroupDetail from './Detail'
import AccessGroupRule from './Rule'
import AccessGroupCache from './Cache'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'AccessGroupSidePage',
  components: {
    AccessGroupDetail,
    AccessGroupRule,
    AccessGroupCache,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('storage.text_81'), key: 'access-group-detail' },
        { label: this.$t('dictionary.access_group_rule'), key: 'access-group-rule' },
        { label: this.$t('dictionary.access_group_cache'), key: 'access-group-cache' },
        { label: this.$t('dictionary.actions'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        id: this.data.id,
      }
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForNasSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
