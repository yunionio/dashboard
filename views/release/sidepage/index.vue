<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="发布(Release)"
    icon="res-group"
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
      :responseData="responseData" />
  </base-side-page>
</template>

<script>
import StatefulsetList from '@K8S/views/statefulset/components/List'
import DeploymentList from '@K8S/views/deployment/components/List'
import SecretList from '@K8S/views/secret/components/List'
import ConfigmapList from '@K8S/views/configmap/components/List'
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
    StatefulsetList,
    DeploymentList,
    SecretList,
    ConfigmapList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'detail' },
        { label: '有状态', key: 'statefulset-list' },
        { label: '无状态', key: 'deployment-list' },
        { label: '配置项', key: 'configmap-list' },
        { label: '保密字典', key: 'secret-list' },
      ],
    }
  },
  computed: {
    responseData () {
      const data = {}
      const tab = this.params.windowData.currentTab
      switch (tab) {
        case 'statefulset-list':
          data.data = this.detailData.resources.statefulsets
          break
        case 'deployment-list':
          data.data = this.detailData.resources.deployments
          break
        case 'configmap-list':
          data.data = this.detailData.resources.configmaps
          break
        case 'secret-list':
          data.data = this.detailData.resources.secrets
          break
        default:
          data.data = []
      }
      return data
    },
  },
}
</script>
