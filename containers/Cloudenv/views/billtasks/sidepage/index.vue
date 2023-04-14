<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('cloudenv.bill_tasks')"
    icon="res-billtask"
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
      res-type="billtask"
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :id="listId"
      :data="detailData"
      :on-manager="onManager"
      :getParams="getParams" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import BilltaskDetail from './Detail'

export default {
  name: 'BilltaskSidePage',
  components: {
    BilltaskDetail,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('cloudenv.bill_tasks'), key: 'billtask-detail' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForBilltasksSidePage'
        default:
          return ''
      }
    },
  },
  created () {
    if (this.params.tab) this.handleTabChange(this.params.tab)
  },
}
</script>
