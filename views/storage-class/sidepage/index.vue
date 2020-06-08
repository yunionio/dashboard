<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="存储类(Storageclasses)"
    icon="res-k8s-storageclass"
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
      resource="storageclasses"
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
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import K8sStorageclassDetail from './Detail'
import SourceInformationSidepage from '@K8S/sections/SourceInformationSidepage'
import EventsSidepage from '@K8S/sections/EventsSidepage'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'K8SStorageclassSidePage',
  components: {
    Actions,
    K8sStorageclassDetail,
    EventsSidepage,
    SourceInformationSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'k8s-storageclass-detail' },
        { label: '事件', key: 'events-sidepage' },
        { label: '源信息', key: 'source-information-sidepage' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        owner_kind: this.detailData.kind,
        owner_name: this.detailData.name,
        namespace: this.detailData.namespace,
        cluster: this.detailData.clusterID,
      }
    },
  },
}
</script>
