<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="集群"
    icon="res-cluster"
    :res-name="data.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="params.resId" :data="data" :list="params.list" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import AgentList from '@Network/views/agent/components/List'
import LoadbalancerclusterDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'LoadbalancerclusterSidePage',
  components: {
    LoadbalancerclusterDetail,
    Actions,
    AgentList,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'Loadbalancercluster-detail' },
        { label: '节点', key: 'agent-list' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        cluster: this.detailData.id,
      }
    },
    data () {
      return this.params.list.data[this.params.resId].data
    },
  },
}
</script>
