<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('k8s.text_295')"
    icon="res-k8s-namespace"
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
      resource="namespaces"
      :serverColumns="columns"
      :res-id="data.id"
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
import K8sNamespaceDetail from './Detail'
import SourceInformationSidepage from '@K8S/sections/SourceInformationSidepage'
import EventsSidepage from '@K8S/sections/EventsSidepage'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'K8SNamespaceSidePage',
  components: {
    Actions,
    K8sNamespaceDetail,
    EventsSidepage,
    SourceInformationSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('k8s.text_217'), key: 'k8s-namespace-detail' },
        { label: this.$t('k8s.text_218'), key: 'events-sidepage' },
        { label: this.$t('k8s.text_219'), key: 'source-information-sidepage' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
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
