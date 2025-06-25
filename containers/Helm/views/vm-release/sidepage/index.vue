<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('helm.text_77')"
    icon="res-vm-release"
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
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import Virtualmachine from './Virtualmachine'
import Detail from './Detail'

export default {
  name: 'VmReleaseSidePage',
  components: {
    Actions,
    Detail,
    Virtualmachine,
    K8s_ansibleplaybook,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      timer: null,
    }
  },
  computed: {
    detailTabs () {
      const detailTabs = [{ label: this.$t('helm.text_78'), key: 'detail' }]
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
      detailTabs.push({ label: this.$t('dictionary.actions'), key: 'event-drawer' })
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
  destroyed () {
    clearTimeout(this.timer)
    this.timer = null
  },
  methods: {
    fetchDataCallback () {
      if (R.is(Object, this.detailData.resources)) {
        clearTimeout(this.timer)
        this.timer = null
        const stableStatusMap = {
          virtualmachine: 'Running',
          k8s_ansibleplaybook: 'Finished',
        }
        const virtualmachineList = this.detailData.resources.virtualmachine || []
        const ansibleplaybookList = this.detailData.resources.k8s_ansibleplaybook || []
        const isStable1 = virtualmachineList.every(val => val.status === stableStatusMap.virtualmachine)
        const isStable2 = ansibleplaybookList.every(val => val.status === stableStatusMap.k8s_ansibleplaybook)
        if (!isStable1 || !isStable2) {
          this.timer = setTimeout(() => {
            this.fetchData()
          }, 10000)
        }
      }
    },
  },
}
</script>
