<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.vminstance-container')"
    icon="res-vminstance"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="filterDetailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions
        :options="singleActions"
        :row="detailData"
        :before-show-menu="beforeShowMenu"
        button-type="link"
        button-size="small" />
    </template>
    <component
      v-bind="listActives"
      :is="params.windowData.currentTab"
      :data="componentData"
      :serverColumns="columns"
      :res-id="data.id"
      :monitor-res-id="data.id"
      :id="listId"
      :getParams="componentParams"
      :on-manager="onManager"
      :show-create-action="false"
      :isPageDestroyed="isPageDestroyed"
      taskResource="compute-tasks"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import * as R from 'ramda'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import GpuList from '@Compute/views/gpu/components/List'
import ContainerList from '@Compute/views/pod-container/components/List'
import Detail from './Detail'
import SecgroupList from './Secgroup'
// import Terminal from './Terminal'
import NetworkList from './Network'
import DiskList from './DiskList'
import Monitor from './Monitor'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'VmContainerInstanceSidePage',
  components: {
    Actions,
    Detail,
    ContainerList,
    NetworkList,
    DiskList,
    SecgroupList,
    Monitor,
    GpuList,
    // Terminal,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    let detailTabs = [
      { label: this.$t('compute.text_238'), key: 'detail' },
      { label: this.$t('compute.container', []), key: 'container-list' },
      { label: this.$t('compute.text_105'), key: 'secgroup-list' },
      { label: this.$t('compute.text_104'), key: 'network-list' },
      { label: this.$t('compute.text_376'), key: 'disk-list' },
      { label: this.$t('compute.text_113'), key: 'gpu-list' },
      { label: this.$t('compute.text_608'), key: 'monitor' },
      { label: this.$t('table.title.task'), key: 'task-drawer' },
      // { label: this.$t('compute.repo.terminal'), key: 'terminal' },
      { label: this.$t('compute.text_240'), key: 'event-drawer' },
    ]
    if (this.$store.getters.isProjectMode) {
      detailTabs = R.remove(R.findIndex(R.propEq('key', 'gpu-list'))(detailTabs), 1, detailTabs)
    }
    return {
      detailTabs,
      agent_status: '',
      agent_fail_reason: '',
      agent_fail_code: '',
      isPageDestroyed: false,
    }
  },
  computed: {
    componentParams () {
      const tabs = ['secgroup-list', 'disk-list']

      if (tabs.includes(this.params.windowData.currentTab)) {
        return {
          detail: true,
          server: this.detailData.id,
        }
      }
      if (this.params.windowData.currentTab === 'host-list') {
        return {
          detail: true,
          id: this.detailData.host_id,
        }
      }
      if (this.params.windowData.currentTab === 'network-list') {
        return {
          associate_id: this.detailData.id,
          detail: true,
        }
      }
      if (this.params.windowData.currentTab === 'gpu-list') {
        return {
          guest_id: this.data.id,
        }
      }
      return null
    },
    secgroupListActives () {
      // const me = this
      const _ = {
        frontGroupActions: function () {
          return [
            // {
            //   index: 1,
            //   label: this.$t('compute.text_1116'),
            //   permission: 'server_perform_add_secgroup',
            //   action: () => {
            //     this.createDialog('VmSetSecgroupDialog', {
            //       vm: me,
            //       data: [me.detailData],
            //       columns: me.columns,
            //       onManager: me.onManager,
            //       refresh: () => {
            //         this.refresh()
            //       },
            //     })
            //   },
            //   meta: () => {
            //     const ret = {
            //       validate: cloudEnabled('assignSecgroup', me.detailData),
            //       tooltip: cloudUnabledTip('assignSecgroup', me.detailData),
            //     }
            //     return ret
            //   },
            //   hidden: this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_add_secgroup'),
            // },
          ]
        },
      }
      return _
    },
    listActives () {
      const _ = {
        'secgroup-list': this.secgroupListActives,
      }
      return _[this.params.windowData.currentTab] || {}
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'network-list':
          return 'NetworkListForVmContainerInstanceSidePage'
        case 'disk-list':
          return 'DiskLiskForVmContainerInstanceSidePage'
        case 'secgroup-list':
          return 'SecgroupLiskForVmContainerInstanceSidePage'
        case 'event-drawer':
          return 'EventListForVmContainerInstanceSidePage'
        case 'gpu-list':
          return 'GpuListForVmContainerInstanceSidePage'
        case 'container-list':
          return 'ContainerListForVmContainerInstanceSidePage'
        default:
          return ''
      }
    },
    componentData () {
      return Object.assign({}, this.detailData, { agent_status: this.agent_status, agent_fail_reason: this.agent_fail_reason, agent_fail_code: this.agent_fail_code })
    },
    hiddenColumns () {
      if (this.params.windowData.currentTab === 'scheduledtasks-list') {
        return ['resource_type', 'labels']
      }
      return []
    },
    hiddenSingleActions () {
      return this.params.windowData.currentTab === 'scheduledtasks-list'
    },
    filterDetailTabs () {
      return this.detailTabs.map(item => {
        if (!this.detailData.id) {
          return {
            ...item,
            disabled: true,
          }
        }
        if (item.key === 'terminal' && this.detailData.status !== 'running') {
          return {
            ...item,
            disabled: true,
          }
        }
        return item
      })
    },
  },
  created () {
    this.initChangeTab()
    this.$bus.$on('agentStatusQuery', (val) => {
      if (this.agent_status === 'failed') {
        this.agent_status = 'applying'
      }
      this.handleInstallTask({
        script_apply_id: val,
      })
    })
  },
  beforeDestroy () {
    this.isPageDestroyed = true
  },
  methods: {
    initHiddenTab () {
      if (this.listRowData.brand !== 'OneCloud') {
        this.detailTabs = R.remove(R.findIndex(R.propEq('key', 'gpu-list'))(this.detailTabs), 1, this.detailTabs)
      }
    },
    initChangeTab () {
      if (this.params.tab) {
        this.handleTabChange(this.params.tab)
      }
    },
    async fetchDataCallback () {
      try {
        if (!this.data.data) return
        const { data: { data = [] } } = await new this.$Manager('scriptapplyrecords').list({ params: { server_id: this.data.data.id, details: false, limit: 1 } })
        if (data[0]) {
          this.agent_status = data[0].status
          if (data[0].status === 'applying') {
            if (!this.componentData.id) return
            this.handleInstallTask({
              server_id: this.componentData.id,
              details: false,
              limit: 1,
            })
          } else if (data[0].status === 'failed') {
            this.agent_fail_reason = data[0].reason
            this.agent_fail_code = data[0].fail_code || ''
          }
        }
      } catch (e) { }
    },
    beforeShowMenu () {
      return this.$store.dispatch('scopedPolicy/get', {
        category: ['vminstance_hidden_menus', 'vminstance_configured_callback_address', 'disk_hidden_menus'],
      })
    },
    async handleInstallTask (params) {
      try {
        let maxTry = 60
        while (maxTry > 0) {
          if (this.isPageDestroyed) {
            break
          }
          const { data: { data = [] } } = await new this.$Manager('scriptapplyrecords').list({ params: params })
          if (data[0]) {
            if (data[0].status === 'succeed' || data[0].status === 'failed') {
              this.agent_status = data[0].status
              this.agent_fail_reason = data[0].reason
              this.agent_fail_code = data[0].fail_code || ''
              break
            }
          }
          maxTry -= 1
          await new Promise(resolve => setTimeout(resolve, 6000))
        }
      } catch (e) { }
    },
    handleOpenSidepage (row, tab) {
      this.handleTabChange(tab)
    },
  },
}
</script>
