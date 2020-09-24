<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('k8s.text_393')"
    icon="res-k8s-rbacclusterrole"
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
      resource="federatedclusterroles"
      rulesPath="spec.template.rules"
      :serverColumns="columns"
      :res-id="data.id"
      :getParams="getParams"
      :on-manager="onManager"
      :title="$t('k8s.text_393')"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import K8sFederatedclusterroleDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import K8sAttachClusterList from '@K8S/sections/AccachClsuterSidepage'
import RoleRulesSidepage from '@K8S/sections/RoleRulesSidepage'

export default {
  name: 'K8SFederatedclusterroleSidePage',
  components: {
    Actions,
    K8sFederatedclusterroleDetail,
    K8sAttachClusterList,
    RoleRulesSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('k8s.text_217'), key: 'k8s-federatedclusterrole-detail' },
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
  },
}
</script>
