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
            label: this.$t('compute.text_721'),
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
            label: this.$t('compute.text_498'),
            dropdown: true,
            items: [
              { label: this.$t('compute.text_22'), key: 'postpaid' },
              { label: this.$t('compute.text_23'), key: 'prepaid' },
            ],
          },
          account: getAccountFilter(),
          host: getHostFilter(),
          gpu: {
            label: this.$t('compute.text_175'),
            dropdown: true,
            items: [
              { label: this.$t('compute.text_1033'), key: false },
              { label: this.$t('compute.text_1034'), key: true },
            ],
          },
        },
        responseData: this.responseData,
      }),
      singleActions: [
        {
          label: this.$t('compute.text_723'),
          permission: 'server_perform_assign_secgroup',
          action: (obj) => {
            this.createDialog('UnbindSecgroupDialog', {
              data: [obj],
              detailData: this.data,
              columns: this.columns,
              title: this.$t('compute.text_723'),
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: (obj) => {
            const ret = { validate: false, tooltip: null }
            if (obj.secgroups && obj.secgroups.length === 1) {
              ret.tooltip = this.$t('compute.text_1026')
              return ret
            }
            ret.validate = ['running', 'ready'].includes(obj.status)
            return ret
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('compute.text_483', [this.$t('dictionary.server')]),
          permission: 'server_perform_assign_secgroup',
          action: () => {
            this.createDialog('SetServerDialog', {
              data: [this.data],
              columns: this.columns,
              title: this.$t('compute.text_483', [this.$t('dictionary.server')]),
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
        },
        {
          label: this.$t('compute.text_723'),
          permission: 'server_perform_assign_secgroup',
          action: () => {
            this.createDialog('UnbindSecgroupDialog', {
              data: this.list.selectedItems,
              detailData: this.data,
              columns: this.columns,
              title: this.$t('compute.text_723'),
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            const ret = { validate: false, tooltip: null }
            const isSomeOneSecgroup = this.list.selectedItems.some((obj) => obj.secgroups && obj.secgroups.length === 1)
            if (isSomeOneSecgroup) {
              ret.tooltip = this.$t('compute.text_1037')
              return ret
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
    exportDataOptions () {
      return {
        title: this.$t('dictionary.server'),
        downloadType: 'local',
        items: this.columns,
        fixedItems: [
          { key: 'metadata.os_distribution', label: this.$t('table.title.os') },
          { key: 'disk', label: this.$t('table.title.disk') + '(M)' },
          { key: 'vmem_size', label: this.$t('table.title.vmem_size') + '(M)' },
          { key: 'eip', title: this.$t('common.eip') },
          { key: 'ips', title: 'IP' },
          { key: 'is_gpu', title: `${this.$t('table.title.type')}(${this.$t('compute.text_113')}${this.$t('dictionary.server')})` },
        ],
        hiddenFields: ['os_dist', 'elastic_ip', 'ip'],
      }
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
    refresh () {
      this.list.refresh()
      this.$bus.$emit('secgroup-list-refresh')
    },
    getParam () {
      const ret = {
        details: true,
        with_meta: true,
        filter: 'hypervisor.notin(baremetal,container)',
        ...this.getParams,
      }
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
