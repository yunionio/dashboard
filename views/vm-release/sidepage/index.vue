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
      :fetchData="fetchData"
      :responseData="responseData"
      :showSearchbox="false"
      :showGroupActions="false"
      :getResponseData="fetchData" />
  </base-side-page>
</template>

<script>
import * as R from 'ramda'
import K8s_ansibleplaybook from '@Helm/views/k8s-ansibleplaybook/components/List'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import Virtualmachine from './Virtualmachine'
import Detail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'VmReleaseSidePage',
  components: {
    Actions,
    Detail,
    Virtualmachine,
    K8s_ansibleplaybook,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  computed: {
    detailTabs () {
      const detailTabs = [{ label: '详情', key: 'detail' }]
      if (!this.detailData.resources) return detailTabs
      const allResourceArr = [
        { label: this.$t('dictionary.server'), key: 'virtualmachine' },
        { label: this.$t('dictionary.ansibleplaybook'), key: 'k8s_ansibleplaybook' },
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
  methods: {
    fetchDataCallback () {
      this.$nextTick(() => {
        if (this.responseData && R.is(Array, this.responseData.data)) {
          const stableStatusMap = {
            virtualmachine: 'Running',
            k8s_ansibleplaybook: 'Finished',
          }
          const stableStatus = stableStatusMap[this.currentTab]
          const isStable = this.responseData.data.every(val => val.status === stableStatus)
          if (!isStable) {
            this.timer = setTimeout(() => {
              this.fetchData()
            }, 5000)
          }
        }
      })
    },
  },
}
</script>
