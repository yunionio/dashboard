<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('k8s.text_226')"
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
    <component :is="params.windowData.currentTab" :key="params.windowData.currentTab" :id="listId" :res-id="data.id" :data="detailData" :onManager="onManager" resource="cronjobs" :getParams="getParams" :showSearchbox="false" :showGroupActions="false" />
  </base-side-page>
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import Detail from './Detail'
import EventsSidepage from '@K8S/sections/EventsSidepage'
import SourceInformationSidepage from '@K8S/sections/SourceInformationSidepage'
import JobList from '@K8S/views/job/components/List'
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
        { label: this.$t('k8s.text_217'), key: 'detail' },
        { label: this.$t('k8s.text_227'), key: 'active-jobs' },
        { label: this.$t('k8s.text_228'), key: 'inactive-jobs' },
        { label: this.$t('k8s.text_218'), key: 'events-sidepage' },
        { label: this.$t('k8s.text_219'), key: 'source-information-sidepage' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
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
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForK8SCronJobsSidePage'
        case 'active-jobs':
          return 'ActiveJobsForK8SCronJobsSidePage'
        case 'inactive-jobs':
          return 'InactiveJobsForK8SCronJobsSidePage'
        case 'events-sidepage':
          return 'EventsForK8SCronJobsSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
