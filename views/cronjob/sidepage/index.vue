<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="定时任务(CronJob)"
    icon="res-k8s-cronjob"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :key="params.windowData.currentTab" :res-id="data.id" :data="detailData" :onManager="onManager" resource="cronjobs" :getParams="getParams" :showSearchbox="false" :showGroupActions="false" />
  </base-side-page>
</template>

<script>
import EventsSidepage from '@K8S/sections/EventsSidepage'
import SourceInformationSidepage from '@K8S/sections/SourceInformationSidepage'
import JobList from '@K8S/views/job/components/List'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import Detail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'K8SCronJobsSidePage',
  components: {
    Actions,
    Detail,
    EventsSidepage,
    SourceInformationSidepage,
    ActiveJobs: JobList,
    InactiveJobs: JobList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'detail' },
        { label: '激活任务', key: 'active-jobs' },
        { label: '未激活任务', key: 'inactive-jobs' },
        { label: '事件', key: 'events-sidepage' },
        { label: '源信息', key: 'source-information-sidepage' },
      ],
    }
  },
  computed: {
    getParams () {
      const params = {
        owner_kind: this.detailData.kind,
        owner_name: this.detailData.name,
        namespace: this.detailData.namespace,
        cluster: this.detailData.clusterID,
      }
      if (this.params.windowData.currentTab === 'active-jobs') {
        params.active = true
      }
      if (this.params.windowData.currentTab === 'inactive-jobs') {
        params.active = false
      }
      return params
    },
  },
}
</script>
