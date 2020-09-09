<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('helm.text_77')"
    icon="res-k8s-release"
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
      :res-id="data.id"
      :data="detailData"
      :onManager="onManager"
      resource="releases"
      :getParams="getParams"
      :responseData="responseData"
      :showSearchbox="false"
      :showGroupActions="false"
      :getResponseData="fetchData" />
  </base-side-page>
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import Detail from './Detail'
import Statefulset from '@K8S/views/statefulset/components/List'
import Deployment from '@K8S/views/deployment/components/List'
import Secret from '@K8S/views/secret/components/List'
import Configmap from '@K8S/views/configmap/components/List'
import Daemonset from '@K8S/views/daemonset/components/List'
import Clusterrole from '@K8S/views/rbacrole/components/List'
import Clusterrolebinding from '@K8S/views/rbacrolebinding/components/List'
import Serviceaccount from '@K8S/views/service-account/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'K8SReleaseSidePage',
  components: {
    Actions,
    Detail,
    Statefulset,
    Deployment,
    Secret,
    Configmap,
    Daemonset,
    Clusterrole,
    Clusterrolebinding,
    Serviceaccount,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  computed: {
    detailTabs () {
      const detailTabs = [{ label: this.$t('helm.text_78'), key: 'detail' }]
      if (!this.detailData.resources) return detailTabs
      const allResourceArr = [
        { label: this.$t('helm.text_79'), key: 'deployment' },
        { label: this.$t('helm.text_80'), key: 'statefulset' },
        { label: this.$t('helm.text_81'), key: 'configmap' },
        { label: this.$t('helm.text_82'), key: 'secret' },
        { label: this.$t('helm.text_83'), key: 'daemonset' },
        { label: this.$t('helm.text_84'), key: 'clusterrole' },
        { label: this.$t('helm.text_85'), key: 'clusterrolebinding' },
        { label: this.$t('helm.text_86'), key: 'serviceaccount' },
      ]
      allResourceArr.forEach(item => {
        const resource = item.key
        if (R.is(Array, this.detailData.resources[resource])) {
          detailTabs.push(item)
        }
      })
      return detailTabs
    },
    responseData () {
      const data = {
        data: [],
      }
      if (this.detailData.resources && this.params.windowData.currentTab) {
        data.data = this.detailData.resources[this.params.windowData.currentTab]
      }
      return data
    },
    getParams () {
      return {
        namespace: this.detailData.namespace,
        cluster: this.detailData.clusterID,
      }
    },
  },
  watch: {
    detailTabs (val) {
      if (!val.find(v => v.key === this.params.windowData.currentTab)) {
        this.params.windowData.currentTab = this.detailTabs.length ? this.detailTabs[0].key : ''
      }
    },
  },
}
</script>
