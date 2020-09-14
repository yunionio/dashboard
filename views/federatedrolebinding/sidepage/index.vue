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
      :resId="detailData.id"
      resource="federatedrolebindings"
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
import K8sFederatedrolebindingDetail from './Detail'
import K8sAttachClusterList from '@K8S/sections/AccachClsuterSidepage'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'K8SFederatedrolebindingSidePage',
  components: {
    Actions,
    K8sFederatedrolebindingDetail,
    K8sAttachClusterList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('k8s.text_217'), key: 'k8s-federatedrolebinding-detail' },
        { label: this.$t('k8s.text_369'), key: 'k8s-attach-cluster-list' },
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
