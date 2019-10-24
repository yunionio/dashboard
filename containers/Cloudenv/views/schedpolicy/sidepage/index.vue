<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="调度策略"
    icon="onecloud"
    :res-name="data.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" :buttonMode="false" />
    </template>
    <component :is="params.windowData.currentTab" :data="data" :res-id="params.resId" :list="params.list" />
  </base-side-page>
</template>

<script>
import SchedpolicyDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'SchedpolicySidePage',
  components: {
    Actions,
    SchedpolicyDetail,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'schedpolicy-detail' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    data () {
      return this.params.list.data[this.params.resId].data
    },
  },
}
</script>
