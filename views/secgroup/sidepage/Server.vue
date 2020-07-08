<template>
  <page-list
    show-tag-filter
    show-tag-columns
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { mapGetters } from 'vuex'
import ColumnMixin from '@Compute/views/vminstance/mixins/columns'
import ListMixin from '@/mixins/list'
import {
  getNameFilter,
  getBrandFilter,
  getStatusFilter,
  getTenantFilter,
  getAccountFilter,
  getIpFilter,
  getHostFilter,
} from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ServerList',
  mixins: [WindowsMixin, ListMixin, ColumnMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    cloudEnv: String,
    data: Object,
  },
  data () {
    return {
      hideColumnFields: ['is_gpu', 'instance_type', 'os_type', 'host', 'account'],
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'servers',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.server).flat(),
        filterOptions: {
          name: getNameFilter(),
          brand: getBrandFilter('compute_engine_brands'),
          ips: getIpFilter(),
          status: getStatusFilter('server'),
          os_type: {
            label: '系统类型',
            dropdown: true,
            multiple: true,
            items: [
              { label: 'Windows', key: 'windows' },
              { label: 'Linux', key: 'linux' },
              { label: 'VMware', key: 'VMWare' },
            ],
            filter: true,
            formatter: val => {
              return `os_type.in(${val})`
            },
          },
          tenant: getTenantFilter(),
          billing_type: {
            label: '计费方式',
            dropdown: true,
            items: [
              { label: '按量付费', key: 'postpaid' },
              { label: '包年包月', key: 'prepaid' },
            ],
          },
          account: getAccountFilter(),
          host: getHostFilter(),
          gpu: {
            label: '类型',
            dropdown: true,
            items: [
              { label: '通用云服务器', key: false },
              { label: 'GPU云服务器', key: true },
            ],
          },
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '外部ID', key: 'external_id' },
          { label: '名称', key: 'name' },
          { label: '私网IP', key: 'ips' },
          { label: '外网IP', key: 'eip' },
          { label: 'CPU', key: 'vcpu_count' },
          { label: '内存(MB)', key: 'vmem_size' },
          { label: '磁盘(MB)', key: 'disk' },
          { label: '实例类型', key: 'instance_type' },
          { label: '操作系统', key: 'os_distribution' },
          { label: '状态', key: 'status' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '平台', key: 'hypervisor' },
          { label: '宿主机', key: 'host' },
          { label: '云账号', key: 'manager' },
          { label: '区域', key: 'region' },
          { label: '可用区', key: 'zone' },
          { label: '计费方式', key: 'billing_type' },
          { label: '用户标签', key: 'user_tags' },
        ],
      },
      singleActions: [
        {
          label: '解绑',
          permission: 'server_perform_assign_secgroup',
          action: (obj) => {
            this.createDialog('UnbindSecgroupDialog', {
              data: [obj],
              detailData: this.data,
              columns: this.columns,
              title: '解绑',
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: (obj) => {
            const ret = {
              validate: false,
              tooltip: null,
            }
            ret.validate = ['running', 'ready'].includes(obj.status)
            return ret
          },
        },
      ],
      groupActions: [
        {
          label: `关联${this.$t('dictionary.server')}`,
          permission: 'server_perform_assign_secgroup',
          action: () => {
            this.createDialog('SetServerDialog', {
              data: [this.data],
              columns: this.columns,
              title: `关联${this.$t('dictionary.server')}`,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
        },
        {
          label: '解绑',
          permission: 'server_perform_assign_secgroup',
          action: () => {
            this.createDialog('UnbindSecgroupDialog', {
              data: this.list.selectedItems,
              detailData: this.data,
              columns: this.columns,
              title: '解绑',
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            const ret = {
              validate: false,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0 && this.list.selectedItems.every(item => ['running', 'ready'].includes(item.status))
            return ret
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode']),
    isSameHyper () {
      if (this.list.selectedItems.length > 0) {
        const arr = this.list.selectedItems.map(v => v.hypervisor)
        const noRepeatArr = Array.from(new Set(arr))
        return noRepeatArr.length === 1
      }
      return true
    },
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.initSidePageTab('vm-instance-detail')
    this.list.fetchData()
    this.$bus.$on('VMInstanceListSingleUpdate', args => {
      this.list.singleUpdate(...args)
    }, this)
    this.$bus.$on('VMInstanceListSingleRefresh', args => {
      this.list.singleRefresh(...args)
    }, this)
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        with_meta: true,
        filter: 'hypervisor.notin(baremetal,container)',
        ...this.getParams,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'VmInstanceSidePage', {
        id: row.id,
        resource: 'servers',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.server).flat(),
      }, {
        list: this.list,
      })
    },
    openVmSetDurationDialog (obj) {
      this.createDialog('VmSetDurationDialog', {
        data: [obj],
        columns: this.columns,
        onManager: this.onManager,
        refresh: this.refresh,
      })
    },
  },
}
</script>
