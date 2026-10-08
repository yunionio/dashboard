<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('k8s.vc_priority_class')"
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
      :id="listId"
      :res-id="data.id"
      :data="detailData"
      :onManager="onManager"
      resource="priorityclasses"
      :getParams="getParams" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import Detail from './Detail'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'K8SPriorityClassSidePage',
  components: {
    Actions,
    Detail,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('k8s.text_217'), key: 'detail' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'event-drawer') {
        return {}
      }
      return { cluster: this.detailData.clusterID }
    },
    listId () {
      if (this.params.windowData.currentTab === 'event-drawer') {
        return 'EventListForK8SPriorityClassSidePage'
      }
      return ''
    },
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'K8SPriorityClassSidePage', {
        id: row.id,
        resource: 'priorityclasses',
        apiVersion: 'v1',
        getParams: () => ({
          cluster: row.clusterID,
        }),
      })
    },
  },
}
</script>
