<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="发布(Release)"
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
import Statefulset from '@K8S/views/statefulset/components/List'
import Deployment from '@K8S/views/deployment/components/List'
import Secret from '@K8S/views/secret/components/List'
import Configmap from '@K8S/views/configmap/components/List'
import Daemonset from '@K8S/views/daemonset/components/List'
import Rbacrole from '@K8S/views/rbacrole/components/List'
import Rbacrolebinding from '@K8S/views/rbacrolebinding/components/List'
import Serviceaccount from '@K8S/views/service-account/components/List'
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import Detail from './Detail'
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
    Rbacrole,
    Rbacrolebinding,
    Serviceaccount,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  computed: {
    detailTabs () {
      const detailTabs = [{ label: '详情', key: 'detail' }]
      if (!this.detailData.resources) return detailTabs
      const allResourceArr = [
        { label: '无状态', key: 'deployment' },
        { label: '有状态', key: 'statefulset' },
        { label: '配置项', key: 'configmap' },
        { label: '保密字典', key: 'secret' },
        { label: '守护进程', key: 'daemonset' },
        { label: '角色', key: 'rbacrole' },
        { label: '角色绑定', key: 'rbacrolebinding' },
        { label: '服务账户', key: 'serviceaccount' },
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
