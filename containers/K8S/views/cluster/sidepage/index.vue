<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('k8s.text_19')"
    icon="res-k8s-kubecluster"
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
      :serverColumns="columns"
      :id="listId"
      :res-id="data.id"
      :getParams="getParams"
      :on-manager="onManager"
      taskResource="k8s-tasks"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import KubeMachineList from '@K8S/views/kube-machines/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import K8sClusterMonitor from './Monitor'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import KubeClusterDetail from './Detail'

export default {
  name: 'K8SClusterSidePage',
  components: {
    KubeClusterDetail,
    Actions,
    KubeMachineList,
    K8sClusterMonitor,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'kube-cluster-detail' },
        { label: this.$t('k8s.text_21'), key: 'kube-machine-list' },
        { label: this.$t('k8s.text_414'), key: 'k8s-cluster-monitor' },
        { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('k8s.text_202'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForK8SClusterSidePage'
        case 'kube-machine-list':
          return 'KubemachineListForK8SClusterSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
