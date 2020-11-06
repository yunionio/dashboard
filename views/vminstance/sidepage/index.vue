<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.text_91')"
    icon="res-vminstance"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
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
      :data="detailData"
      :serverColumns="columns"
      :res-id="data.id"
      :id="listId"
      :getParams="componentParams"
      :on-manager="onManager"
      :show-create-action="false"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
// import HostList from '@Compute/views/host/components/List'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import { cloudEnabled, cloudUnabledTip } from '../utils'
import VmInstanceDetail from './Detail'
import VmInstanceMonitorSidepage from './Monitor'
import VmInstanceAlertSidepage from './Alert'
import VmSnapshotSidepage from './Snapshot'
import NetworkListForVmInstanceSidepage from '@Compute/views/networks/components/List'
// import DiskSnapshotListForVmInstanceSidepage from '@Compute/views/snapshot/components/List'
// import InstanceSnapshotListForVmInstanceSidepage from '@Compute/views/snapshot-instance/components/List'
import DiskListForVmInstanceSidepage from '@Compute/views/disk/components/List'
import SecgroupList from '@Compute/views/secgroup/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

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
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'vm-instance-detail' },
        { label: this.$t('compute.text_105'), key: 'secgroup-list' },
        // { label: '宿主机', key: 'host-list' },
        { label: this.$t('compute.text_104'), key: 'network-list-for-vm-instance-sidepage' },
        { label: this.$t('compute.text_376'), key: 'disk-list-for-vm-instance-sidepage' },
        { label: this.$t('compute.text_462'), key: 'vm-snapshot-sidepage' },
        // { label: this.$t('compute.text_101'), key: 'disk-snapshot-list-for-vm-instance-sidepage' },
        // { label: this.$t('compute.text_102'), key: 'instance-snapshot-list-for-vm-instance-sidepage' },
        { label: this.$t('compute.text_608'), key: 'vm-instance-monitor-sidepage' },
        { label: this.$t('compute.text_1301'), key: 'vm-instance-alert-sidepage' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
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
          detail: true,
        }
      }
      if (snapshotsTabs.includes(this.params.windowData.currentTab)) {
        return {
          server_id: this.detailData.id,
        }
      }
      return null
    },
    secgroupListActives () {
      const me = this
      const _ = {
        frontGroupActions: function () {
          return [
            {
              index: 1,
              label: this.$t('compute.text_1116'),
              permission: 'server_perform_add_secgroup',
              action: () => {
                this.createDialog('VmSetSecgroupDialog', {
                  vm: me,
                  data: [me.detailData],
                  columns: me.columns,
                  onManager: me.onManager,
                  refresh: () => {
                    this.refresh()
                  },
                })
              },
              meta: () => {
                const ret = {
                  validate: cloudEnabled('assignSecgroup', me.detailData),
                  tooltip: cloudUnabledTip('assignSecgroup', me.detailData),
                }
                return ret
              },
              hidden: this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_add_secgroup'),
            },
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
        default:
          return ''
      }
    },
  },
  methods: {
    beforeShowMenu () {
      return this.$store.dispatch('scopedPolicy/get', {
        category: ['vminstance_hidden_menus', 'vminstance_configured_callback_address'],
      })
    },
  },
}
</script>
