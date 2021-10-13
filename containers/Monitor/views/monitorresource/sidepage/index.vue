<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="title"
    icon="res-commonalert"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <component
      :is="params.windowData.currentTab"
      :listId="listId"
      :id="listId"
      :resId="data.id"
      :data="detailData"
      :resource="resource"
      :resType="resType"
      :on-manager="onManager"
      :getParams="listParams"
      :serverColumns="columns" />
  </base-side-page>
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import CommonalertList from '@Monitor/views/commonalert/components/List'
import VmInstanceMonitorSidepage from './Monitor'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'MonitorResourceSidePage',
  components: {
    CommonalertList,
    VmInstanceMonitorSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin],
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForHostSidePage'
        case 'CommonalertList':
          return 'CommonalertListSidePage'
        case 'vm-instance-monitor-sidepage':
          return 'VmInstanceMonitorSidepage'
        default:
          return ''
      }
    },
    detailTabs () {
      const tabs = [
        { label: this.$t('monitor.text_122'), key: 'vm-instance-monitor-sidepage' },
        { label: this.$t('dictionary.commonalert'), key: 'CommonalertList' },
        { label: this.$t('dictionary.actions'), key: 'event-drawer' },
      ]
      return tabs
    },
    title () {
      const t = this.params.res_type || ''
      return t === 'guest' ? this.$t('common.server') : this.$t('dictionary.host')
    },
    resType () {
      return this.params.res_type
    },
  },
  methods: {
    listParams () {
      let params = {}
      if (typeof this.getParams === 'function') {
        params = this.getParams()
      } else {
        params = this.getParams || {}
      }
      return {
        ...params,
        res_type: this.detailData.res_type,
      }
    },
  },
}
</script>

<style scoped>

</style>
