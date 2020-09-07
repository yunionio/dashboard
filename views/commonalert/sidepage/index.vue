<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.commonalert')"
    icon="res-commonalert"
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
      :resId="data.id"
      :alertId="data.id"
      :data="detailData"
      :resource="resource"
      :on-manager="onManager" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import CommonalertDetail from './Detail'
import Commonalertrecord from './Alertrecord'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'CommonalertsSidePage',
  components: {
    CommonalertDetail,
    Actions,
    Commonalertrecord,
  },
  mixins: [SidePageMixin, WindowsMixin, SingleActionsMixin, ColumnsMixin],
  computed: {
    detailTabs () {
      const tabs = [
        { label: this.$t('sidepage.tab.label.detail'), key: 'commonalert-detail' },
        { label: this.$t('dictionary.actions'), key: 'event-drawer' },
      ]
      if (this.$store.getters.isAdminMode) {
        tabs.splice(1, 0, { label: this.$t('monitor.text_10'), key: 'commonalertrecord' })
      }
      return tabs
    },
  },
}
</script>
