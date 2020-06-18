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
      :res-id="data.id"
      :data="detailData"
      :resource="resource"
      :on-manager="onManager" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import CommonalertDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'CommonalertsSidePage',
  components: {
    CommonalertDetail,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, SingleActionsMixin, ColumnsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'commonalert-detail' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
}
</script>
