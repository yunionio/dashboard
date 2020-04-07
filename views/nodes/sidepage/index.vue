<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="节点"
    icon="res-vminstance"
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
      :data="detailData"
      resource="k8s_nodes"
      :serverColumns="columns"
      :res-id="data.name"
      :getParams="getParams"
      :on-manager="onManager"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import StatusSidepage from '@K8S/sections/StatusSidepage'
import EventsSidepage from '@K8S/sections/EventsSidepage'
import SourceInformationSidepage from '@K8S/sections/SourceInformationSidepage'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import K8sNodeDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'K8SNodeSidePage',
  components: {
    Actions,
    K8sNodeDetail,
    StatusSidepage,
    EventsSidepage,
    SourceInformationSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'k8s-node-detail' },
        { label: '状态', key: 'status-sidepage' },
        { label: '事件', key: 'events-sidepage' },
        { label: '源信息', key: 'source-information-sidepage' },
      ],
    }
  },
  computed: {
    getParams () {
      return null
    },
  },
}
</script>
