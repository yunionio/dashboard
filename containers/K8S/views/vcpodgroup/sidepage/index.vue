<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('k8s.vc_podgroup')"
    icon="res-k8s-pod"
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
      :onOpen="openRelated"
      resource="vcpodgroups"
      :getParams="getParams"
      :showSearchbox="false"
      :showGroupActions="false" />
  </base-side-page>
</template>

<script>
import PodList from '@K8S/views/pod/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import { openVolcanoSidePage } from '@K8S/utils/volcano'
import Detail from './Detail'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'K8SVCPodGroupSidePage',
  components: {
    Actions,
    Detail,
    PodList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('k8s.text_217'), key: 'detail' },
        { label: this.$t('k8s.text_9'), key: 'pod-list' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      const cluster = this.detailData.clusterID
      const namespace = this.detailData.namespace
      if (this.params.windowData.currentTab === 'event-drawer') {
        return {}
      }
      if (this.params.windowData.currentTab === 'pod-list') {
        return {
          cluster,
          namespace,
          owner_kind: 'VolcanoPodGroup',
          owner_name: this.detailData.name,
        }
      }
      return { cluster, namespace }
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'pod-list':
          return 'PodListForK8SVCPodGroupSidePage'
        case 'event-drawer':
          return 'EventListForK8SVCPodGroupSidePage'
        default:
          return ''
      }
    },
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'K8SVCPodGroupSidePage', {
        id: row.id,
        resource: 'vcpodgroups',
        apiVersion: 'v1',
        getParams: () => ({
          cluster: row.clusterID,
          namespace: row.namespace,
        }),
      })
    },
    openRelated ({ sidePage, resource, name, namespace }) {
      return openVolcanoSidePage(this, {
        sidePage,
        resource,
        name,
        cluster: this.detailData.clusterID,
        namespace,
      })
    },
  },
}
</script>
