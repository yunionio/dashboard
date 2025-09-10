<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.text_91')"
    icon="res-vminstance"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="filterDetailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions v-if="showActions">
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
      :id="listId"
      :getParams="componentParams"
      :on-manager="onManager"
      :show-create-action="false"
      :isPageDestroyed="isPageDestroyed"
      :hiddenColumns="hiddenColumns"
      :hiddenSingleActions="hiddenSingleActions"
      :hiddenActionKeys="['SetReserveResource']"
      :is-server="true"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
// import HostList from '@Compute/views/host/components/List'
import GpuList from '@Compute/views/gpu/components/List'
import ScheduledtasksList from '@Cloudenv/views/scheduledtask/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import { hasPermission } from '@/utils/auth'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'
import NetworkListForVmInstanceSidepage from './Network'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
// import { cloudEnabled, cloudUnabledTip } from '../utils'
import VmInstanceDetail from './Detail'
import VmInstanceMonitorSidepage from './Monitor'
import VmInstanceAlertSidepage from './Alert'
import VmSnapshotSidepage from './Snapshot'
import SecgroupList from './Secgroup'
import DiskListForVmInstanceSidepage from './DiskList'
// import DiskSnapshotListForVmInstanceSidepage from '@Compute/views/snapshot/components/List'
// import InstanceSnapshotListForVmInstanceSidepage from '@Compute/views/snapshot-instance/components/List'
// import EipListForVmInstanceSidepage from './EipList'

export default {
  name: 'VmInstanceSidePage',
  components: {
    Actions,
    VmInstanceDetail,
    NetworkListForVmInstanceSidepage,
    // DiskSnapshotListForVmInstanceSidepage,
    // InstanceSnapshotListForVmInstanceSidepage,
    DiskListForVmInstanceSidepage,
    SecgroupList,
    // HostList,
    VmInstanceMonitorSidepage,
    VmInstanceAlertSidepage,
    VmSnapshotSidepage,
    GpuList,
    ScheduledtasksList,
    // EipListForVmInstanceSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    let detailTabs = [
      { label: this.$t('compute.text_238'), key: 'vm-instance-detail' },
      { label: this.$t('compute.text_105'), key: 'secgroup-list' },
      // { label: '宿主机', key: 'host-list' },
      { label: this.$t('compute.text_104'), key: 'network-list-for-vm-instance-sidepage' },
      // { label: this.$t('compute.text_107'), key: 'eip-list-for-vm-instance-sidepage' },
      { label: this.$t('compute.text_376'), key: 'disk-list-for-vm-instance-sidepage' },
      { label: this.$t('compute.text_462'), key: 'vm-snapshot-sidepage' },
      // { label: this.$t('compute.text_101'), key: 'disk-snapshot-list-for-vm-instance-sidepage' },
      // { label: this.$t('compute.text_102'), key: 'instance-snapshot-list-for-vm-instance-sidepage' },
      { label: this.$t('compute.text_113'), key: 'gpu-list' },
      { label: this.$t('compute.text_608'), key: 'vm-instance-monitor-sidepage' },
      { label: this.$t('compute.text_1301'), key: 'vm-instance-alert-sidepage' },
      { label: this.$t('cloudenv.text_431'), key: 'scheduledtasks-list' },
      { label: this.$t('compute.text_240'), key: 'event-drawer' },
    ]
    if (!hasPermission({ key: 'guestsecgroups_list' }) || isScopedPolicyMenuHidden('server_hidden_columns.secgroups')) {
      detailTabs = detailTabs.filter(item => item.key !== 'secgroup-list')
    }
    if (!hasPermission({ key: 'guestnetworks_list' }) || isScopedPolicyMenuHidden('server_hidden_columns.ips')) {
      detailTabs = detailTabs.filter(item => item.key !== 'network-list-for-vm-instance-sidepage')
    }
    if (!hasPermission({ key: 'guestdisks_list' }) || isScopedPolicyMenuHidden('server_hidden_columns.disk')) {
      detailTabs = detailTabs.filter(item => item.key !== 'disk-list-for-vm-instance-sidepage')
    }
    if (!hasPermission({ key: 'eip_list' })) {
      detailTabs = detailTabs.filter(item => item.key !== 'eip-list-for-vm-instance-sidepage')
    }
    if (this.$store.getters.isProjectMode) {
      detailTabs = detailTabs.filter(item => item.key !== 'gpu-list')
    }
    if (isScopedPolicyMenuHidden('sub_hidden_menus.disk_snapshot') && isScopedPolicyMenuHidden('sub_hidden_menus.instance_snapshot')) {
      detailTabs = detailTabs.filter(item => item.key !== 'vm-snapshot-sidepage')
    }
    if (isScopedPolicyMenuHidden('sub_hidden_menus.scheduledtask')) {
      detailTabs = detailTabs.filter(item => item.key !== 'scheduledtasks-list')
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
      const tabs = ['secgroup-list', 'disk-list-for-vm-instance-sidepage']
      const snapshotsTabs = ['vm-snapshot-sidepage']
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
      if (this.params.windowData.currentTab === 'network-list-for-vm-instance-sidepage') {
        return {
          associate_id: this.detailData.id,
          detail: true,
        }
      }
      if (snapshotsTabs.includes(this.params.windowData.currentTab)) {
        return {
          server_id: this.detailData.id,
        }
      }
      if (this.params.windowData.currentTab === 'gpu-list') {
        return {
          guest_id: this.data.id,
        }
      }
      if (this.params.windowData.currentTab === 'scheduledtasks-list') {
        return {
          label: this.data.id,
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
        case 'network-list-for-vm-instance-sidepage':
          return 'NetworkListForVminstanceSidepage'
        case 'disk-list-for-vm-instance-sidepage':
          return 'DiskLiskForVminstanceSidepage'
        case 'secgroup-list':
          return 'SecgroupLiskForVminstanceSidepage'
        case 'vm-instance-alert-sidepage':
          return 'AlertLiskForVminstanceSidepage'
        case 'event-drawer':
          return 'EventListForVminstanceSidepage'
        case 'gpu-list':
          return 'GpuListForVminstanceSidePage'
        case 'scheduledtasks-list':
          return 'ScheduledtasksListForVminstancesidePage'
        // case 'eip-list-for-vm-instance-sidepage':
        //   return 'EipListForVmInstanceSidepage'
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
    showActions () {
      return !this.$isScopedPolicyMenuHidden('server_hidden_columns.perform_action')
    },
    filterDetailTabs () {
      return this.detailTabs.map(item => {
        if (!this.detailData.id) {
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
    this.initHiddenTab()
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
        this.detailTabs = this.detailTabs.filter(item => item.key !== 'gpu-list')
      }
      if (this.listRowData.brand === 'VolcEngine') {
        this.detailTabs = this.detailTabs.filter(item => item.key !== 'vm-snapshot-sidepage')
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
      } catch (e) {}
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
      } catch (e) {}
    },
  },
}
</script>
