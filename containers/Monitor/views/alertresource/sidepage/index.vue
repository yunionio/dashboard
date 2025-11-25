<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('monitor.text_17')"
    icon="res-alertresource"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <!-- <template v-slot:actions>
      <actions
        :options="singleActions"
        :row="detailData"
        button-type="link"
        button-size="small" />
    </template> -->
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
// import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import CommonalertDetail from './Detail'

export default {
  name: 'AlertResourceSidePage',
  components: {
    CommonalertDetail,
    Actions,
    AlertrecortList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin],
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
      ]
      if (this.data.id) {
        tabs.splice(1, 0, { label: this.$t('monitor.text_10'), key: 'AlertrecortList' })
      }
      return tabs
    },
    getParams () {
      const param = {
        alert_id: this.params.options.alert_id,
      }
      if (this.params.windowData.currentTab === 'AlertrecortList') {
        param.res_id = this.data.id
      }
      return param
    },
  },
}
</script>
