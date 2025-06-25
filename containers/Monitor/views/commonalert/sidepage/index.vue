<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.commonalert')"
    icon="res-commonalerts"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions
        :options="singleActions"
        :row="detailData"
        button-type="link"
        button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :listId="listId"
      :id="listId"
      :resId="data.id"
      :alertId="data.id"
      :data="detailData"
      :resource="resource"
      :on-manager="onManager"
      :getParams="getParams" />
  </base-side-page>
</template>

<script>
import AlertrecortList from '@Monitor/views/alertrecord/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import CommonalertDetail from './Detail'

export default {
  name: 'CommonalertsSidePage',
  components: {
    CommonalertDetail,
    Actions,
    AlertrecortList,
  },
  mixins: [SidePageMixin, WindowsMixin, SingleActionsMixin, ColumnsMixin],
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForHostSidePage'
        case 'commonalert-detail':
          return 'CommonalertDetailSidePage'
        case 'AlertrecortList':
          return 'AlertrecortListSidePage'
        default:
          return ''
      }
    },
    detailTabs () {
      const tabs = [
        { label: this.$t('sidepage.tab.label.detail'), key: 'commonalert-detail' },
        { label: this.$t('dictionary.actions'), key: 'event-drawer' },
      ]
      // if (this.$store.getters.isAdminMode) {
      //   tabs.splice(1, 0, { label: this.$t('monitor.text_10'), key: 'AlertrecortList' })
      // }
      if (this.data.id) {
        tabs.splice(1, 0, { label: this.$t('monitor.text_10'), key: 'AlertrecortList' })
      }
      return tabs
    },
    getParams () {
      const param = {
        alert_id: this.data.id,
      }
      const { getParams = {} } = this.data
      const { used_by } = getParams
      if (used_by) {
        // 其他模块使用告警记录时，添加此参数进行区分
        param.used_by = used_by
      }
      return param
    },
  },
}
</script>
