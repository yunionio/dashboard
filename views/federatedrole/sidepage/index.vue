<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('k8s.text_397')"
    icon="res-k8s-rbacrole"
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
      resource="federatedroles"
      rulesPath="spec.template.rules"
      :serverColumns="columns"
      :res-id="data.id"
      :id="listId"
      :getParams="getParams"
      :on-manager="onManager"
      :title="$t('k8s.text_397')"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import K8sFederatedroleDetail from './Detail'
import K8sAttachClusterList from '@K8S/sections/AccachClsuterSidepage'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import RoleRulesSidepage from '@K8S/sections/RoleRulesSidepage'

export default {
  name: 'K8SFederatedroleSidePage',
  components: {
    Actions,
    K8sFederatedroleDetail,
    K8sAttachClusterList,
    RoleRulesSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('k8s.text_217'), key: 'k8s-federatedrole-detail' },
        { label: this.$t('k8s.text_378'), key: 'role-rules-sidepage' },
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
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForK8SFederatedroleSidePage'
        case 'k8s-attach-cluster-list':
          return 'AttachClusterListForK8SFederatedroleSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
