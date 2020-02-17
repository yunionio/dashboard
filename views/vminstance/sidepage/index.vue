<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="虚拟机"
    icon="res-vminstance"
    :res-name="data.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" button-type="link" button-size="small" />
    </template>
    <component
      v-bind="listActives"
      :is="params.windowData.currentTab"
      :data="data"
      :list="params.list"
      :serverColumns="params.columns"
      :res-id="params.resId"
      :getParams="getParams"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SecgroupList from '@Compute/views/secgroup/components/List'
// import HostList from '@Compute/views/host/components/List'
import NetworkListForVmInstanceSidepage from '@Compute/views/networks/components/List'
import VmInstanceDetail from './Detail'
import DiskListForVmInstanceSidepage from './Disk'
import VmInstanceMonitorSidepage from './Monitor'
import VmInstanceAlertSidepage from './Alert'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'VmInstanceSidePage',
  components: {
    Actions,
    VmInstanceDetail,
    NetworkListForVmInstanceSidepage,
    DiskListForVmInstanceSidepage,
    SecgroupList,
    // HostList,
    VmInstanceMonitorSidepage,
    VmInstanceAlertSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'vm-instance-detail' },
        { label: '安全组', key: 'secgroup-list' },
        // { label: '宿主机', key: 'host-list' },
        { label: '网络', key: 'network-list-for-vm-instance-sidepage' },
        { label: '磁盘', key: 'disk-list-for-vm-instance-sidepage' },
        { label: '监控', key: 'vm-instance-monitor-sidepage' },
        { label: '报警', key: 'vm-instance-alert-sidepage' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    data () {
      const _data = this.params.list.data[this.params.resId].data || {}
      _data['cloudregion'] = _data['region']
      return _data
    },
    getParams () {
      if (this.params.windowData.currentTab === 'secgroup-list') {
        return {
          detail: true,
          server: this.params.resId,
        }
      }
      if (this.params.windowData.currentTab === 'host-list') {
        return {
          detail: true,
          id: this.data.host_id,
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
              label: '关联安全组',
              permission: 'server_perform_add_secgroup',
              action: () => {
                this.createDialog('VmSetSecgroupDialog', {
                  data: [me.data],
                  columns: me.params.columns,
                  list: me.params.list,
                  callback: () => {
                    this.list.fetchData()
                  },
                })
              },
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
  },
}
</script>
