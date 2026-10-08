<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('k8s.vc_queue')"
    icon="res-k8s-kubecluster"
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
      :is="params.windowData.currentTab"
      :key="params.windowData.currentTab"
      :id="listId"
      :res-id="data.id"
      :data="detailData"
      :onManager="onManager"
      resource="vcqueues"
      :getParams="getParams"
      :inSidepageNeedNamepsace="false"
      :showSearchbox="false"
      :showGroupActions="false" />
  </base-side-page>
</template>

<script>
import PodList from '@K8S/views/pod/components/List'
import VcjobList from '@K8S/views/vcjob/components/List'
import VcpodgroupList from '@K8S/views/vcpodgroup/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import Detail from './Detail'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'K8SVCQueueSidePage',
  components: {
    Actions,
    Detail,
    PodList,
    'vcjob-list': VcjobList,
    'vcpodgroup-list': VcpodgroupList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('k8s.text_217'), key: 'detail' },
        { label: this.$t('k8s.vc_job'), key: 'vcjob-list' },
        { label: this.$t('k8s.vc_podgroup'), key: 'vcpodgroup-list' },
        { label: this.$t('k8s.text_9'), key: 'pod-list' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      const cluster = this.detailData.clusterID
      const name = this.detailData.name
      const tab = this.params.windowData.currentTab
      if (tab === 'event-drawer') {
        return {}
      }
      if (tab === 'pod-list') {
        return {
          cluster,
          owner_kind: 'VolcanoQueue',
          owner_name: name,
        }
      }
      if (tab === 'vcjob-list' || tab === 'vcpodgroup-list') {
        return {
          cluster,
          queue: name,
        }
      }
      return { cluster }
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'vcjob-list':
          return 'JobListForK8SVCQueueSidePage'
        case 'vcpodgroup-list':
          return 'PodGroupListForK8SVCQueueSidePage'
        case 'pod-list':
          return 'PodListForK8SVCQueueSidePage'
        case 'event-drawer':
          return 'EventListForK8SVCQueueSidePage'
        default:
          return ''
      }
    },
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'K8SVCQueueSidePage', {
        id: row.id,
        resource: 'vcqueues',
        apiVersion: 'v1',
        getParams: () => ({
          cluster: row.clusterID,
        }),
      })
    },
  },
}
</script>
